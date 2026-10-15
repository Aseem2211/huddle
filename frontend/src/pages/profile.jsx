import { useState } from "react";
import { UserRound, Mail } from "lucide-react";
import { useAuth } from "../context/Authcontext";
import axiosClient from "../services/axiosclient";
import AvatarUpload from "../components/AvatarUpload";
import AppShell from "../components/ui/AppShell";
import {
  Notice,
  TextField,
  UserIcon,
  SpinnerIcon,
  Card,
  IconTile,
  primaryBtn,
  ghostBtn,
} from "../components/ui/shared";

export default function Profile() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage({ type: "error", text: "Name can't be empty" });
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await axiosClient.put("/api/users/profile", { name });
      setUser?.(res.data.user || { ...user, name });
      setMessage({ type: "success", text: "Profile updated!" });
      setEditing(false);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatar = (url) => {
    setUser?.({ ...user, avatar_url: url, avatarUrl: url });
    setMessage({ type: "success", text: "Profile photo updated!" });
  };

  return (
    <AppShell eyebrow="Account" title="Profile" subtitle="Your name and photo, as other people see them." width="max-w-3xl">
      {message.text && (
        <Notice type={message.type === "success" ? "success" : "error"}>{message.text}</Notice>
      )}

      <div className="grid gap-5 md:grid-cols-5">
        <Card className="p-7 md:col-span-2">
          <AvatarUpload
            currentAvatarUrl={user?.avatar_url || user?.avatarUrl}
            onUploadSuccess={handleAvatar}
            fallbackInitial={user?.name?.[0]?.toUpperCase() || "?"}
          />
        </Card>

        <Card className="p-7 md:col-span-3">
          {editing ? (
            <div className="space-y-5">
              <TextField
                id="name"
                label="Name"
                icon={<UserIcon />}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={loading} className={primaryBtn}>
                  {loading ? <><SpinnerIcon /> Saving…</> : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setName(user?.name || "");
                    setMessage({ type: "", text: "" });
                  }}
                  className={`${ghostBtn} px-6`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <IconTile icon={UserRound} tone="cobalt" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">Name</p>
                  <p className="truncate text-lg font-bold">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <IconTile icon={Mail} tone="slate" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">Email</p>
                  <p className="truncate text-sm">{user?.email}</p>
                </div>
              </div>
              <button onClick={() => setEditing(true)} className={primaryBtn}>
                Edit profile
              </button>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
