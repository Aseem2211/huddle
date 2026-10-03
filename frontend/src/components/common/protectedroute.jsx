import { Navigate ,Outlet} from "react-router-dom";
import { useAuth } from "../../context/Authcontext";

export default function ProtectedRoute() {
  const { user,isAuthenticated, loading } = useAuth();
  
  console.log("ProtectedRoute:",{user,loading});
  if (loading) {
    return <div style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}