import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, Bell, User, ChevronDown, Settings, LogOut, UserCircle } from 'lucide-react';

const Navbar = ({ 
  title = "Dashboard", 
  subtitle = "Welcome back, Admin!", 
  icon = Home,
  showSearch = true,
  showNotifications = true,
  showUserProfile = true,
  userName = "Admin",
  customActions = null
}) => {
  const IconComponent = icon;
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    // No logout functionality needed anymore
    setIsDropdownOpen(false);
    console.log('Sign out clicked - no authentication needed');
  };

  const handleProfile = () => {
    navigate('/admin-profile');
    setIsDropdownOpen(false);
  };

  const handleSettings = () => {
    navigate('/admin-settings');
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Section - Title */}
        <div className="flex items-center space-x-4">
          <IconComponent className="text-blue-600" size={24} />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>

        {/* Right Section - Search, Notifications, User */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                aria-label="Search"
              />
            </div>
          )}

          {/* Notifications */}
          {showNotifications && (
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          )}

          {/* Custom Actions */}
          {customActions && customActions}

          {/* User Profile with Dropdown */}
          {showUserProfile && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={16} />
                </div>
                <span className="text-sm font-medium text-gray-700">{userName}</span>
                <ChevronDown 
                  className={`text-gray-400 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                  size={16} 
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={handleProfile}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <UserCircle className="mr-3" size={16} />
                    Profile
                  </button>
                  <button
                    onClick={handleSettings}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="mr-3" size={16} />
                    Settings
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="mr-3" size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
