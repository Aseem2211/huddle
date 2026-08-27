
import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket/socketClient';
import { createPeerConnection } from '../webRTC/createRTC';
import { getLocalStream } from '../webRTC/getlocalstream';

function MeetingRoom({ roomCode, userId }) {
  const localVideoRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // { socketId: MediaStream }
  const peersRef = useRef({}); // { socketId: RTCPeerConnection }
  const localStreamRef = useRef(null);

  useEffect(() => {
    async function init() {
     
      const stream = await getLocalStream();
      localStreamRef.current = stream;
      localVideoRef.current.srcObject = stream;

      
      socket.emit('join-room', { roomCode, userId });

      // 3. When someone ELSE joins after me, I initiate the call to them
      socket.on('user-joined', async ({ socketId }) => {
        const peer = createPeer(socketId);
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit('send-offer', { to: socketId, offer });
      });

      // 4. When I receive an offer (someone already in the room calling me)
      socket.on('offer-received', async ({ from, offer }) => {
        const peer = createPeer(from);
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit('send-answer', { to: from, answer });
      });

      // 5. When my offer gets answered
      socket.on('answer-received', async ({ from, answer }) => {
        const peer = peersRef.current[from];
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      });

      // 6. ICE candidates trickling in from either side
      socket.on('ice-candidate-received', async ({ from, candidate }) => {
        const peer = peersRef.current[from];
        if (peer) await peer.addIceCandidate(new RTCIceCandidate(candidate));
      });

      // 7. Someone left — clean up their connection and video tile
      socket.on('user-left', ({ socketId }) => {
        if (peersRef.current[socketId]) {
          peersRef.current[socketId].close();
          delete peersRef.current[socketId];
        }
        setRemoteStreams((prev) => {
          const copy = { ...prev };
          delete copy[socketId];
          return copy;
        });
      });
    }

    init();

    // Cleanup when component unmounts (user leaves the page)
    return () => {
      socket.emit('leave-room');
      Object.values(peersRef.current).forEach((peer) => peer.close());
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      socket.off('user-joined');
      socket.off('offer-received');
      socket.off('answer-received');
      socket.off('ice-candidate-received');
      socket.off('user-left');
    };
  }, [roomCode, userId]);

  // Helper: builds a peer connection AND wires ontrack to update React state
  function createPeer(remoteSocketId) {
    const peer = createPeerConnection(remoteSocketId, socket);

    peer.ontrack = (event) => {
      setRemoteStreams((prev) => ({
        ...prev,
        [remoteSocketId]: event.streams[0],
      }));
    };

    peersRef.current[remoteSocketId] = peer;
    return peer;
  }

  return (
    <div className="meeting-room">
      <video ref={localVideoRef} autoPlay muted playsInline />
      {Object.entries(remoteStreams).map(([socketId, stream]) => (
        <RemoteVideo key={socketId} stream={stream} />
      ))}
    </div>
  );
}

function RemoteVideo({ stream }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);
  return <video ref={videoRef} autoPlay playsInline />;
}

export default MeetingRoom;