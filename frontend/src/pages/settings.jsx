
import { useState } from "react";
import { KeyRound, MailCheck } from "lucide-react";
import { useAuth } from "../context/Authcontext";
import axiosClient from "../services/axiosclient";
import AppShell from "../components/ui/AppShell";
import {
  Notice,
  PasswordField,
  SpinnerIcon,
  Card,
  IconTile,
  Pill,
  primaryBtn,
} from "../components/ui/shared";

export default function Settings() {
  const { user } = useAuth();

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
    <AppShell
      eyebrow="Account"
      title="Settings"
      subtitle={`Signed in as ${user?.email}`}
      width="max-w-3xl"
    >
      <Card className="p-7">
        <div className="mb-6 flex items-center gap-4">
          <IconTile icon={KeyRound} tone="cobalt" />
          <div>
            <h2 className="text-base font-bold">Change password</h2>
            <p className="text-sm text-[#94A3B8]">Use at least 8 characters.</p>
          </div>
        </div>

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
          <div className="grid gap-5 sm:grid-cols-2">
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
          </div>
          <button type="submit" disabled={loading} className={`${primaryBtn} sm:w-auto sm:px-8`}>
            {loading ? <><SpinnerIcon /> Updating…</> : "Update password"}
          </button>
        </form>
      </Card>

      <Card className="mt-5 flex items-center gap-4 p-6">
        <IconTile icon={MailCheck} tone="slate" />
        <div className="flex-1">
          <h2 className="text-base font-bold">Email verification</h2>
          <p className="text-sm text-[#94A3B8]">OTP verification flow.</p>
        </div>
        <Pill tone="violet">Coming soon</Pill>
      </Card>
    </AppShell>
  );
}
