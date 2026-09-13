import axiosClient from "./axiosclient.js";
export async function createRoom({title,scheduledAt}={}){
    const res=await axiosClient.post("/rooms/create", { title, scheduledAt });
  return res.data;
}

export async function getRecentMeetings() {
  const res = await axiosClient.get("/rooms/recent");
  return res.data;
}
export async function joinRoom(roomId){
  const res=await axiosClient.get(`/rooms/${roomId}`);
  return res.data;
}