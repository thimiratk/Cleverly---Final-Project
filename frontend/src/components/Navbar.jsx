import React, { useState } from "react";
import { Search, Plus, Bell, Home, User, Flame, Compass } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo (clickable to Home) */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Cleverly</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            <Link
              to="/"
              className="text-gray-600 hover:text-sky-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/discover"
              className="text-gray-600 hover:text-green-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              <Compass className="w-4 h-4" />
              <span>Discover</span>
            </Link>

            <Link
              to="/trendings"
              className="text-gray-600 hover:text-orange-500 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              <Flame className="w-4 h-4" />
              <span>Trending</span>
            </Link>

            <Link
              to="/profile"
              className="text-gray-600 hover:text-purple-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products, reviews, or users..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Sign In Button */}
            <Link
              to="/login"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              style={{ marginRight: '0.5rem' }}
            >
              Sign In
            </Link>
            {/* Create Review Button */}
            <Link
              to="/reviews/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Review</span>
            </Link>

            {/* Notifications */}
            <button className="relative p-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="w-8 h-8 bg-gray-400 rounded-full"
              ></button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2">
                  <div className="px-4 py-3 border-b">
                    <div className="font-semibold text-gray-900">John Doe</div>
                    <div className="text-sm text-gray-600">@johndoe_reviews</div>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="text-sm text-gray-600">Trust Score:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        87%
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      <span>My Profile</span>
                    </Link>

                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="ml-7">Settings</span>
                    </button>

                    <div className="border-t my-1"></div>

                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <span className="ml-7">Sign Out</span>
                    </button>


                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
