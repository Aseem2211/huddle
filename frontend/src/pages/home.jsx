
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import { joinRoom, createRoom, getRecentMeetings } from "../services/roomapi";
import DMPanel from "../components/DMPanel";
import { UserAvatar } from "../components/AvatarUpload";
import { LogoMark, Mandala } from "../components/ui/shared";
import {
  Video,
  Users,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Clock,
  ArrowRight,
  MessageCircle,
  X,
} from "lucide-react";

export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dmOpen, setDmOpen] = useState(false);
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [starting, setStarting] = useState(false);
  const menuRef = useRef(null);
  const { user, logout, socket } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getRecentMeetings()
      .then((data) => {
        if (!cancelled) setRecentMeetings(data);
      })
      .catch((err) => console.error("Failed to load recent meetings", err));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStart = async () => {
    setStarting(true);
    try {
      const { roomId } = await createRoom();
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error("Failed to create room", err);
    } finally {
      setStarting(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const code = joinCode.trim();
    if (!code) return;
    try {
      await joinRoom(code);
      navigate(`/room/${code}`);
    } catch (err) {
      console.error("Room not found", err);
    }
  };

  const iconBtn =
    "border border-white/10 bg-white/[0.04] p-2.5 text-[#94A3B8] transition hover:border-white/25 hover:bg-white/10 hover:text-[#F1F5F9]";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070B14] text-[#F1F5F9]">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#2F6BFF]/20 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[#8B5CF6]/20 blur-[130px]" />

      <header className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2.5 text-xl font-black tracking-tight">
          <LogoMark />
          <span>ZOOM<span className="text-[#2F6BFF]">LITE</span></span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setDmOpen((o) => !o)} aria-label="Messages" className={iconBtn}>
            <MessageCircle size={18} />
          </button>
          <button onClick={() => navigate("/settings")} aria-label="Settings" className={iconBtn}>
            <Settings size={18} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 border border-white/10 bg-white/[0.04] p-1.5 pr-3 transition hover:border-white/25 hover:bg-white/10"
            >
              <UserAvatar user={user} className="h-8 w-8 text-xs" />
              <ChevronDown size={14} className="text-[#94A3B8]" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden border border-white/10 bg-[#101A2E]/95 shadow-[0_0_40px_rgba(47,107,255,0.2)] backdrop-blur-2xl">
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="truncate text-sm font-bold">{user?.name}</p>
                  <p className="truncate text-xs text-[#94A3B8]">{user?.email}</p>
                </div>
                <button
                  onClick={() => navigate("/profile")}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[#F1F5F9]/80 transition hover:bg-white/5"
                >
                  <User size={15} /> Profile
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[#F1F5F9]/80 transition hover:bg-white/5"
                >
                  <Settings size={15} /> Settings
                </button>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-rose-300 transition hover:bg-rose-500/10"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-8">
        <Mandala />

        <div className="relative flex flex-col items-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#8B5CF6]">Ready when you are</p>
          <h1 className="text-center text-4xl font-black leading-tight tracking-[-0.05em] sm:text-6xl">
            Welcome back, {user?.name?.split(" ")[0] || "there"}<span className="text-[#2F6BFF]">.</span>
          </h1>
          <p className="mt-3 max-w-md text-center text-base text-[#94A3B8]">
            Start a room in one tap, or drop in a code someone sent you.
          </p>

          <div className="mt-10 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
            <button
              onClick={handleStart}
              disabled={starting}
              className="group flex flex-col items-start gap-3 border border-[#2F6BFF] bg-[#2F6BFF] p-6 text-left shadow-[0_0_40px_rgba(47,107,255,0.3)] transition hover:bg-[#4A7FFF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-10 w-10 items-center justify-center bg-white/15">
                <Video size={18} className="text-white" />
              </span>
              <span className="text-lg font-black uppercase tracking-[0.08em]">
                {starting ? "Creating room…" : "Start a meeting"}
              </span>
              <span className="text-sm text-white/70">Create a new room instantly</span>
            </button>

            <form
              onSubmit={handleJoin}
              className="flex flex-col items-start gap-3 border border-white/10 bg-[#101A2E]/70 p-6 text-left backdrop-blur-2xl transition hover:border-white/25"
            >
              <span className="flex h-10 w-10 items-center justify-center bg-[#8B5CF6]">
                <Users size={18} className="text-white" />
              </span>
              <span className="text-lg font-black uppercase tracking-[0.08em]">Join a meeting</span>
              <div className="mt-1 flex w-full gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter code"
                  className="w-full border border-white/10 bg-[#070B14]/70 px-3 py-2.5 text-sm text-[#F1F5F9] outline-none transition placeholder:text-[#94A3B8]/60 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                />
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  aria-label="Join"
                  className="flex shrink-0 items-center justify-center border border-[#8B5CF6] bg-[#8B5CF6] px-3.5 text-white transition hover:bg-[#9F7AEA] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>

          {recentMeetings.length > 0 && (
            <div className="mt-14 w-full max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#94A3B8]">
                <Clock size={14} />
                <span>Recent meetings</span>
              </div>
              <div className="divide-y divide-white/5 overflow-hidden border border-white/10 bg-[#101A2E]/70 backdrop-blur-2xl">
                {recentMeetings.map((m) => (
                  <button
                    key={m.room_id}
                    onClick={() => navigate(`/room/${m.room_id}`)}
                    className="group flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-white/5"
                  >
                    <div>
                      <p className="text-sm font-bold">{m.title}</p>
                      <p className="text-xs text-[#94A3B8]">
                        {new Date(m.created_at).toLocaleString()} · {m.room_id}
                      </p>
                    </div>
                    <ArrowRight size={15} className="text-[#94A3B8] transition group-hover:translate-x-1 group-hover:text-[#67E8F9]" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {dmOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-[#070B14]/60 backdrop-blur-sm" onClick={() => setDmOpen(false)} />
          <div className="fixed right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col border-l border-white/10 bg-[#101A2E]/95 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="text-sm font-black uppercase tracking-[0.2em]">Messages</span>
              <button
                onClick={() => setDmOpen(false)}
                aria-label="Close messages"
                className="p-1.5 text-[#94A3B8] transition hover:text-[#F1F5F9]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <DMPanel socket={socket} currentUser={user} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}