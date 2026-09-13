
import { createPeerConnection } from "./createRTC.js";;

export function initSignaling(socket, localStream, onRemoteStream, onUserLeft) {
  const peers = {}; // { socketId: RTCPeerConnection }

  const getOrCreatePeer = (remoteSocketId) => {
    if (!peers[remoteSocketId]) {
      peers[remoteSocketId] = createPeerConnection(
        remoteSocketId,
        socket,
        localStream,
        onRemoteStream
      );
    }
    return peers[remoteSocketId];
  };

  const callUser = async (remoteSocketId) => {
    const peer = getOrCreatePeer(remoteSocketId);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("offer", { to: remoteSocketId, offer });
  };

  socket.on("existing-users", (users) => {
    users.forEach((u) => callUser(u.socketId)); // we initiate to everyone already in the room
  });

  socket.on("user-joined", ({ socketId }) => {
    getOrCreatePeer(socketId); // they'll send us the offer, we just prep the connection
  });

  socket.on("offer", async ({ from, offer }) => {
    const peer = getOrCreatePeer(from);
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit("answer", { to: from, answer });
  });

  socket.on("answer", async ({ from, answer }) => {
    await peers[from]?.setRemoteDescription(new RTCSessionDescription(answer));
  });

  socket.on("ice-candidate", async ({ from, candidate }) => {
    await peers[from]?.addIceCandidate(new RTCIceCandidate(candidate));
  });

  socket.on("user-left", ({ socketId }) => {
    peers[socketId]?.close();
    delete peers[socketId];
    onUserLeft?.(socketId);
  });

  
  return {
    peers,
    cleanup:()=>{
      Object.values(peers).forEach((p) => p.close());
    },
    
  };
}