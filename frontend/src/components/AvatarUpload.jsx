


import { useState, useRef, useEffect } from "react";
import axiosClient from "../services/axiosclient.js";
import { Notice, SpinnerIcon, CameraIcon, ghostBtn } from "./ui/shared.jsx";

const UPLOAD_PATH = "/api/auth/upload-avatar";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export function resolveUrl(url) {
  if (!url) return null;
  if (/^(https?:|blob:|data:)/.test(url)) return url;
  const base = (axiosClient.defaults.baseURL || "").replace(/\/api\/?$/, "").replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function UserAvatar({ user, className = "h-8 w-8 text-xs" }) {
  const url = resolveUrl(user?.avatar_url || user?.avatarUrl);
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return url ? (
    <img src={url} alt="" className={`${className} object-cover`} />
  ) : (
    <span className={`${className} flex items-center justify-center bg-[#2563EB] font-bold text-white`}>
      {initials}
    </span>
  );
}

export default function AvatarUpload({ currentAvatarUrl, onUploadSuccess, fallbackInitial = "?" }) {
  const [preview, setPreview] = useState(resolveUrl(currentAvatarUrl));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    setPreview(resolveUrl(currentAvatarUrl));
  }, [currentAvatarUrl]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, or WEBP images are allowed");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File must be under 5MB");
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const localUrl = URL.createObjectURL(file);
    objectUrlRef.current = localUrl;
    setPreview(localUrl);
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await axiosClient.post(UPLOAD_PATH, formData);
      const url = res.data.avatarUrl || res.data.avatar_url || res.data.url;
      onUploadSuccess?.(url);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Upload failed");
      setPreview(resolveUrl(currentAvatarUrl));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        aria-label="Change profile photo"
        className="group relative h-28 w-28 overflow-hidden border border-white/15 bg-[#080D1B] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]"
      >
        {preview ? (
          <img src={preview} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-[#2563EB] text-4xl font-black text-white">
            {fallbackInitial}
          </span>
        )}
        <span
          className={`absolute inset-0 flex items-center justify-center bg-[#080D1B]/70 text-[#F4F7FF] transition ${
            uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus:opacity-100"
          }`}
        >
          {uploading ? <SpinnerIcon /> : <CameraIcon />}
        </span>
      </button>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={ghostBtn}
      >
        {uploading ? "Uploading…" : "Change photo"}
      </button>

      <p className="text-xs text-[#A8B5CC]">JPEG, PNG or WEBP, up to 5MB</p>

      {error && (
        <div className="w-full">
          <Notice type="error">{error}</Notice>
        </div>
      )}
    </div>
  );
}