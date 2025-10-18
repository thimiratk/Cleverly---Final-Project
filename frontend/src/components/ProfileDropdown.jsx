import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import API from '../services/api';

const ProfileDropdown = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await API.post('/logout');
      queryClient.invalidateQueries(['user']);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md hover:shadow-xl transition-all hover:scale-105 relative overflow-hidden"
      >
        <span className="w-full h-full flex items-center justify-center">
          {(user.name || user.username || 'U')[0].toUpperCase()}
        </span>
        {user.profilePicture && (
          <img
            src={user.profilePicture}
            alt={user.name || user.username || 'User'}
            className="absolute inset-0 w-full h-full object-cover rounded-xl"
            onError={(e) => {
              console.log('Navbar: Profile picture failed to load:', user.profilePicture);
              e.target.style.display = 'none';
            }}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md relative overflow-hidden">
                <span className="w-full h-full flex items-center justify-center">
                  {(user.name || user.username || 'U')[0].toUpperCase()}
                </span>
                {user.profilePicture && (
                  <img
                    src={user.profilePicture}
                    alt={user.name || user.username || 'User'}
                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      console.log('Navbar dropdown: Profile picture failed to load:', user.profilePicture);
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {user.name || user.username || 'Anonymous User'}
                </div>
                <div className="text-xs text-gray-600 truncate">{user.email}</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2 px-2">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 rounded-xl transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-medium">My Profile</span>
            </Link>

            <div className="border-t border-gray-100 my-2"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
