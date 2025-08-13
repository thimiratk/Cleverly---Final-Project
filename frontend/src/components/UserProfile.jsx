// src/components/UserProfile.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Edit, Camera } from "lucide-react";

const UserProfile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center p-8">
      {/* Profile Header Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
          {/* Profile Picture */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop&crop=face"
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <button className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* User Info */}
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-bold text-gray-800">Jane Doe</h2>
            <p className="text-gray-500 text-sm">@jane.doe</p>
            <p className="mt-4 text-gray-700">
              Frontend developer and design enthusiast. Building beautiful and
              functional user interfaces with React and Tailwind CSS.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors">
              <MessageSquare size={16} />
              <span>Message</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors">
              <Edit size={16} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Posts Section */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Posts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Example Post Card */}
          <div className="relative overflow-hidden rounded-xl shadow-lg group">
            <img
              src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=400&fit=crop"
              alt="Post Image"
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
              <div className="flex items-center space-x-2 text-white text-sm font-semibold">
                <Heart size={16} fill="white" />
                <span>2.1K</span>
              </div>
            </div>
          </div>
          {/* Repeat post card for more posts */}
          <div className="relative overflow-hidden rounded-xl shadow-lg group">
            <img
              src="https://images.unsplash.com/photo-1510915228340-29c85a40871e?w=400&h=400&fit=crop"
              alt="Post Image"
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
              <div className="flex items-center space-x-2 text-white text-sm font-semibold">
                <MessageSquare size={16} fill="white" />
                <span>345</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;