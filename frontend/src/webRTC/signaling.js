async function callUser(remoteSocketId,socket,peer){
    const offer=await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit('send-offer',{
        to:remoteSocketId,
        offer:offer,
    });
}
socket.on('offer-received',async({from ,offer})=>{
    const peer=createPeerConnection(from,socket);
    getLocalStreamm.getTracks().forEach((track)=>peer.addtrack(track,loaclStream));
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer=await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit('send-answer',{to:from,answer:answer});
});
socket.on('answer-received',async({from,answer})=>{
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
});
socket.on('ice-candidate-received',async({from,answer})=>{
    await peer.addIceCandidate(new RTCIceCandidate(candidate));
});