import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaFire, FaPlusCircle, FaBell, FaUserCircle,FaUser } from 'react-icons/fa';
import { MdRateReview } from 'react-icons/md';

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    let userData = null;
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== "undefined") {
        userData = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(userData);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[95vw] max-w-3xl bg-white/80 backdrop-blur-lg rounded-full shadow-xl border border-gray-200 flex items-center justify-between px-4 py-2">
      {/* Left: Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-md">
          <span className="text-white text-lg font-bold">C</span>
        </div>
        <span className="font-bold text-gray-900 text-lg hidden sm:block">Cleverly</span>
      </Link>

      {/* Center: Nav Icons */}
      <div className="flex-1 flex justify-center gap-6">
        <Link to="/" className="group flex flex-col items-center text-gray-500 hover:text-sky-600 transition">
          <FaHome className="w-6 h-6" />
          <span className="text-xs mt-1 hidden sm:block">Home</span>
        </Link>
        <Link to="/trendings" className="group flex flex-col items-center text-gray-500 hover:text-orange-500 transition">
          <FaFire className="w-6 h-6" />
          <span className="text-xs mt-1 hidden sm:block">Trending</span>
        </Link>
        <Link to="/reviews" className="group flex flex-col items-center text-gray-500 hover:text-green-600 transition">
          <MdRateReview className="w-6 h-6" />
          <span className="text-xs mt-1 hidden sm:block">Reviews</span>
        </Link>
        <button className="group flex flex-col items-center text-gray-500 hover:text-sky-600 transition focus:outline-none" onClick={() => navigate('/reviews?create=true')} title="Create Review">
          <FaPlusCircle className="w-7 h-7 text-sky-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs mt-1 hidden sm:block">New</span>
        </button>
        <button className="group flex flex-col items-center text-gray-500 hover:text-pink-500 transition focus:outline-none" title="Notifications">
          <FaBell className="w-6 h-6" />
          <span className="text-xs mt-1 hidden sm:block">Alerts</span>
        </button>
        <Link to="/profile" className="group flex flex-col items-center text-gray-500 hover:text-purple-600 transition">
          <FaUser className="w-6 h-6" />
          <span className="text-xs mt-1 hidden sm:block">Profile</span>
        </Link>

      </div>

      {/* Right: User Avatar/Profile */}
      <div className="relative flex items-center">
        {isLoggedIn ? (
          <>
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="focus:outline-none">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-9 h-9 rounded-full border-2 border-sky-400 shadow" />
              ) : (
                <FaUserCircle className="w-9 h-9 text-gray-400" />
              )}
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-12 w-48 rounded-xl shadow-lg py-2 bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="px-4 py-2 text-gray-700 font-semibold">{user?.name}</div>
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-1.5 rounded-full bg-sky-500 text-white font-semibold shadow hover:bg-sky-600 transition">Sign in</Link>
            <Link to="/register" className="px-4 py-1.5 rounded-full bg-white border border-sky-500 text-sky-600 font-semibold shadow hover:bg-sky-50 transition">Sign up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}