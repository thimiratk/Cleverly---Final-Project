import React, { useState } from "react";
import { Search, Plus, Home, Flame, Compass, X, User, Bell } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import API from "../services/api";
import CreateReview from "./CreateReview/";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";
import logo from "../assets/logo.jpeg";

export default function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  
  const handleLogout = async () => {
    try {
      await API.post("/logout");
      queryClient.invalidateQueries(["user"]);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSearchInputChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Fetch suggestions if query is at least 2 characters
    if (value.trim().length >= 2) {
      try {
        // Fetch both reviews and users
        const [reviewsResponse, usersResponse] = await Promise.all([
          API.get(`/reviews/search`, {
            params: { 
              q: value,
              limit: 3 
            }
          }).catch(() => ({ data: { reviews: [] } })),
          API.get(`/user-profile/search`, {
            params: { 
              q: value,
              limit: 2 
            }
          }).catch(() => ({ data: { users: [] } }))
        ]);
        
        const reviews = reviewsResponse.data.reviews || [];
        const users = usersResponse.data.users || [];
        
        // Combine suggestions
        const reviewSuggestions = reviews.map(r => ({
          text: r.product,
          category: r.category?.name || r.exceptionalCategory || 'Uncategorized',
          type: 'review'
        }));

        const userSuggestions = users.map(u => ({
          text: u.name,
          category: `@${u.username}`,
          type: 'user',
          userId: u.id
        }));

        const allSuggestions = [...userSuggestions, ...reviewSuggestions].slice(0, 5);

        setSearchSuggestions(allSuggestions);
        setShowSuggestions(allSuggestions.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    setSearchQuery('');
    
    // If it's a user suggestion, navigate directly to their profile
    if (suggestion.type === 'user' && suggestion.userId) {
      navigate(`/user-profile/${suggestion.userId}`);
    } else {
      // Otherwise navigate to search results
      navigate(`/search?q=${encodeURIComponent(suggestion.text)}`);
    }
  };

  // Helper to check if route is active
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Create Review Modal - positioned at root level */}
      {isModalOpen && (
        <CreateReview 
          onClose={() => setIsModalOpen(false)} 
          onReviewCreated={() => setIsModalOpen(false)} 
        />
      )}

      {/* Desktop/Tablet Top Navbar - MODERN DESIGN */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 fixed top-0 left-0 w-full z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Left Side - Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <img src={logo} alt="Cleverly" className="w-9 h-9 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-all" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent hidden sm:block">
                  Cleverly
                </span>
              </Link>
            </div>

            {/* Center Section - Navigation + Search */}
            <div className="flex-1 flex items-center justify-center space-x-2 lg:space-x-6">
              {/* Mobile/Tablet Menu Button (for md screens) */}
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Navigation - Desktop */}
              <nav className="hidden lg:flex items-center space-x-1">
                <Link
                  to="/"
                  className={`flex items-center px-3 lg:px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                    isActive("/")
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md shadow-purple-500/30"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/discover"
                  className={`flex items-center px-3 lg:px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                    isActive("/discover")
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                  }`}
                >
                  <Compass className="w-4 h-4 mr-2" />
                  <span>Discover</span>
                </Link>
                <Link
                  to="/trendings"
                  className={`flex items-center px-3 lg:px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                    isActive("/trendings")
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md shadow-orange-500/30"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                  }`}
                >
                  <Flame className="w-4 h-4 mr-2" />
                  <span>Trending</span>
                </Link>
              </nav>

              {/* Search bar - Desktop */}
              <div className="hidden lg:block max-w-sm xl:max-w-md w-full relative">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search reviews, topics..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all border border-transparent focus:border-purple-200"
                  />
                </form>
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          {suggestion.type === 'user' && (
                            <User className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{suggestion.text}</div>
                            <div className="text-xs text-gray-500">{suggestion.category}</div>
                          </div>
                        </div>
                        {suggestion.type === 'user' ? (
                          <User className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Search className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              {!isLoading && !user && (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 lg:px-5 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all"
                >
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Login</span>
                </Link>
              )}
              
              {/* Review Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 lg:px-5 py-2 rounded-xl text-sm font-medium flex items-center shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Review</span>
              </button>
              
              {/* Notifications */}
              {user && <NotificationDropdown />}
              
              {/* User Profile Dropdown */}
              {user && <ProfileDropdown user={user} />}
            </div>

            {/* Mobile Search Icon */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {isSearchOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Search className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Search Bar (slides down) */}
          {isSearchOpen && (
            <div className="md:hidden pb-4">
              <div className="relative">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    placeholder="Search reviews, topics..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-200"
                    autoFocus
                  />
                </form>
                
                {/* Mobile Search Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          {suggestion.type === 'user' && (
                            <User className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{suggestion.text}</div>
                            <div className="text-xs text-gray-500">{suggestion.category}</div>
                          </div>
                        </div>
                        {suggestion.type === 'user' ? (
                          <User className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Search className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ULTRA MODERN Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-[100] shadow-2xl safe-area-inset-bottom">
        {/* Active indicator bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
        
        <div className="relative flex items-end justify-around px-3 pt-2 pb-6">
          {/* Home */}
          <Link
            to="/"
            className="flex flex-col items-center justify-center relative group"
          >
            <div className={`p-3 rounded-2xl transition-all duration-300 ${
              isActive("/") 
                ? "bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/50 scale-110" 
                : "bg-transparent"
            }`}>
              <Home className={`w-6 h-6 transition-colors ${
                isActive("/") ? "text-white" : "text-gray-400"
              }`} />
            </div>
            {isActive("/") && (
              <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-purple-500"></div>
            )}
          </Link>

          {/* Discover */}
          <Link
            to="/discover"
            className="flex flex-col items-center justify-center relative group"
          >
            <div className={`p-3 rounded-2xl transition-all duration-300 ${
              isActive("/discover") 
                ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50 scale-110" 
                : "bg-transparent"
            }`}>
              <Compass className={`w-6 h-6 transition-colors ${
                isActive("/discover") ? "text-white" : "text-gray-400"
              }`} />
            </div>
            {isActive("/discover") && (
              <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-500"></div>
            )}
          </Link>

          {/* Create Review - Floating FAB */}
          <Link
            to="/create-review"
            className="flex flex-col items-center justify-center -mt-8 relative group"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
              {/* Button */}
              <div className="relative w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                <Plus className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-20"></div>
            </div>
          </Link>

          {/* Trending */}
          <Link
            to="/trendings"
            className="flex flex-col items-center justify-center relative group"
          >
            <div className={`p-3 rounded-2xl transition-all duration-300 ${
              isActive("/trendings") 
                ? "bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/50 scale-110" 
                : "bg-transparent"
            }`}>
              <Flame className={`w-6 h-6 transition-colors ${
                isActive("/trendings") ? "text-white" : "text-gray-400"
              }`} />
            </div>
            {isActive("/trendings") && (
              <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-orange-500"></div>
            )}
          </Link>

          {/* Profile */}
          {user ? (
            <button
              onClick={toggleDropdown}
              className="flex flex-col items-center justify-center relative group"
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 ${
                isActive("/profile") 
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50 scale-110" 
                  : "bg-transparent"
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold relative overflow-hidden ${
                  isActive("/profile") 
                    ? "bg-white text-green-600" 
                    : "bg-gray-300 text-gray-600"
                }`}>
                  {/* Always show the fallback first */}
                  <span className="w-full h-full flex items-center justify-center">
                    {(user.name || user.username || 'U')[0].toUpperCase()}
                  </span>
                  
                  {/* Profile picture overlay */}
                  {user.profilePicture && (
                    <img
                      src={user.profilePicture}
                      alt={user.name || user.username || 'User'}
                      className="absolute inset-0 w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        console.log('Mobile navbar: Profile picture failed to load:', user.profilePicture);
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>
              {isActive("/profile") && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-green-500"></div>
              )}
            </button>
          ) : (
            <Link
              to="/login"
              className="flex flex-col items-center justify-center relative group"
            >
              <div className="p-3 rounded-2xl bg-transparent">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            </Link>
          )}
        </div>
      </nav>

      {/* Ultra Modern Mobile Dropdown */}
      {isDropdownOpen && user && (
        <>
          {/* Backdrop with blur */}
          <div 
            className="md:hidden fixed inset-0 bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-sm z-[110] transition-opacity"
            onClick={toggleDropdown}
          ></div>
          
          {/* Slide up panel */}
          <div 
            className="md:hidden fixed bottom-0 left-0 right-0 z-[120] transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="bg-gradient-to-b from-white/0 to-white pt-4 pb-2 rounded-t-3xl">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto"></div>
            </div>
            
            {/* Content */}
            <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden">
              {/* Profile Header with gradient */}
              <div className="relative px-6 py-6 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 text-white overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-2xl font-bold border-2 border-white/30 shadow-xl">
                    {(user.name || user.username || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">{user.name || user.username || 'Anonymous User'}</div>
                    <div className="text-white/80 text-sm">{user.email}</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-2 pb-24">
                <Link
                  to="/profile"
                  onClick={toggleDropdown}
                  className="flex items-center space-x-4 px-4 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">My Profile</div>
                    <div className="text-xs text-gray-500">View and edit profile</div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-4 px-4 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-red-600">Sign Out</div>
                    <div className="text-xs text-red-400">Come back soon!</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}