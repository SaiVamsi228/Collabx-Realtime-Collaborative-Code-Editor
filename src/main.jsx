import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Home from "@/components/Home";
import AuthPage from "@/components/AuthPage";
import SessionManager from "@/components/SessionManager";
import { auth } from "@/firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";
import "./styles/globals.css";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  return user ? children : <Navigate to="/auth" />;
};

// App Wrapper
const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("App: Mounted, URL:", window.location.href);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("App: onAuthStateChanged fired - User:", user);
      if (user) {
        console.log("App: User authenticated, navigating to dashboard:", user.uid);
        navigate("/dashboard");
      } else {
        console.log("App: No user detected");
      }
    });

    return () => {
      console.log("App: Cleaning up auth listener");
      unsubscribe();
    };
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <SessionManager />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = anchor.getAttribute("href");
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  });
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);