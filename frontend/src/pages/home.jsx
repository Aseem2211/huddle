import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import { joinRoom,createRoom, getRecentMeetings } from "../services/roomapi";

import {
  Video,
  Users,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [starting, setStarting] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
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

  const handleJoin =async(e) => {
    e.preventDefault();
    const code=joinCode.trim();
    if(!code){
      return;
    }
    try{
      await joinRoom(code);
      navigate(`/room/${code}`);
    }catch(err){
      console.error("Room not found",err);
    }
    
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0B14] text-[#E7E7F1]">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Top nav */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#F472B6] shadow-[0_0_10px_2px_rgba(244,114,182,0.6)]" />
          <span className="font-display text-lg tracking-tight">zoomlite</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/settings")}
            aria-label="Settings"
            className="rounded-full p-2 text-[#E7E7F1]/60 transition hover:bg-white/5 hover:text-[#E7E7F1]"
          >
            <Settings size={19} />
          </button>

          {/* Profile menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 transition hover:bg-white/10"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#6D28D9] to-[#22D3EE] text-xs font-semibold text-white">
                {initials}
              </span>
              <ChevronDown size={14} className="text-[#E7E7F1]/50" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#12131F]/95 shadow-xl backdrop-blur-xl">
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="truncate text-sm font-medium">{user?.name}</p>
                  <p className="truncate text-xs text-[#E7E7F1]/50">{user?.email}</p>
                </div>
                <button
                  onClick={() => navigate("/profile")}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#E7E7F1]/80 transition hover:bg-white/5"
                >
                  <User size={15} /> Profile
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#E7E7F1]/80 transition hover:bg-white/5"
                >
                  <Settings size={15} /> Settings
                </button>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-8 pb-24">
        <h1 className="font-display text-center text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          Welcome back, {user?.name?.split(" ")[0] || "there"}.
        </h1>
        <p className="mt-3 max-w-md text-center text-base text-[#E7E7F1]/60">
          Start a room in one tap, or drop in a code someone sent you.
        </p>

        {/* Action panel */}
        <div className="mt-10 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
          <button
            onClick={handleStart}
            disabled={starting}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-[#6D28D9]/25 to-[#22D3EE]/10 p-6 text-left transition hover:border-white/20 hover:shadow-[0_0_28px_rgba(109,40,217,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#22D3EE]">
              <Video size={18} className="text-white" />
            </span>
            <span className="font-display text-lg font-medium">
              {starting ? "Creating room…" : "Start a meeting"}
            </span>
            <span className="text-sm text-[#E7E7F1]/50">Create a new room instantly</span>
          </button>

          <form
            onSubmit={handleJoin}
            className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left transition hover:border-white/20"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Users size={18} className="text-[#E7E7F1]" />
            </span>
            <span className="font-display text-lg font-medium">Join a meeting</span>
            <div className="mt-1 flex w-full gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter code"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#E7E7F1] placeholder:text-[#E7E7F1]/30 outline-none focus:border-[#8B5CF6]/60"
              />
              <button
                type="submit"
                disabled={!joinCode.trim()}
                aria-label="Join"
                className="flex shrink-0 items-center justify-center rounded-lg bg-white/10 px-3 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Recent meetings */}
        {recentMeetings.length > 0 && (
          <div className="mt-14 w-full max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-sm text-[#E7E7F1]/50">
              <Clock size={14} />
              <span>Recent meetings</span>
            </div>
            <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              {recentMeetings.map((m) => (
                <button
                  key={m.room_id}
                  onClick={() => navigate(`/room/${m.room_id}`)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-medium">{m.title}</p>
                    <p className="text-xs text-[#E7E7F1]/40">
                      {new Date(m.created_at).toLocaleString()} · {m.room_id}
                    </p>
                  </div>
                  <ArrowRight size={15} className="text-[#E7E7F1]/30" />
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}