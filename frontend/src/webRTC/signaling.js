
import { createPeerConnection } from "./createRTC.js";

export function initSignaling(socket, localStream, onRemoteStream, onUserLeft) {
  const peers = {}; // { socketId: RTCPeerConnection }
  const pendingCandidates = {};

  const flushCandidates = async (socketId) => {
    const peer = peers[socketId];
    const queue = pendingCandidates[socketId] || [];
    delete pendingCandidates[socketId];
    for (const c of queue) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(c));
      } catch (e) {
        console.warn("ICE flush failed", e);
      }
    }
  };

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
    users.forEach((u) => callUser(u.socketId));
  });

  socket.on("user-joined", ({ socketId }) => {
    getOrCreatePeer(socketId);
  });

  socket.on("offer", async ({ from, offer }) => {
    const peer = getOrCreatePeer(from);
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    await flushCandidates(from);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit("answer", { to: from, answer });
  });

  socket.on("answer", async ({ from, answer }) => {
    await peers[from]?.setRemoteDescription(new RTCSessionDescription(answer));
    await flushCandidates(from);
  });

  socket.on("ice-candidate", async ({ from, candidate }) => {
    const peer = peers[from];
    if (!peer || !peer.remoteDescription) {
      (pendingCandidates[from] ||= []).push(candidate);
      return;
    }
    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.warn("addIceCandidate failed", e);
    }
  });

  socket.on("user-left", ({ socketId }) => {
    peers[socketId]?.close();
    delete peers[socketId];
    delete pendingCandidates[socketId];
    onUserLeft?.(socketId);
  });

  return {
    peers,
    cleanup: () => {
      ["existing-users", "user-joined", "offer", "answer", "ice-candidate", "user-left"].forEach((ev) =>
        socket.off(ev)
      );
      Object.values(peers).forEach((p) => p.close());
    },
  };
}