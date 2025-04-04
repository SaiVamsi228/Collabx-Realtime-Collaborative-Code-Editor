import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from '@/components/Home';
import AuthPage from '@/components/AuthPage';
import SessionManager from '@/components/SessionManager'; // Adjust the import path as needed
import { auth } from '@/firebase.js'; // Adjust the path to your Firebase config
import { useAuthState } from 'react-firebase-hooks/auth'; // For auth state management
import './styles/globals.css';

// Protected Route Component
const ProtectedRoute = ({ children }) =>   {
  const [user, loading] = useAuthState(auth);
  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  return user ? children : <Navigate to="/auth" />;
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
  // <React.StrictMode>
    <BrowserRouter>
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
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/__/auth/handler" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  // </React.StrictMode>
);