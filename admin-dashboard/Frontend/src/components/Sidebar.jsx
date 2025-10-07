import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, FileText, BarChart3, Menu, X, Shield, Award, Star, TrendingUp, AlertTriangle, CheckCircle, Globe } from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Platform Overview', icon: Home, path: '/' },
    { id: 'review-verification', label: 'Review Verification', icon: CheckCircle, path: '/review-verification' },
    { id: 'users', label: 'User & Badge System', icon: Award, path: '/users' },
    { id: 'fraud', label: 'Fraud Detection', icon: Shield, path: '/fraud' },
    { id: 'moderator', label: 'Moderator Hub', icon: Users, path: '/moderator' },
    { id: 'report', label: 'Report Management', icon: FileText, path: '/report' },
    { id: 'analytics', label: 'Trust Analytics', icon: BarChart3, path: '/analytics' },
    { id: 'domain-management', label: 'Domain Management', icon: Globe, path: '/domain-management' }
  ];

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-screen
        ${sidebarOpen ? 'w-64' : 'w-16'}
        bg-gradient-to-b from-blue-600 to-blue-800 
        text-white shadow-xl
        transition-all duration-300
        flex flex-col
        z-[999]
      `}
    >
      {/* Header */}
      <div className="sticky top-0 bg-blue-600 p-4 border-b border-blue-500/30">
        <div className="flex items-center justify-between">
          <h1 
            className={`font-bold text-xl whitespace-nowrap transition-all duration-300 ease-in-out
              ${sidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}
            `}
            style={{ display: 'inline-block' }}
          >
            Cleverly
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {sidebarOpen && (
          <p className="text-blue-200 text-xs mt-1">Consumer Review Platform</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-none">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-blue-700 transition-colors ${
                activeSection === item.id ? 'bg-blue-700 border-r-4 border-white' : ''
              }`}
              aria-label={`Navigate to ${item.label}`}
            >
              <IconComponent size={20} />
              <span
                className={`ml-3 whitespace-nowrap transition-all duration-300 ease-in-out
                  ${sidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}
                `}
                style={{ display: 'inline-block' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sticky bottom-0 bg-blue-600 p-4 border-t border-blue-500/30">
        <div 
          className={`flex items-center space-x-2 whitespace-nowrap transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}
          `}
          style={{ display: 'flex' }}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm">Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
