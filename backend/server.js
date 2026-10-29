require("dotenv").config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const User = require('./src/models/user.js');
const { verifyToken } = require('./src/utils/jwt.js');
const { register: registerRoomAccess, canJoin } = require('./src/socket/roomAccess.js');
const registerDmHandlers = require('./src/socket/dmSocket.js');

const allowed = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
app.set('io', io);
const MAX_CHAT_MESSAGES = 200;
const MAX_MESSAGE_LENGTH = 2000;
const roomChats = new Map();
const normalizeRoomId = (id) => (typeof id === 'string' ? id.trim().toLowerCase() : '');

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (token) {
      const payload = verifyToken(token);
      const user = await User.findById(payload.id);
      if (user) socket.user = { id: user.id, name: user.name };
    }
  } catch (err) {
    socket.user = null;
  }
  next();
});

io.on('connection', (socket) => {
  registerRoomAccess(io, socket);
  registerDmHandlers(io, socket);

  const clearChatIfEmpty = (roomId) => {
    const members = io.sockets.adapter.rooms.get(roomId);
    if (!members || members.size === 0) roomChats.delete(roomId);
  };

  const leaveCurrentRoom = () => {
    if (socket.roomId) {
      const roomId = socket.roomId;
      socket.to(roomId).emit('user-left', { socketId: socket.id });
      socket.leave(roomId);
      socket.roomId = null;
      clearChatIfEmpty(roomId);
    }
  };

  socket.on('join-room', async ({ roomId: rawRoomId, userId } = {}) => {
    const roomId = normalizeRoomId(rawRoomId);
    if (!roomId) return;
    if (!socket.user || !(await canJoin(roomId, socket.user.id))) {
      return socket.emit('join-denied', { reason: 'not-allowed' });
    }
    leaveCurrentRoom();
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userId = userId;

    const existingUsers = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
      .filter((id) => id !== socket.id)
      .map((id) => {
        const other = io.sockets.sockets.get(id);
        return { socketId: id, userId: other?.userId, name: other?.user?.name };
      });

    socket.emit('existing-users', existingUsers);
    socket.emit('chat:history', roomChats.get(roomId) || []);
    socket.to(roomId).emit('user-joined', { socketId: socket.id, userId, name: socket.user?.name });
  });

  socket.on('offer',  ({ to, offer })     => io.to(to).emit('offer',  { from: socket.id, offer }));
  socket.on('answer', ({ to, answer })    => io.to(to).emit('answer', { from: socket.id, answer }));
  socket.on('ice-candidate', ({ to, candidate }) =>
    io.to(to).emit('ice-candidate', { from: socket.id, candidate }));

  socket.on('chat:send', ({ roomId: rawRoomId, message } = {}) => {
    const roomId = normalizeRoomId(rawRoomId);
    if (!roomId || socket.roomId !== roomId || !socket.user) return;
    if (typeof message !== 'string' || !message.trim()) return;
    const payload = {
      id: `${Date.now()}-${socket.id}-${Math.random().toString(36).slice(2, 8)}`,
      senderId: socket.user.id,
      senderName: socket.user.name,
      message: message.trim().slice(0, MAX_MESSAGE_LENGTH),
      created_at: new Date().toISOString(),
    };
    const history = roomChats.get(roomId) || [];
    history.push(payload);
    if (history.length > MAX_CHAT_MESSAGES) history.shift();
    roomChats.set(roomId, history);
    io.to(roomId).emit('chat:receive', payload);
  });

  socket.on('leave-room', leaveCurrentRoom);
  socket.on('disconnect', leaveCurrentRoom);
});


server.listen(process.env.PORT||5000, () => console.log('Server running on 5000'));
