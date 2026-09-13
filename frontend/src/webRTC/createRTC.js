const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function createPeerConnection(remoteSocketId, socket, localStream, onRemoteStream) {
  const peer = new RTCPeerConnection(ICE_SERVERS);

  localStream.getTracks().forEach((track) => {
    peer.addTrack(track, localStream);
  });

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", {
        to: remoteSocketId,
        candidate: event.candidate,
      });
    }
  };

  peer.ontrack = (event) => {
    onRemoteStream(remoteSocketId, event.streams[0]);
  };

  return peer;
}