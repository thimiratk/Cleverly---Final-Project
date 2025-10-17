import React from 'react';
import { Home, User } from 'lucide-react';

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

        {/* Right Section - User Profile */}
        <div className="flex items-center space-x-4">
          {/* Custom Actions */}
          {customActions && customActions}

          {/* User Profile */}
          {showUserProfile && (
            <div className="flex items-center space-x-2 p-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700">{userName}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
