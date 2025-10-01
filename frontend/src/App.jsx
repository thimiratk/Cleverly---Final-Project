import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import { useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Reviews from "./pages/Reviews";
import Trendings from "./pages/Trendings";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";

import { AuthProvider } from "./context/AuthContext";
import CreateReview from "./pages/WriteReview";
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
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/trendings" element={<Trendings />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-review" element={<CreateReview />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}