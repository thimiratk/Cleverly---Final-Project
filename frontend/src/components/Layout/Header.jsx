// src/components/Layout/Header.jsx
import React, { useState } from 'react';
import { Home, Flame, Users, User, Bell, Search } from 'lucide-react';

const Header = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <header className="bg-gradient-to-r from-cyan-400 to-blue-500 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-white font-bold text-xl">
              CLEVERLY
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-6">
            <Home 
              className={`w-6 h-6 cursor-pointer transition-colors ${
                activeTab === 'home' ? 'text-white' : 'text-blue-100 hover:text-white'
              }`}
              onClick={() => setActiveTab('home')}
            />
            <Flame 
              className={`w-6 h-6 cursor-pointer transition-colors ${
                activeTab === 'trending' ? 'text-white' : 'text-blue-100 hover:text-white'
              }`}
              onClick={() => setActiveTab('trending')}
            />
            <Users 
              className={`w-6 h-6 cursor-pointer transition-colors ${
                activeTab === 'community' ? 'text-white' : 'text-blue-100 hover:text-white'
              }`}
              onClick={() => setActiveTab('community')}
            />
            <User 
              className={`w-6 h-6 cursor-pointer transition-colors ${
                activeTab === 'profile' ? 'text-white' : 'text-blue-100 hover:text-white'
              }`}
              onClick={() => setActiveTab('profile')}
            />
            <Bell 
              className="w-6 h-6 text-blue-100 hover:text-white cursor-pointer transition-colors"
            />

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-white rounded-full px-10 py-2 w-48 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;