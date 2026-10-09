require("dotenv").config();
const http = require('http');

const { Server } = require('socket.io');
const app = require('./src/app');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL, 
    methods: ['GET', 'POST'],
  },
});

// Track which room each socket is in, so we can broadcast to the right people
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-room', ({ roomCode, userId }) => {
    socket.join(roomCode);
    socket.roomCode = roomCode; // stash for later use in disconnect/leave
    socket.userId = userId;

    // Tell everyone ELSE already in the room that a new user joined
    socket.to(roomCode).emit('user-joined', { socketId: socket.id, userId });
  });

  socket.on('send-offer', ({ to, offer }) => {
    io.to(to).emit('offer-received', { from: socket.id, offer });
  });

  socket.on('send-answer', ({ to, answer }) => {
    io.to(to).emit('answer-received', { from: socket.id, answer });
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('ice-candidate-received', { from: socket.id, candidate });
  });

  socket.on('leave-room', () => {
    if (socket.roomCode) {
      socket.to(socket.roomCode).emit('user-left', { socketId: socket.id });
      socket.leave(socket.roomCode);
    }
  });

  socket.on('disconnect', () => {
    if (socket.roomCode) {
      socket.to(socket.roomCode).emit('user-left', { socketId: socket.id });
    }
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(process.env.PORT||5000, () => console.log('Server running on 5000'));
