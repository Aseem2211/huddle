import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import { joinRoom, createRoom, getRecentMeetings } from "../services/roomapi";
import DMPanel from "../components/DMPanel";
import AppShell from "../components/ui/AppShell";
import { Card, IconTile, Pill, SectionLabel, Notice } from "../components/ui/shared";
import {
  Video,
  Users,
  Clock,
  ArrowRight,
  MessageCircle,
  X,
  Copy,
  Check,
  CalendarClock,
  Plus,
} from "lucide-react";

function RecentSkeleton() {
  return (
    <div className="divide-y divide-white/5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-10 w-10 animate-pulse bg-white/[0.06]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 animate-pulse bg-white/[0.06]" />
            <div className="h-2.5 w-56 animate-pulse bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);
  const [dmOpen, setDmOpen] = useState(false);
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [recentState, setRecentState] = useState("loading");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const { user, socket } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    getRecentMeetings()
      .then((data) => {
        if (cancelled) return;
        setRecentMeetings(data);
        setRecentState("ready");
      })
      .catch((err) => {
        console.error("Failed to load recent meetings", err);
        if (!cancelled) setRecentState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStart = async () => {
    setStarting(true);
    setStartError("");
    try {
      const { roomId } = await createRoom();
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error("Failed to create room", err);
      setStartError("Could not create a room. Try again.");
    } finally {
      setStarting(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const code = joinCode.trim().toLowerCase();
    if (!code) return;
    setJoining(true);
    setJoinError("");
    try {
      await joinRoom(code);
      navigate(`/room/${code}`);
    } catch (err) {
      console.error("Room not found", err);
      setJoinError(err?.response?.status === 404 ? "No room with that code." : "Could not reach the server.");
    } finally {
      setJoining(false);
    }
  };

  const copyCode = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <AppShell
      eyebrow="Dashboard"
      title={`Welcome back, ${firstName}`}
      subtitle="Start a room in one tap, or drop in with a code someone sent you."
      actions={
        <button
          onClick={() => setDmOpen(true)}
          className="hidden items-center gap-2 border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition hover:border-white/30 hover:bg-white/10 sm:flex"
        >
          <MessageCircle size={15} /> Quick chat
        </button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-5">
        <Card variant="primary" className="overflow-hidden p-7 sm:p-9 lg:col-span-3">
          <IconTile icon={Video} tone="solid" className="h-12 w-12" size={22} />
          <h2 className="mt-6 text-2xl font-black tracking-[-0.03em] sm:text-3xl">Start a meeting</h2>
          <p className="mt-2 max-w-sm text-sm text-white/75">
            Create a room instantly and share the code. Everyone joins straight from their browser.
          </p>
          {startError && (
            <p role="alert" className="mt-4 text-sm font-semibold text-white">{startError}</p>
          )}
          <button
            onClick={handleStart}
            disabled={starting}
            className="mt-7 inline-flex items-center gap-2.5 border border-white bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#070B14] transition hover:bg-[#F1F5F9] focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={16} strokeWidth={2.5} />
            {starting ? "Creating room…" : "New meeting"}
          </button>
        </Card>

        <Card interactive className="p-7 lg:col-span-2">
          <IconTile icon={Users} tone="violet" className="h-12 w-12" size={22} />
          <h2 className="mt-6 text-xl font-bold tracking-[-0.02em]">Join with a code</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">Paste the room code you were given.</p>
          <form onSubmit={handleJoin} className="mt-6">
            <label htmlFor="joinCode" className="sr-only">Room code</label>
            <div className="flex gap-2">
              <input
                id="joinCode"
                type="text"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toLowerCase());
                  setJoinError("");
                }}
                placeholder="abc123xyz0"
                className="w-full border border-white/10 bg-[#070B14]/70 px-3.5 py-3 font-mono text-sm normal-case text-[#F1F5F9] outline-none transition placeholder:text-[#94A3B8]/50 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
              />
              <button
                type="submit"
                disabled={!joinCode.trim() || joining}
                aria-label="Join meeting"
                className="flex shrink-0 items-center justify-center border border-[#8B5CF6] bg-[#8B5CF6] px-4 text-white transition hover:bg-[#9F7AEA] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowRight size={18} />
              </button>
            </div>
            {joinError && (
              <p role="alert" className="mt-3 text-sm text-rose-300">{joinError}</p>
            )}
          </form>
        </Card>
      </div>

      <section className="mt-10" aria-labelledby="recent-heading">
        <SectionLabel icon={Clock}>
          <span id="recent-heading">Recent meetings</span>
        </SectionLabel>

        <Card className="overflow-hidden">
          {recentState === "loading" && <RecentSkeleton />}

          {recentState === "error" && (
            <div className="p-5">
              <Notice type="error">Couldn&apos;t load your recent meetings.</Notice>
            </div>
          )}

          {recentState === "ready" && recentMeetings.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <IconTile icon={CalendarClock} tone="slate" className="h-12 w-12" size={22} />
              <p className="font-bold">No meetings yet</p>
              <p className="max-w-xs text-sm text-[#94A3B8]">Rooms you create will show up here so you can jump back in.</p>
            </div>
          )}

          {recentState === "ready" && recentMeetings.length > 0 && (
            <ul className="divide-y divide-white/5">
              {recentMeetings.map((m) => (
                <li key={m.room_id} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.04]">
                  <IconTile icon={Video} tone={m.status === "scheduled" ? "violet" : "cobalt"} />
                  <button
                    onClick={() => navigate(`/room/${m.room_id}`)}
                    className="min-w-0 flex-1 text-left focus-visible:outline-offset-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold">{m.title}</p>
                      {m.status && (
                        <Pill tone={m.status === "scheduled" ? "violet" : "live"} dot>
                          {m.status}
                        </Pill>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#94A3B8]">
                      {new Date(m.created_at).toLocaleString()} ·{" "}
                      <span className="font-mono normal-case">{m.room_id}</span>
                    </p>
                  </button>
                  <button
                    onClick={() => copyCode(m.room_id)}
                    aria-label={`Copy room code ${m.room_id}`}
                    title="Copy code"
                    className="border border-white/10 p-2 text-[#94A3B8] transition hover:border-white/25 hover:text-[#F1F5F9]"
                  >
                    {copiedId === m.room_id ? <Check size={15} className="text-[#67E8F9]" /> : <Copy size={15} />}
                  </button>
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="hidden text-[#94A3B8] transition group-hover:translate-x-1 group-hover:text-[#67E8F9] sm:block"
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {dmOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-[#070B14]/60 backdrop-blur-sm" onClick={() => setDmOpen(false)} />
          <div
            role="dialog"
            aria-label="Quick chat"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-white/10 bg-[#101A2E]/95 shadow-2xl backdrop-blur-2xl"
          >
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
    </AppShell>
  );
}
