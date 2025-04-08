import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "@/components/Home";
import AuthPage from "@/components/AuthPage";
import SessionManager from "@/components/SessionManager";
import CodingEnvi from "@/components/CodingEnvi";
import { auth } from "@/firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";
import "./styles/globals.css";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  if (user && location.pathname === "/auth") {
    return <Navigate to="/" replace />;
  }

  return user ? children : <Navigate to="/" replace />;
};

// Require No Auth Component
const RequireNoAuth = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  return user ? <Navigate to="/" replace /> : children;
};

// Home Route with Redirect for Logged-In Users
const HomeRoute = () => {
  const [user, loading] = useAuthState(auth);
  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  return user ? <Navigate to="/dashboard" replace /> : <Home />;
};

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  });
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route
          path="/auth"
          element={
            <RequireNoAuth>
              <AuthPage />
            </RequireNoAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <SessionManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coding-environment"
          element={
            <ProtectedRoute>
              <CodingEnvi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/session/:sessionId"
          element={
            <ProtectedRoute>
              <CodingEnvi />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);