const ICE_SERVER={
    iceServers:[{
        urls:'stun:stun.l.google.com:19302'}

    ],
};
function createPeerconnection(remoteSocketId,socket){
    const peer=new RTCpeerconnection(ICE_SERVER);
    peer.onicecandidate=(event)=>{
        if(event.candidate){
            socket.emit('send-ice-connection',{
                to:remoteSocketId,
                candidate:event.candidate,
            });
        }
    };
    peer.ontarck=(event)=>{
        remoteVideoElement.srcObject=event.streams[0];
    };
    return peer;
};

loaclstream
