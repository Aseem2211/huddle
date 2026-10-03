import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/Authcontext";
import ProtectedRoute from "./components/common/protectedroute";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Home from "./pages/home";
import Room from "./pages/room";
import Messages from "./pages/messages";
import Profile from "./pages/profile";
import Settings from "./pages/settings";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        
      </BrowserRouter>
    </AuthProvider>
  );
}