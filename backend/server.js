require("dotenv").config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');

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

io.on('connection', (socket) => {
  const leaveCurrentRoom = () => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('user-left', { socketId: socket.id });
      socket.leave(socket.roomId);
      socket.roomId = null;
    }
  };

  socket.on('join-room', ({ roomId, userId } = {}) => {   // was roomCode
    if (!roomId) return;
    leaveCurrentRoom();
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userId = userId;

    const existingUsers = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
      .filter((id) => id !== socket.id)
      .map((id) => ({ socketId: id, userId: io.sockets.sockets.get(id)?.userId }));

    socket.emit('existing-users', existingUsers);          // newcomer learns who is already there
    socket.to(roomId).emit('user-joined', { socketId: socket.id, userId });
  });

  socket.on('offer',  ({ to, offer })     => io.to(to).emit('offer',  { from: socket.id, offer }));
  socket.on('answer', ({ to, answer })    => io.to(to).emit('answer', { from: socket.id, answer }));
  socket.on('ice-candidate', ({ to, candidate }) =>
    io.to(to).emit('ice-candidate', { from: socket.id, candidate }));

  socket.on('chat:send', ({ roomId, senderId, senderName, message } = {}) => {
    if (!roomId || socket.roomId !== roomId) return;
    if (typeof message !== 'string' || !message.trim()) return;
    io.to(roomId).emit('chat:receive', {
      senderId, senderName, message, created_at: new Date().toISOString(),
    });
  });

  socket.on('leave-room', leaveCurrentRoom);
  socket.on('disconnect', leaveCurrentRoom);
});


server.listen(process.env.PORT||5000, () => console.log('Server running on 5000'));
