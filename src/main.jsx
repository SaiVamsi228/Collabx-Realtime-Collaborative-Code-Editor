import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from '@/components/Home';
import AuthPage from '@/components/AuthPage';
import SessionManager from '@/components/SessionManager';
import { auth } from '@/firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import './styles/globals.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  // If user is logged in and trying to access /auth, redirect to home
  if (user && location.pathname === '/auth') {
    return <Navigate to="/" />;
  }

  // For protected routes, redirect to home if not authenticated
  return user ? children : <Navigate to="/" />;
};

// Require Auth Component (opposite of ProtectedRoute)
const RequireNoAuth = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  return user ? <Navigate to="/" /> : children;
};

// Add smooth scroll behavior for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
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
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);