
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Send, MessageSquare } from "lucide-react";
import { useAuth } from "../context/Authcontext";
import { useConversations } from "../hooks/useConversations";
import { useDmChat } from "../hooks/useDmChat";
import * as dmApi from "../services/dmApi";
import { socket as socketClient } from "../socket/socketClient";
import { Mandala, Avatar, IconTile } from "../components/ui/shared";

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const socket = typeof socketClient === "function" ? socketClient() : socketClient;

  const { conversations, loading: convosLoading, bumpConversation } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeName, setActiveName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  const { messages, sendMessage } = useDmChat(socket, activeConversationId, user?.id, bumpConversation);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await dmApi.searchUsers(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversationWith = useCallback(async (otherUser) => {
    const conversation = await dmApi.startConversation(otherUser.id);
    setActiveConversationId(conversation.id || conversation.conversation_id);
    setActiveName(otherUser.name || "");
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  const activeConversation = conversations.find((c) => c.conversation_id === activeConversationId);
  const chatTitle = activeConversation?.other_user_name || activeName || "Chat";

  const avatar = (name, i = 0) => <Avatar name={name} tone={i % 2 ? "violet" : "cobalt"} />;

  return (
    <div className="flex h-screen bg-[#070B14] text-[#F1F5F9]">
      <aside
        className={`${activeConversationId ? "hidden md:flex" : "flex"} w-full flex-col border-r border-white/10 bg-[#101A2E]/70 backdrop-blur-2xl md:w-80`}
      >
        <div className="space-y-4 border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/home")}
              aria-label="Back to home"
              className="p-1.5 text-[#94A3B8] transition hover:text-[#67E8F9]"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-sm font-black uppercase tracking-[0.2em]">Messages</h1>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search people to message…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="peer w-full border border-white/10 bg-[#070B14]/70 py-2.5 pl-10 pr-3 text-sm text-[#F1F5F9] outline-none transition placeholder:text-[#94A3B8]/60 focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]"
            />
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors peer-focus:text-[#67E8F9]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {searchQuery.trim() ? (
            searching ? (
              <p className="p-4 text-sm text-[#94A3B8]">Searching…</p>
            ) : searchResults.length === 0 ? (
              <p className="p-4 text-sm text-[#94A3B8]">No users found</p>
            ) : (
              searchResults.map((u, i) => (
                <button
                  key={u.id}
                  onClick={() => openConversationWith(u)}
                  className="flex w-full items-center gap-3 border-b border-white/5 p-3 text-left transition hover:bg-white/5"
                >
                  {avatar(u.name, i)}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{u.name}</p>
                    <p className="truncate text-xs text-[#94A3B8]">{u.email}</p>
                  </div>
                </button>
              ))
            )
          ) : convosLoading ? (
            <p className="p-4 text-sm text-[#94A3B8]">Loading conversations…</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-[#94A3B8]">No conversations yet — search someone to start.</p>
          ) : (
            conversations.map((c, i) => (
              <button
                key={c.conversation_id}
                onClick={() => {
                  setActiveConversationId(c.conversation_id);
                  setActiveName(c.other_user_name || "");
                }}
                className={`flex w-full items-center gap-3 border-b border-white/5 border-l-2 p-3 text-left transition hover:bg-white/5 ${
                  activeConversationId === c.conversation_id
                    ? "border-l-[#67E8F9] bg-white/[0.06]"
                    : "border-l-transparent"
                }`}
              >
                {avatar(c.other_user_name, i)}
                <p className="truncate text-sm font-bold">{c.other_user_name}</p>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className={`${activeConversationId ? "flex" : "hidden md:flex"} relative flex-1 flex-col overflow-hidden`}>
        {!activeConversationId ? (
          <div className="relative flex flex-1 items-center justify-center overflow-hidden">
            <Mandala />
            <div className="relative flex flex-col items-center gap-3 text-center text-[#94A3B8]">
              <IconTile icon={MessageSquare} tone="cobalt" className="h-14 w-14" size={26} />
              <p className="font-bold text-[#F1F5F9]">Your messages</p>
              <p className="max-w-xs text-sm">Select a conversation or search for someone to message</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-white/10 bg-[#101A2E]/70 px-4 py-3 backdrop-blur-2xl">
              <button
                onClick={() => setActiveConversationId(null)}
                aria-label="Back to conversations"
                className="p-1.5 text-[#94A3B8] transition hover:text-[#67E8F9] md:hidden"
              >
                <ArrowLeft size={18} />
              </button>
              {avatar(chatTitle)}
              <span className="truncate text-sm font-black uppercase tracking-[0.14em]">{chatTitle}</span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {messages.map((m) => {
                const mine = m.sender_id === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`max-w-xs border px-4 py-2 text-sm md:max-w-md ${
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

            <form onSubmit={handleSend} className="flex gap-2 border-t border-white/10 bg-[#101A2E]/70 p-4 backdrop-blur-2xl">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 border border-white/10 bg-[#070B14]/70 px-4 py-2.5 text-sm text-[#F1F5F9] outline-none transition placeholder:text-[#94A3B8]/60 focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]"
              />
              <button
                type="submit"
                className="flex items-center gap-2 border border-[#2F6BFF] bg-[#2F6BFF] px-5 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#4A7FFF]"
              >
                Send <Send size={14} />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}