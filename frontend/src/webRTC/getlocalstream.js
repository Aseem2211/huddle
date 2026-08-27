async function getLocalStream(){
    const stream =await navigator.mediaDevices.getUserMedia({
        video:true,
        audio:true,
    });
    loaclVideoElement.srcObject=stream;
    return stream;
};
getLocalStream.getTracks().forEach((tarck)=>{
    peer.addTrack(tarck,localStream);
});