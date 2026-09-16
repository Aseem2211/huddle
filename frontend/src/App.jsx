import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/Authcontext";
import ProtectedRoute from "./components/common/protectedroute";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Home from "./pages/Home";
import Room from "./pages/room";
import Messages from "./pages/messages";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home/>
              </ProtectedRoute>
            }
          />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages/>
            </ProtectedRoute>
            }
          />
          <Route path="/room/:roomId" element={
            <ProtectedRoute>
              <Room/>
            </ProtectedRoute>}/>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}