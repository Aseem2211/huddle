// src/pages/Messages.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/Authcontext";
import { useConversations } from "../hooks/useConversations";
import { useDmChat } from "../hooks/useDmChat";
import * as dmApi from "../services/dmApi";
import {socket}  from "../socket/socketClient"; // adjust to however you access your socket instance

export default function Messages() {
  const { user } = useAuth();
  const socket = socket();

  const { conversations, loading: convosLoading, bumpConversation } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [draft, setDraft] = useState("");

  const { messages, sendMessage } = useDmChat(socket, activeConversationId, user?.id, bumpConversation);

  // debounced user search
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

  const openConversationWith = useCallback(async (otherUserId) => {
    const conversation = await dmApi.startConversation(otherUserId);
    setActiveConversationId(conversation.id || conversation.conversation_id);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  const activeConversation = conversations.find(c => c.conversation_id === activeConversationId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search people to message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {searchQuery.trim() ? (
            // search mode
            searching ? (
              <p className="p-4 text-sm text-gray-400">Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="p-4 text-sm text-gray-400">No users found</p>
            ) : (
              searchResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => openConversationWith(u.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-400 text-white flex items-center justify-center font-bold">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </button>
              ))
            )
          ) : convosLoading ? (
            <p className="p-4 text-sm text-gray-400">Loading conversations...</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">No conversations yet — search someone to start.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.conversation_id}
                onClick={() => setActiveConversationId(c.conversation_id)}
                className={`w-full flex items-center gap-3 p-3 text-left hover:bg-purple-50 ${
                  activeConversationId === c.conversation_id ? "bg-purple-100" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-purple-400 text-white flex items-center justify-center font-bold">
                  {c.other_user_name?.[0]?.toUpperCase()}
                </div>
                <p className="font-semibold text-sm">{c.other_user_name}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat view */}
      <div className="flex-1 flex flex-col">
        {!activeConversationId ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation or search for someone to message
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-200 bg-white font-bold">
              {activeConversation?.other_user_name || "Chat"}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                    m.sender_id === user?.id
                      ? "bg-purple-600 text-white ml-auto"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {m.content}
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}