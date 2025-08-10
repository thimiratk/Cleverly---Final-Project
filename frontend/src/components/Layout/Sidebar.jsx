import React from 'react';
import {
  MapPin,
  Search,
  Calendar,
  Activity,
  BarChart3,
  Briefcase,
  User,
  Users,
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'feed', icon: Calendar, label: 'Feed' },
    { id: 'explore', icon: Search, label: 'Explore' },
    { id: 'insights', icon: BarChart3, label: 'Insights' },
    { id: 'activity', icon: Activity, label: 'Activity' },
    { id: 'posts', icon: Briefcase, label: 'Posts' },
    { id: 'wallet', icon: User, label: 'Wallet' },
    { id: 'customers', icon: Users, label: 'Customers', badge: true }
  ];

  return (
    <div className="w-64 bg-white h-full border-r border-gray-200 p-4">
      {/* Logo */}
      <div className="flex items-center mb-8">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-2">
          <MapPin className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Menu Items */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === item.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto pt-8">
        <div className="text-sm text-gray-500 mb-2">Net Profit</div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div>
            <div className="font-medium text-gray-800">User</div>
            <div className="text-xs text-gray-500">Profile</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
