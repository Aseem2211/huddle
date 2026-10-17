import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/Authcontext.jsx";
import { getLocalStream } from "../webRTC/getlocalstream.js";
import { initSignaling } from "../webRTC/signaling.js";
import { startScreenShare, stopScreenShare } from "../webRTC/screenshare.js";
import ChatPanel from "../components/common/chatpannel.jsx";
import { useChat } from "../webRTC/useChat.js";
import useRoomAccess from "../webRTC/useRoomAccess.js";
import HostControls from "../components/HostControls.jsx";
import ShareRoom from "./share.jsx";
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

function VideoTile({ stream, label, muted, speaking, videoOff, initial, micOff, isSelf }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div
      className={`meeting-tile relative aspect-video overflow-hidden border transition-all duration-150 ${
        speaking ? "border-[#67E8F9] ring-2 ring-[#67E8F9]" : "border-white/10"
      }`}
    >
      <video ref={videoRef} autoPlay playsInline muted={muted} className="h-full w-full object-cover" />
      {videoOff && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#202124]">
          <span className="meeting-avatar flex h-20 w-20 items-center justify-center text-3xl font-black text-white">
            {initial}
          </span>
        </div>
      )}
      <span className="meeting-label absolute bottom-0 left-0 flex max-w-full items-center gap-2 px-3 py-1.5 text-xs font-semibold">
        {speaking && <span className="h-1.5 w-1.5 shrink-0 animate-pulse bg-[#67E8F9]" />}
        <span className="truncate">{label}</span>
        {isSelf && (
          <span className="border border-[#2F6BFF]/50 bg-[#2F6BFF]/20 px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.14em] text-[#7FA6FF]">
            You
          </span>
        )}
        {micOff && <MicOff size={13} className="shrink-0 text-rose-300" aria-label="Muted" />}
      </span>
    </div>
  );
}

function ControlButton({ onClick, variant = "default", label, children }) {
  const styles = {
    default: "meeting-control border-[#DCDDD8] bg-[#F1F2F4] text-[#202124] hover:bg-[#E7E9ED]",
    off: "meeting-control border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100",
    on: "meeting-control is-on border-[#2457E6] bg-[#2457E6] text-white hover:bg-[#3769F0]",
    leave: "meeting-control is-danger border-rose-600 bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-12 min-w-12 items-center justify-center gap-2 px-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2457E6] lg:px-4 ${styles[variant]}`}
    >
      {children}
      <span className="hidden text-[11px] font-bold uppercase tracking-[0.14em] lg:inline">{label}</span>
    </button>
  );
}

export default function Room() {
  const { roomId: rawRoomId } = useParams();
  const roomId = (rawRoomId || "").toLowerCase();
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
  const [names, setNames] = useState({});
  const [showEnd, setShowEnd] = useState(false);
  const [hostOpen, setHostOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef(null);
  const cleanupSignalingRef = useRef(null);
  const screenStreamRef = useRef(null);

  const {
    status: accessStatus,
    isHost,
    accessMode,
    requests,
    respond,
    changeMode,
    deleteRoom,
  } = useRoomAccess(chatSocket, roomId);

  const { messages, sendMessage } = useChat(chatSocket, roomId, user);

  useEffect(() => {
    if (accessStatus !== "allowed" || !chatSocket) return;
    let cancelled = false;

    const onExisting = (list) => {
      setNames((prev) => ({
        ...prev,
        ...Object.fromEntries((list || []).map((u) => [u.socketId, u.name])),
      }));
    };
    const onJoined = (u) => {
      setNames((prev) => ({ ...prev, [u.socketId]: u.name }));
    };
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

    async function startCall() {
      try {
        const stream = await getLocalStream();
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        setLocalStream(stream);
        setDisplayedLocalStream(stream);

        const { peers, cleanup } = initSignaling(chatSocket, stream, handleRemoteStreams, handleUserLeft);
        peersRef.current = peers;
        cleanupSignalingRef.current = cleanup;

        chatSocket.on("existing-users", onExisting);
        chatSocket.on("user-joined", onJoined);
        chatSocket.emit("join-room", { roomId });
        setStatus("ready");
      } catch (err) {
        console.error("Failed to start call", err);
        if (!cancelled) {
          setStatus("error");
          setErrorMsg("Could not access camera or microphone");
        }
      }
    }
    startCall();

    return () => {
      cancelled = true;
      chatSocket.emit("leave-room");
      chatSocket.off("existing-users", onExisting);
      chatSocket.off("user-joined", onJoined);
      cleanupSignalingRef.current?.();
      cleanupSignalingRef.current = null;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setLocalStream(null);
      setDisplayedLocalStream(null);
      setRemoteStreams({});
    };
  }, [accessStatus, chatSocket, roomId]);

  useEffect(() => {
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;
    setChatSocket(socket);
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setChatSocket(null);
    };
  }, [roomId, token]);

  const remoteEntries = Object.entries(remoteStreams);
  const participantCount = remoteEntries.length + 1;
  const gridCols =
    participantCount === 1
      ? "max-w-3xl grid-cols-1"
      : participantCount === 2
        ? "max-w-5xl grid-cols-1 sm:grid-cols-2"
        : "max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

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

  const copyroomId = async () => {
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

  const gateMessages = {
    checking: "Checking room...",
    waiting: "Waiting for the host to let you in...",
    denied: "The host did not let you into this room.",
    "not-found": "Room not found",
    deleted: "The host ended and deleted this room.",
  };

  if (gateMessages[accessStatus]) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#070B14] text-[#F1F5F9]">
        <p className="text-lg font-bold">{gateMessages[accessStatus]}</p>
        <button
          onClick={() => navigate("/home")}
          className="border border-white/15 bg-white/[0.06] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition hover:bg-white/10"
        >
          Back to home
        </button>
      </div>
    );
  }

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
    <div className="meeting-app flex min-h-screen flex-col">
      <header className="meeting-topbar flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-4">
          <LogoMark />
          <button
            onClick={copyroomId}
            className="meeting-room-code flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-semibold normal-case tracking-[0.04em] transition hover:border-[#B8C0D0] hover:text-[#202124]"
          >
            {roomId}
            {copied ? <Check size={14} className="text-[#67E8F9]" /> : <Copy size={14} />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShareOpen((o) => !o)}
            className="meeting-status px-3 py-1.5 text-xs font-bold tracking-[0.02em]"
          >
            Share
          </button>
          {isHost && (
            <button
              onClick={() => setHostOpen((o) => !o)}
              className="meeting-status px-3 py-1.5 text-xs font-bold tracking-[0.02em]"
            >
              Host{requests.length > 0 ? ` (${requests.length})` : ""}
            </button>
          )}
          <span className="meeting-status flex items-center gap-2 px-3 py-1.5 text-xs font-bold tracking-[0.02em]">
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
        </div>
      </header>

      <main className="meeting-stage flex-1 px-4 pb-28 pt-6 sm:px-6">
        <div className={`mx-auto grid gap-4 ${gridCols}`}>
          {displayedLocalStream && (
            <VideoTile
              stream={displayedLocalStream}
              label={user?.name || "You"}
              isSelf
              micOff={!micOn}
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
              label={names[socketId] || "Participant"}
              speaking={activeSpeaker === socketId}
            />
          ))}
        </div>
      </main>

      <footer className="meeting-footer fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-2 px-3 py-3 sm:gap-3 sm:py-4">
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
        <ControlButton
          onClick={() => (isHost ? setShowEnd(true) : handleLeave())}
          variant="leave"
          label="Leave call"
        >
          <PhoneOff size={18} />
        </ControlButton>
      </footer>

      {(shareOpen || (isHost && hostOpen)) && (
        <div className="fixed right-4 top-16 z-50 w-80 space-y-3">
          {shareOpen && (
            <div className="border border-white/10 bg-[#101A2E] p-4">
              <ShareRoom roomId={roomId} />
            </div>
          )}
          {isHost && hostOpen && (
            <div className="border border-white/10">
              <HostControls
                accessMode={accessMode}
                changeMode={changeMode}
                requests={requests}
                respond={respond}
              />
            </div>
          )}
        </div>
      )}

      {showEnd && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60">
          <div className="w-72 space-y-3 border border-white/10 bg-[#101A2E] p-6 text-[#F1F5F9]">
            <p className="font-bold">End this meeting?</p>
            <button
              onClick={async () => {
                try {
                  await deleteRoom();
                } catch (err) {
                  console.error("Delete failed", err);
                }
                handleLeave();
              }}
              className="block w-full bg-rose-600 px-4 py-2 text-sm font-bold"
            >
              Delete room
            </button>
            <button onClick={handleLeave} className="block w-full bg-slate-700 px-4 py-2 text-sm font-bold">
              Just leave
            </button>
            <button onClick={() => setShowEnd(false)} className="block w-full bg-slate-800 px-4 py-2 text-sm font-bold">
              Cancel
            </button>
          </div>
        </div>
      )}

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
