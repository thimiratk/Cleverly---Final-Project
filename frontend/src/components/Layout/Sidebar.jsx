// src/components/Layout/Sidebar.jsx
import React from "react";
import { Bookmark, CheckCircle, Settings } from "lucide-react";
import profileImage from "../../assets/profile.png"; // Update the filename to match your image

const Sidebar = () => {
  return (
    <div className="bg-gradient-to-b from-cyan-100 to-cyan-200 rounded-2xl p-4 h-fit">
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gray-300 mb-3 overflow-hidden">
          <img 
            src={profileImage} 
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-semibold text-gray-800">Poorni Abeysekara</h3>
      </div>

      {/* Activities Section */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b border-cyan-300 pb-2">
          Your Activities...
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-700 hover:text-blue-600 cursor-pointer transition-colors">
            <Bookmark className="w-4 h-4" />
            <span className="text-sm">Saved</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700 hover:text-blue-600 cursor-pointer transition-colors">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Suggestions</span>
          </div>
        </div>
      </div>

      {/* Bottom Profile Section */}
      <div className="border-t border-cyan-300 pt-4">
        <div className="flex flex-col items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-300 mb-2 overflow-hidden">
            <img 
              src={profileImage} 
              alt="Profile Small"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm text-gray-700">You</span>
        </div>

        <div className="flex items-center gap-3 text-gray-700 hover:text-blue-600 cursor-pointer transition-colors mb-4">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </div>

        {/* Footer Links */}
        <div className="text-xs text-gray-600 space-y-1">
          <p className="cursor-pointer hover:text-blue-600">Terms & Conditions</p>
          <p className="cursor-pointer hover:text-blue-600">Privacy Policies</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;