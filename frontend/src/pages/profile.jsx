// src/pages/Profile.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import axiosClient from "../services/axiosclient"; // adjust path if different

export default function Profile() {
  const { user, setUser } = useAuth(); // if setUser isn't exposed by your context, see note below
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSave = async () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate("/home")}
          className="mb-6 text-sm font-semibold text-purple-600 hover:text-purple-800"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold mb-4">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          {/* Profile picture upload — not built yet, this is a placeholder avatar */}

          {message.text && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setName(user?.name || "");
                  }}
                  className="px-5 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-extrabold text-gray-800">{user?.name}</h1>
              <p className="text-gray-500 mb-4">{user?.email}</p>
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}