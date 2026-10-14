import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";

const getSenderId = (m) => m.senderId ?? m.sender_id ?? m.userId ?? m.user_id;
const getSenderName = (m) =>
  m.senderName ?? m.sender_name ?? m.userName ?? m.user_name ?? m.username ?? m.name ?? "Unknown";
const getText = (m) => m.text ?? m.message ?? m.content ?? "";
const getTime = (m) => m.createdAt ?? m.created_at ?? m.timestamp;

export default function ChatPanel({ messages, onSend, currentUserId, onClose }) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft("");
  };

  return (
    <aside className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col border-l border-white/10 bg-[#101A2E]/95 text-[#F1F5F9] shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <span className="text-sm font-black uppercase tracking-[0.2em]">In-call chat</span>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="p-1.5 text-[#94A3B8] transition hover:text-[#F1F5F9]"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="pt-6 text-center text-sm text-[#94A3B8]">No messages yet. Say hi.</p>
        )}
        {messages.map((m, i) => {
          const mine = getSenderId(m) === currentUserId;
          const time = getTime(m);
          return (
            <div key={m.id ?? i} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <span
                className={`mb-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                  mine ? "text-[#94A3B8]" : "text-[#67E8F9]"
                }`}
              >
                {mine ? "You" : getSenderName(m)}
                {time && (
                  <span className="ml-2 font-normal normal-case tracking-normal text-[#94A3B8]/70">
                    {new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </span>
              <div
                className={`max-w-[85%] border px-3.5 py-2 text-sm ${
                  mine
                    ? "border-[#2F6BFF] bg-[#2F6BFF] text-white"
                    : "border-white/10 bg-[#070B14]/70 text-[#F1F5F9]"
                }`}
              >
                {getText(m)}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/10 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 border border-white/10 bg-[#070B14]/70 px-3.5 py-2.5 text-sm text-[#F1F5F9] outline-none transition placeholder:text-[#94A3B8]/60 focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]"
        />
        <button
          type="submit"
          aria-label="Send"
          className="flex items-center justify-center border border-[#2F6BFF] bg-[#2F6BFF] px-3.5 text-white transition hover:bg-[#4A7FFF]"
        >
          <Send size={16} />
        </button>
      </form>
    </aside>
  );
}
