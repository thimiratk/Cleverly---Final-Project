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

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";
  return (
    <>
      <Toaster position="top-center" />
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      
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
