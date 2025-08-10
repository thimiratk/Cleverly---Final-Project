import React, { useState } from 'react';
import { Home, Bell, Search, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const navigate = useNavigate();

  // Dummy notifications data
  const notifications = [
    { id: 1, title: "New Review Posted", message: "Jack Gabel posted a new review on your product", time: "2 minutes ago", unread: true },
    { id: 2, title: "Profile Update", message: "Your profile has been successfully updated", time: "1 hour ago", unread: true },
    { id: 3, title: "New Follower", message: "Sarah Johnson started following you", time: "3 hours ago", unread: false },
    { id: 4, title: "System Notification", message: "Scheduled maintenance tonight at 2 AM EST", time: "5 hours ago", unread: false }
  ];

  // Sample search results
  const searchResults = [
    { id: 1, title: "iPhone 15 Pro Reviews", type: "Product" },
    { id: 2, title: "Best Laptops 2024", type: "Category" },
    { id: 3, title: "John Smith", type: "User" },
    { id: 4, title: "Restaurant Reviews", type: "Category" }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    // Close dropdowns after navigation
    setShowNotifications(false);
    setShowUserMenu(false);
    setShowSearchResults(false);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      handleNavigation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(e.target.value.length > 0);
  };

  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 px-6 py-4 flex items-center justify-between">
        
        {/* Logo / Title */}
        <div 
          className="text-white font-bold text-xl cursor-pointer hover:text-blue-200 transition-colors"
          onClick={() => handleNavigation('/')}
        >
          CLEVERLY
        </div>
        
        <div className="flex items-center space-x-6">
          
          {/* Home Icon */}
          <Home 
            className="w-6 h-6 text-white cursor-pointer hover:text-blue-200 transition-colors" 
            onClick={() => handleNavigation('/')}
            title="Home"
          />
          
          {/* User Menu */}
          <div className="relative">
            <User
              className="w-6.5 h-6.5 p-1 bg-blue-500 text-white cursor-pointer hover:bg-blue-400 rounded-full border-2 border-white transition-colors" 
              onClick={() => setShowUserMenu(!showUserMenu)}
              title="User Menu"
            />
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => handleNavigation('/userprofile')}
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                >
                  My Profile
                </button>
                <button
                  onClick={() => handleNavigation('/settings')}
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                >
                  Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => handleNavigation('/logout')}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <Bell 
              className="w-6 h-6 text-white cursor-pointer hover:text-blue-200 transition-colors" 
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications.filter(n => n.unread).length}
            </div>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                </div>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${n.unread ? 'bg-blue-50' : ''}`}
                    onClick={() => handleNavigation(`/notification/${n.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm">{n.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{n.message}</p>
                        <p className="text-gray-400 text-xs mt-2">{n.time}</p>
                      </div>
                      {n.unread && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>}
                    </div>
                  </div>
                ))}
                <div className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleNavigation('/notifications')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              className="bg-white rounded-full px-10 py-2 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 relative"
            />
            {searchQuery && (
              <X 
                className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer hover:text-gray-600"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
              />
            )}
            {showSearchResults && searchQuery && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50 max-h-64 overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800 text-sm">Search Results</h3>
                </div>
                {searchResults
                  .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((r) => (
                  <div
                    key={r.id}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleNavigation(`/search/${r.type.toLowerCase()}/${r.id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 text-sm">{r.title}</span>
                      <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded">{r.type}</span>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-2 border-t border-gray-200 mt-2">
                  <button
                    onClick={handleSearch}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    See all results for "{searchQuery}"
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay to close dropdowns */}
      {(showNotifications || showUserMenu || showSearchResults) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
            setShowSearchResults(false);
          }}
        />
      )}
    </div>
  );
};

export default Header;
