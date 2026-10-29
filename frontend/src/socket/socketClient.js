import { io } from "socket.io-client";

const SOCKET_URL = (import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_API_URL || "https://huddle-g0v2.onrender.com")
  .replace(/\/$/, "")
  .replace(/\/api$/, "");

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  auth: (cb) => cb({ token: localStorage.getItem("token") }),
});

export const reconnectSocket = () => {
  socket.disconnect();
  socket.connect();
};
