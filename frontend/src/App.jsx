import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Reviews from "./pages/Reviews";
import { AuthProvider } from "./context/AuthContext";
import ProfilePage from "./pages/Profile";
import CreateReview from "./pages/WriteReview";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/create-review" element={<CreateReview />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
