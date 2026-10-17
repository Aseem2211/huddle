import { Navigate ,Outlet,useLocation} from "react-router-dom";
import { useAuth } from "../../context/Authcontext";

export default function ProtectedRoute() {
  const { user,isAuthenticated, loading } = useAuth();
  const location = useLocation();
  console.log("ProtectedRoute:",{user,loading});
  if (loading) {
    return <div style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>Loading…</div>;
  }
  if(!user){
    return <Navigate to="/login" state={{from:location.pathname}}replace/>
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}