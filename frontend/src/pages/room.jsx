import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/Authcontext.jsx";
import { joinRoom } from "../services/roomapi.js";
import { getLocalStream } from "../webRTC/getlocalstream.js";
import { initSignaling } from "../webRTC/signaling.js";
import { startScreenShare, stopScreenShare } from "../webRTC/screenshare.js";
import ChatPanel from "../components/common/chatpannel.jsx";
import {useChat} from "../webRTC/useChat.js";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  MonitorUp,
  MonitorX,
} from "lucide-react";

function VideoTile({ stream, label, muted }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="h-full w-full object-cover"
      />
      <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-xs text-white/80">
        {label}
      </span>
    </div>
  );
}

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [status, setStatus] = useState("connecting");
  const [errorMsg, setErrorMsg] = useState("");
  const [sharingScreen, setSharingScreen] = useState(false);
  const [chatOpen,setChatOpen]=useState(false);
  const [displayedLocalStream, setDisplayedLocalStream] = useState(null);
  const socketRef = useRef(null);
 
  // What the LOCAL tile currently displays — camera stream, or screen stream while sharing
  

  
  const peersRef = useRef(null);
  const cleanupSignalingRef = useRef(null);
  const screenStreamRef = useRef(null);
   const {messages,sendMessage,loadHistory}=useChat(socketRef.current,roomId);
  useEffect(() => {
    let cancelled = false;
    async function setup() {
      try {
        await joinRoom(roomId);
        const stream = await getLocalStream();
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        setLocalStream(stream);
        setDisplayedLocalStream(stream);

        const socket = io(import.meta.env.VITE_SERVER_URL, { auth: { token } });
        socketRef.current = socket;

        const handleRemoteStreams = (socketId, remoteStream) => {
          setRemoteStreams((prev) => ({ ...prev, [socketId]: remoteStream }));
        };
        const handleUserLeft = (socketId) => {
          setRemoteStreams((prev) => {
            const copy = { ...prev };
            delete copy[socketId];
            return copy;
          });
        };

        const { peers, cleanup } = initSignaling(socket, stream, handleRemoteStreams, handleUserLeft);
        peersRef.current = peers;
        cleanupSignalingRef.current = cleanup;
        console.log("joining room",roomId);
        socket.emit("join-room", { roomId, userId: user.id });
        setStatus("ready");
      } catch (err) {
        console.error("Failed to join", err);
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(err?.response?.status === 404 ? "Room not found" : "Could not reach");
        }
      }
    }
    console.log("joining roomId:",roomId);
    setup();

    return () => {
      cancelled = true;
      socketRef.current?.emit("leave-room");
      cleanupSignalingRef.current?.();
      socketRef.current?.disconnect();
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, [roomId]);

  const toggleMic = () => {
    localStream?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((v) => !v);
  };

  const toggleCam = () => {
    localStream?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOn((v) => !v);
  };

  const handleLeave = () => {
    navigate("/home");
  };

  const toggleScreenShare = async () => {
    if (!sharingScreen) {
      try {
        const { screenStream, screenTrack } = await startScreenShare(peersRef.current);
        screenStreamRef.current = screenStream;
        setSharingScreen(true);
        setDisplayedLocalStream(screenStream); // local tile now shows the screen

        screenTrack.onended = () => stopSharing();
      } catch (err) {
        console.error("Screen share failed", err);
      }
    } else {
      stopSharing();
    }
  };

  const stopSharing = () => {
    if (screenStreamRef.current) {
      const cameraTrack = localStream.getVideoTracks()[0];
      stopScreenShare(peersRef.current, cameraTrack);

      setDisplayedLocalStream(localStream); // local tile back to camera

      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    setSharingScreen(false);
  };
  useEffect(()=>{
    loadHistory();
  },[loadHistory]);
  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0A0B14] text-[#E7E7F1]">
        <p className="text-lg">{errorMsg}</p>
        <button
          onClick={() => navigate("/home")}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
        >
          Back to home
        </button>
      </div>
    );
  }
 
  const remoteEntries = Object.entries(remoteStreams);

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0B14] text-[#E7E7F1]">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-sm text-[#E7E7F1]/50">Room · {roomId}</span>
        <span className="text-xs text-[#E7E7F1]/30">
          {status === "connecting" ? "Connecting…" : `${remoteEntries.length + 1} in call`}
        </span>
      </header>

      <main className="flex-1 px-6 pb-28">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedLocalStream && <VideoTile stream={displayedLocalStream} label="You" muted />}
          {remoteEntries.map(([socketId, stream]) => (
            <VideoTile key={socketId} stream={stream} label="Participant" />
          ))}
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 flex items-center justify-center gap-4 border-t border-white/10 bg-[#0A0B14]/90 py-4 backdrop-blur-xl">
        <button
          onClick={toggleMic}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
            micOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
          }`}
        >
          {micOn ? <Mic size={18} /> : <MicOff size={18} />}
        </button>
        <button
          onClick={toggleCam}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
            camOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
          }`}
        >
          {camOn ? <VideoIcon size={18} /> : <VideoOff size={18} />}
        </button>
        <button
          onClick={toggleScreenShare}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
            sharingScreen ? "bg-blue-500 text-white" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          {sharingScreen ? <MonitorX size={18} /> : <MonitorUp size={18} />}
        </button>
        <button
          onClick={handleLeave}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
        >
          <PhoneOff size={18} />
        </button>
        <button onClick={() => setChatOpen((o) => !o)}>💬 Chat</button>
      
      </footer>
      {chatOpen && (
        <ChatPanel
          messages={messages}
          onSend={sendMessage}
          currentUserId={user?.id}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
