import { useEffect, useState } from "react";
import axiosClient from "../services/axiosclient";

export default function useRoomAccess(socket, roomId) {
  const [status, setStatus] = useState("checking");
  const [isHost, setIsHost] = useState(false);
  const [accessMode, setAccessMode] = useState("open");
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!socket || !roomId) return;
    let active = true;

    const onApproved = () => setStatus("allowed");
    const onDenied = () => setStatus("denied");
    const onDeleted = () => setStatus("deleted");
    const onPending = (list) => setRequests(list);
    const onRequest = (r) =>
      setRequests((p) => (p.some((x) => x.userId === r.userId) ? p : [...p, r]));
    const onCancelled = ({ userId }) =>
      setRequests((p) => p.filter((x) => x.userId !== userId));

    socket.on("join-approved", onApproved);
    socket.on("join-denied", onDenied);
    socket.on("room-deleted", onDeleted);
    socket.on("pending-requests", onPending);
    socket.on("join-request", onRequest);
    socket.on("request-cancelled", onCancelled);

    axiosClient
      .get(`/rooms/${roomId}`)
      .then(({ data }) => {
        if (!active) return;
        setIsHost(data.isHost);
        setAccessMode(data.accessMode);
        socket.emit("request-join", { roomId }, (res) => {
          if (active) setStatus(res.status);
        });
      })
      .catch(() => active && setStatus("not-found"));

    return () => {
      active = false;
      socket.off("join-approved", onApproved);
      socket.off("join-denied", onDenied);
      socket.off("room-deleted", onDeleted);
      socket.off("pending-requests", onPending);
      socket.off("join-request", onRequest);
      socket.off("request-cancelled", onCancelled);
    };
  }, [socket, roomId]);

  const respond = (r, allow) => {
    socket.emit("respond-join", { roomId, userId: r.userId, allow });
    setRequests((p) => p.filter((x) => x.userId !== r.userId));
  };

  const changeMode = async (mode) => {
    await axiosClient.patch(`/rooms/${roomId}/access`, { accessMode: mode });
    setAccessMode(mode);
  };

  const deleteRoom = () => axiosClient.delete(`/rooms/${roomId}`);

  return { status, isHost, accessMode, requests, respond, changeMode, deleteRoom };
}