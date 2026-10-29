// src/services/dmApi.js
import axiosClient from "./axiosclient";

export const searchUsers = async (query) => {
  const res = await axiosClient.get(`/users/search?q=${encodeURIComponent(query)}`);
  return res.data;
};

export const getConversations = async () => {
  const res = await axiosClient.get("/conversations");
  return res.data;
};

export const startConversation = async (otherUserId) => {
  const res = await axiosClient.post("/conversations/start", { otherUserId });
  return res.data;
};

export const getConversationMessages = async (conversationId) => {
  const res = await axiosClient.get(`/conversations/${conversationId}/messages`);
  return res.data;
};

export const sendMessageHttp = async (conversationId, content) => {
  const res = await axiosClient.post(`/conversations/${conversationId}/messages`, { content });
  return res.data;
};