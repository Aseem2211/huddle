
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import axiosClient from "../services/axiosclient";
import AvatarUpload from "../components/AvatarUpload";
import {
  PageShell,
  Notice,
  TextField,
  UserIcon,
  SpinnerIcon,
  glassCard,
  primaryBtn,
  ghostBtn,
} from "../components/ui/shared";

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

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
    <PageShell title="Profile" subtitle="Your name and photo" onBack={() => navigate("/home")}>
      <section className={`${glassCard} text-center`}>
        <AvatarUpload
          currentAvatarUrl={user?.avatar_url || user?.avatarUrl}
          onUploadSuccess={handleAvatar}
          fallbackInitial={user?.name?.[0]?.toUpperCase() || "?"}
        />

        <div className="mt-8 border-t border-white/10 pt-6 text-left">
          {message.text && (
            <Notice type={message.type === "success" ? "success" : "error"}>{message.text}</Notice>
          )}

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
            <div className="space-y-5 text-center">
              <div>
                <h2 className="text-2xl font-black tracking-[-0.03em]">{user?.name}</h2>
                <p className="mt-1 text-sm text-[#94A3B8]">{user?.email}</p>
              </div>
              <button onClick={() => setEditing(true)} className={primaryBtn}>
                Edit profile
              </button>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}