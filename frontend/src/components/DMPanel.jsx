import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, MessageSquare, Search } from "lucide-react";
import { searchUsers } from "../services/dmApi";
import useDM from "../hooks/useDM";
import { Avatar } from "./ui/shared";

export default function DMPanel({ socket, currentUser }) {
  const {
    conversations,
    activeConversation,
    messages,
    loadConversations,
    openConversation,
    sendMessage,
  } = useDM(socket, currentUser);

  const [input, setInput] = useState("");
  const [view, setView] = useState("list");
  const [title, setTitle] = useState("");
  const bottomRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        setResults(await searchUsers(query));
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleStartWith = async (u) => {
    await openConversation(u.id);
    setTitle(u.name);
    setView("chat");
    setQuery("");
    setResults([]);
    loadConversations();
  };

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, view]);

  const handleOpen = (c) => {
    openConversation(c.other_user_id);
    setTitle(c.other_user_name);
    setView("chat");
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  if (view === "chat") {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <button
            onClick={() => setView("list")}
            aria-label="Back to conversations"
            className="p-1.5 text-[#94A3B8] transition hover:text-[#67E8F9]"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="truncate text-sm font-bold">{title || "Chat"}</span>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {activeConversation && messages.length === 0 && (
            <p className="pt-6 text-center text-sm text-[#94A3B8]">No messages yet. Say hi.</p>
          )}
          {messages.map((m) => {
            const mine = m.sender_id === currentUser?.id;
            return (
              <div
                key={m.id}
                className={`max-w-[80%] border px-3.5 py-2 text-sm ${
                  mine
                    ? "ml-auto border-[#2F6BFF] bg-[#2F6BFF] text-white"
                    : "border-white/10 bg-[#101A2E] text-[#F1F5F9]"
                }`}
              >
                {m.content}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2 border-t border-white/10 p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative border-b border-white/10 p-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people to message…"
          className="peer w-full border border-white/10 bg-[#070B14]/70 py-2.5 pl-10 pr-3 text-sm text-[#F1F5F9] outline-none transition placeholder:text-[#94A3B8]/60 focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]"
        />
        <Search size={16} className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
      </div>
      <div className="flex-1 overflow-y-auto">
        {query.trim() ? (
          searching ? (
            <p className="p-4 text-sm text-[#94A3B8]">Searching…</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-sm text-[#94A3B8]">No users found</p>
          ) : (
            results.map((u, i) => (
              <button
                key={u.id}
                onClick={() => handleStartWith(u)}
                className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5"
              >
                <Avatar name={u.name} tone={i % 2 ? "violet" : "cobalt"} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{u.name}</p>
                  <p className="truncate text-xs text-[#94A3B8]">{u.email}</p>
                </div>
              </button>
            ))
          )
        ) : conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-[#94A3B8]">
            <MessageSquare size={28} />
            <p className="text-sm">No conversations yet. Search for someone above.</p>
          </div>
        ) : (
          conversations.map((c, i) => (
            <button
              key={c.conversation_id}
              onClick={() => handleOpen(c)}
              className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3.5 text-left transition hover:bg-white/5"
            >
              <Avatar name={c.other_user_name} tone={i % 2 ? "violet" : "cobalt"} />
              <span className="truncate text-sm font-bold">{c.other_user_name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
