import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

const Header = () => (
  <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
    <div className="flex items-center space-x-4">
      <Menu className="w-6 h-6 text-gray-600" />
    </div>
    <div className="flex items-center space-x-4">
      <Search className="w-6 h-6 text-gray-400" />
      <Bell className="w-6 h-6 text-gray-400" />
      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
    </div>
  </div>
);

export default Header;
