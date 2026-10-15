import { useEffect, useState, useCallback } from "react";

export const useChat = (socket, roomId, currentUser) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        setMessages([]);
    }, [roomId]);

    useEffect(() => {
        if (!socket) {
            return;
        }
        const handleReceive = (msg) => {
            setMessages((prev) => (prev.some((m) => m.id && m.id === msg.id) ? prev : [...prev, msg]));
        };
        const handleHistory = (history) => {
            setMessages(Array.isArray(history) ? history : []);
        };
        socket.on("chat:receive", handleReceive);
        socket.on("chat:history", handleHistory);
        return () => {
            socket.off("chat:receive", handleReceive);
            socket.off("chat:history", handleHistory);
        };
    }, [socket]);

    const sendMessage = useCallback(
        (text) => {
            if (!socket || !text.trim()) {
                return;
            }
            socket.emit("chat:send", {
                roomId,
                senderId: currentUser?.id,
                message: text,
            });
        },
        [socket, roomId, currentUser?.id]
    );

    return { messages, sendMessage };
};
