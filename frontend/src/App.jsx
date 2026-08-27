import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/Authcontext";
import ProtectedRoute from "./components/common/protectedroute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ color: "#fff", padding: 40 }}>
      <h1>Welcome, {user?.name}</h1>
      <p>{user?.email}</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}