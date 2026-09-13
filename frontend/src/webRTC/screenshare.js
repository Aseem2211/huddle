export async function startScreenShare(peers){
    const screenStream=await navigator.mediaDevices.getDisplayMedia({video:true});
    const screenTrack=screenStream.getVideoTracks()[0];
    Object.values(peers).forEach((peer)=>{
        const sender=peer.getSenders().find((s)=>s.track&&s.track.kind==="video");
        sender?.replaceTrack(screenTrack);
    });
    return {screenStream,screenTrack};
}
export function stopScreenShare(peers,cameraTrack){
    Object.values(peers).forEach((peer)=>{
        const sender=peer.getSenders().find((s)=>s.track&&s.track.kind==="video");
        sender?.replaceTrack(cameraTrack);
    });
}