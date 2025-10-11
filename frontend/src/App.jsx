import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from "./components/Navbar";
import { useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";


import Trendings from "./pages/Trendings";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";


import NotFound from "./pages/404Page";
import { AuthProvider } from "./context/AuthContext";

import LoadingScreen from "./pages/LoadingScreen";
import ForgotPassword from "./pages/ForgotPassword";



function AppContent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Minimum viewing time for the loading screen
    const timer = setTimeout(() => {
      setLoading(false); // hide splash
    }, 4000); // 4 seconds total (enough time to see the drawing animation)

    return () => clearTimeout(timer); // cleanup
  }, []);

  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/forgot-password";

  // Show loading screen while loading
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Toaster position="top-center" />
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/trendings" element={<Trendings />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/profile" element={<Profile />} />
        {/* 404 Not Found Route */}
        <Route path="404" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}
