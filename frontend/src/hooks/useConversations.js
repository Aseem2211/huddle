// src/hooks/useConversations.js
import { useState, useEffect, useCallback } from "react";
import * as dmApi from "../services/dmApi";

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      const data = await dmApi.getConversations();
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Called when a new DM arrives via socket, to bump that conversation to top
  // and update its preview — without needing a full refetch.
  const bumpConversation = useCallback((message) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.conversation_id === message.conversation_id);
      if (idx === -1) {
        // message from a conversation not yet in the list (first-time contact) — refetch
        loadConversations();
        return prev;
      }
      const updated = [...prev];
      const [moved] = updated.splice(idx, 1);
      updated.unshift({ ...moved, last_message_at: message.created_at });
      return updated;
    });
  }, [loadConversations]);

  return { conversations, loading, refresh: loadConversations, bumpConversation };
}