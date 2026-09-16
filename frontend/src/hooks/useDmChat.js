// src/hooks/useDmChat.js
import { useState, useEffect, useCallback } from "react";
import * as dmApi from "../services/dmApi";

export function useDmChat(socket, conversationId, currentUserId, onNewMessage) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    dmApi.getConversationMessages(conversationId)
      .then(setMessages)
      .catch((err) => console.error("Failed to load messages:", err))
      .finally(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    if (!socket) return;

    const handleNew = (message) => {
      if (message.conversation_id === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
      onNewMessage?.(message); // lets parent bump the conversation list even if this chat isn't open
    };

    socket.on("dm:new", handleNew);
    return () => socket.off("dm:new", handleNew);
  }, [socket, conversationId, onNewMessage]);

  const sendMessage = useCallback((content) => {
    if (!content.trim() || !socket || !conversationId) return;
    socket.emit("dm:send", { conversationId, content: content.trim() });
  }, [socket, conversationId]);

  return { messages, loading, sendMessage };
}