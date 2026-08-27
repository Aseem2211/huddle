import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/Authcontext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}