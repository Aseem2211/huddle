io.on('connection',(socket)=>{
    console.log('new socket connection ');

    socket.on('join-room',({roomCode,userId})=>{
        socket.join(roomCode);
        socket.roomCode=roomCode;
        socket.userId=userId;
        socket.to(roomCode).emit('user-connected',{
            socketId:socket.id,
            userId:userId,
        });
        socket.on('send-offer',({to,from})=>{
            io.on(to).emit('offer-received',{from:socket.id,offer});
        });
        socket.on('send-answer',({to,answer})=>{
            io.on(to).emit('answer-received',{from:socket.id,answer});
        });
        socket.on('send-ice-candidate',({to,candidate})=>{
            io.on(to).emit('ice-candidate-received',{from:socket.id,candidate});
        })
    });
    socket.to('leave_room',()=>{
        if(socket.roomCode){
            socket.to(socket.roomCode).emit('user-left',{socketId:socket.id});
        
        }
    });
    socket.on('disconnect',()=>{
        if(socket.roomCode){
            socket.to(socket.roomCode).emit('user-left',{socketId:socket.id});
        }
    });
});