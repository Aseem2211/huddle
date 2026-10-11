import axiosClient from "./axiosclient.js";

export async function signup({ name, email, password }) {
  const res = await axiosClient.post("/auth/signup", { name, email, password });
  return res.data;
}
export async function login({ email, password }) {
  const res = await axiosClient.post("/auth/login", { email, password });
  return res.data;
}
export async function getme(token) {
  const res = await axiosClient.get("/auth/me", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}
export async function verifyOtp({ email, otp }) {
  const res = await axiosClient.post("/auth/verify-otp", { email, otp });
  return res.data;
}
export async function resendOtp({ email }) {
  const res = await axiosClient.post("/auth/resend-otp", { email });
  return res.data;
}
export async function forgotPassword({ email }) {
  const res = await axiosClient.post("/auth/forgot-password", { email });
  return res.data;
}
export async function resetPassword({ email, otp, newPassword }) {
  const res = await axiosClient.post("/auth/reset-password", { email, otp, newPassword });
  return res.data;
}
