import { useState, useEffect, useCallback } from "react";
import axiosClient from "../services/axiosclient";

export default function useDM(socket, currentUser) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  // join personal socket room once socket + user are ready
  useEffect(() => {
    if (!socket || !currentUser) return;
    socket.emit("dm:join", currentUser.id);
  }, [socket, currentUser]);

  // listen for incoming messages
  useEffect(() => {
    if (!socket) return;
    function handleReceive(message) {
      setMessages((prev) => {
        if (activeConversation && message.conversation_id === activeConversation.conversation_id) {
          return [...prev, message];
        }
        return prev;
      });
      // bump conversation list ordering / unread state could go here later
    }
    socket.on("dm:receive", handleReceive);
    return () => socket.off("dm:receive", handleReceive);
  }, [socket, activeConversation]);

  const loadConversations = useCallback(async () => {
    const res = await axiosClient.get("/dm/conversations");
    setConversations(res.data);
  }, []);

  const openConversation = useCallback(async (otherUserId) => {
    const startRes = await axiosClient.post("/dm/conversations/start", { otherUserId });
    const conversation = startRes.data;
    const historyRes = await axiosClient.get(`/dm/conversations/${conversation.id}/messages`);
    setActiveConversation({ conversation_id: conversation.id, otherUserId });
    setMessages(historyRes.data);
  }, []);

  const sendMessage = useCallback(
    (content) => {
      if (!socket || !activeConversation || !currentUser || !content.trim()) return;
      socket.emit("dm:send", {
        conversationId: activeConversation.conversation_id,
        senderId: currentUser.id,
        receiverId: activeConversation.otherUserId,
        content,
      });
    },
    [socket, activeConversation, currentUser]
  );

  return { conversations, activeConversation, messages, loadConversations, openConversation, sendMessage };
}