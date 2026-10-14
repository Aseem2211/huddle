
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import axiosClient from "../services/axiosclient";
import {
  PageShell,
  Notice,
  PasswordField,
  SpinnerIcon,
  glassCard,
  primaryBtn,
} from "../components/ui/shared";

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords don't match" });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }

    setLoading(true);
    try {
      await axiosClient.put("/api/users/change-password", {
        oldPassword,
        newPassword,
      });
      setMessage({ type: "success", text: "Password updated!" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Settings"
      subtitle={`Logged in as ${user?.email}`}
      onBack={() => navigate("/home")}
    >
      <section className={glassCard}>
        <h2 className="mb-5 text-sm font-black uppercase tracking-[0.2em]">Change password</h2>

        {message.text && (
          <Notice type={message.type === "success" ? "success" : "error"}>{message.text}</Notice>
        )}

        <form onSubmit={handleChangePassword} noValidate className="space-y-5">
          <PasswordField
            id="oldPassword"
            label="Current password"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <PasswordField
            id="newPassword"
            label="New password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit" disabled={loading} className={primaryBtn}>
            {loading ? <><SpinnerIcon /> Updating…</> : "Update password"}
          </button>
        </form>
      </section>

      <section className={`${glassCard} opacity-60`}>
        <h2 className="mb-1 text-sm font-black uppercase tracking-[0.2em]">Email verification</h2>
        <p className="text-sm text-[#94A3B8]">Coming soon — OTP verification flow.</p>
      </section>
    </PageShell>
  );
}