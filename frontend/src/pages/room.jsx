
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/Authcontext.jsx";
import { joinRoom } from "../services/roomapi.js";
import { getLocalStream } from "../webRTC/getlocalstream.js";
import { initSignaling } from "../webRTC/signaling.js";
import { startScreenShare, stopScreenShare } from "../webRTC/screenshare.js";
import ChatPanel from "../components/common/chatpannel.jsx";
import { useChat } from "../webRTC/useChat.js";
import { LogoMark } from "../components/ui/shared";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  MonitorUp,
  MonitorX,
  MessageSquare,
  Copy,
  Check,
  Users,
} from "lucide-react";

const SOCKET_URL = (
  import.meta.env.VITE_SERVER_URL ||
  import.meta.env.VITE_API_URL ||
  "https://huddle-g0v2.onrender.com"
).replace(/\/$/, "").replace(/\/api$/, "");

function useActiveSpeaker(entries) {
  const [activeId, setActiveId] = useState(null);
  const key = entries
    .map((e) => `${e.id}:${e.stream.id}:${e.stream.getAudioTracks().length}`)
    .join("|");

  useEffect(() => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const usable = entries.filter((e) => e.stream.getAudioTracks().length > 0);
    if (!AudioCtx || usable.length === 0) {
      setActiveId(null);
      return;
    }

    const ctx = new AudioCtx();
    ctx.resume?.();
    const nodes = usable.map(({ id, stream }) => {
      const source = ctx.createMediaStreamSource(new MediaStream(stream.getAudioTracks()));
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      return { id, source, analyser, data: new Uint8Array(analyser.fftSize) };
    });

    let lastLoudAt = 0;
    let hasActive = false;
    const timer = setInterval(() => {
      let best = null;
      let bestLevel = 0.03;
      for (const n of nodes) {
        n.analyser.getByteTimeDomainData(n.data);
        let sum = 0;
        for (let i = 0; i < n.data.length; i++) {
          const v = (n.data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / n.data.length);
        if (rms > bestLevel) {
          bestLevel = rms;
          best = n.id;
        }
      }
      const now = Date.now();
      if (best) {
        lastLoudAt = now;
        hasActive = true;
        setActiveId(best);
      } else if (hasActive && now - lastLoudAt > 1200) {
        hasActive = false;
        setActiveId(null);
      }
    }, 150);

    return () => {
      clearInterval(timer);
      nodes.forEach((n) => n.source.disconnect());
      ctx.close().catch(() => {});
    };
  }, [key]);

  return activeId;
}

function VideoTile({ stream, label, muted, speaking, videoOff, initial }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div
      className={`relative aspect-video overflow-hidden border bg-[#101A2E] transition-all duration-150 ${
        speaking ? "border-[#67E8F9] ring-2 ring-[#67E8F9]" : "border-white/10"
      }`}
    >
      <video ref={videoRef} autoPlay playsInline muted={muted} className="h-full w-full object-cover" />
      {videoOff && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#101A2E]">
          <span className="flex h-20 w-20 items-center justify-center bg-[#2F6BFF] text-3xl font-black text-white">
            {initial}
          </span>
        </div>
      )}
      <span className="absolute bottom-0 left-0 flex items-center gap-2 bg-[#070B14]/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#F1F5F9]">
        {speaking && <span className="h-1.5 w-1.5 animate-pulse bg-[#67E8F9]" />}
        {label}
      </span>
    </div>
  );
}

function ControlButton({ onClick, variant = "default", label, children }) {
  const styles = {
    default: "border-white/15 bg-white/[0.06] text-[#F1F5F9] hover:bg-white/10",
    off: "border-rose-400/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25",
    on: "border-[#2F6BFF] bg-[#2F6BFF] text-white hover:bg-[#4A7FFF]",
    leave: "border-rose-500 bg-rose-500 text-white hover:bg-rose-600",
  };
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-12 w-12 items-center justify-center border transition focus:outline-none focus:ring-2 focus:ring-[#67E8F9] ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [chatSocket, setChatSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [status, setStatus] = useState("connecting");
  const [errorMsg, setErrorMsg] = useState("");
  const [sharingScreen, setSharingScreen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayedLocalStream, setDisplayedLocalStream] = useState(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef(null);
  const cleanupSignalingRef = useRef(null);
  const screenStreamRef = useRef(null);

  const { messages, sendMessage, loadHistory } = useChat(chatSocket, roomId, user);

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
        localStreamRef.current = stream;
        setLocalStream(stream);
        setDisplayedLocalStream(stream);

        const socket = io(SOCKET_URL, { auth: { token } });
        socketRef.current = socket;
        setChatSocket(socket);

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
    setup();

    return () => {
      cancelled = true;
      socketRef.current?.emit("leave-room");
      cleanupSignalingRef.current?.();
      socketRef.current?.disconnect();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    };
  }, [roomId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const remoteEntries = Object.entries(remoteStreams);

  const speakerEntries = [
    ...(localStream ? [{ id: "local", stream: localStream }] : []),
    ...remoteEntries.map(([id, stream]) => ({ id, stream })),
  ];
  const activeSpeaker = useActiveSpeaker(speakerEntries);

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

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const stopSharing = () => {
    if (screenStreamRef.current) {
      const cameraTrack = localStreamRef.current.getVideoTracks()[0];
      stopScreenShare(peersRef.current, cameraTrack);
      setDisplayedLocalStream(localStreamRef.current);
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    setSharingScreen(false);
  };

  const toggleScreenShare = async () => {
    if (!sharingScreen) {
      try {
        const { screenStream, screenTrack } = await startScreenShare(peersRef.current);
        screenStreamRef.current = screenStream;
        setSharingScreen(true);
        setDisplayedLocalStream(screenStream);
        screenTrack.onended = () => stopSharing();
      } catch (err) {
        console.error("Screen share failed", err);
      }
    } else {
      stopSharing();
    }
  };

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#070B14] text-[#F1F5F9]">
        <p className="text-lg font-bold">{errorMsg}</p>
        <button
          onClick={() => navigate("/home")}
          className="border border-white/15 bg-white/[0.06] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition hover:bg-white/10"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#070B14] text-[#F1F5F9]">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <LogoMark />
          <button
            onClick={copyRoomCode}
            className="flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#94A3B8] transition hover:border-white/25 hover:text-[#F1F5F9]"
          >
            {roomId}
            {copied ? <Check size={14} className="text-[#67E8F9]" /> : <Copy size={14} />}
          </button>
        </div>
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
          {status === "connecting" ? (
            "Connecting…"
          ) : (
            <>
              <span className="h-1.5 w-1.5 animate-pulse bg-[#67E8F9]" />
              <Users size={14} />
              {remoteEntries.length + 1} in call
            </>
          )}
        </span>
      </header>

      <main className="flex-1 px-6 pb-28">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedLocalStream && (
            <VideoTile
              stream={displayedLocalStream}
              label="You"
              muted
              speaking={activeSpeaker === "local"}
              videoOff={!camOn && !sharingScreen}
              initial={user?.name?.[0]?.toUpperCase() || "?"}
            />
          )}
          {remoteEntries.map(([socketId, stream]) => (
            <VideoTile
              key={socketId}
              stream={stream}
              label="Participant"
              speaking={activeSpeaker === socketId}
            />
          ))}
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 flex items-center justify-center gap-3 border-t border-white/10 bg-[#101A2E]/80 py-4 backdrop-blur-2xl">
        <ControlButton onClick={toggleMic} variant={micOn ? "default" : "off"} label={micOn ? "Mute" : "Unmute"}>
          {micOn ? <Mic size={18} /> : <MicOff size={18} />}
        </ControlButton>
        <ControlButton onClick={toggleCam} variant={camOn ? "default" : "off"} label={camOn ? "Turn camera off" : "Turn camera on"}>
          {camOn ? <VideoIcon size={18} /> : <VideoOff size={18} />}
        </ControlButton>
        <ControlButton
          onClick={toggleScreenShare}
          variant={sharingScreen ? "on" : "default"}
          label={sharingScreen ? "Stop sharing" : "Share screen"}
        >
          {sharingScreen ? <MonitorX size={18} /> : <MonitorUp size={18} />}
        </ControlButton>
        <ControlButton onClick={() => setChatOpen((o) => !o)} variant={chatOpen ? "on" : "default"} label="Chat">
          <MessageSquare size={18} />
        </ControlButton>
        <ControlButton onClick={handleLeave} variant="leave" label="Leave call">
          <PhoneOff size={18} />
        </ControlButton>
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