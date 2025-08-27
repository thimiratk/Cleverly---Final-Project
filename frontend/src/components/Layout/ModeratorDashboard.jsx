import React, { useState } from 'react';
import { Home, Users, Bell, Search, Grid3X3, ChevronDown, TrendingUp, Eye, Star, MessageSquare, BarChart3, Settings, Shield} from 'lucide-react';
import Header from './Header';
import coverImage from '../../assets/moderator_covr.png';


const ModeratorDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Total Reviews');
  const [selectedReported, setSelectedReported] = useState('Reported Reviews');
  const [selectedFake, setSelectedFake] = useState('Fake Reviews');


  // Create a constant for notifications (placed at the top of the file, before the component)
const notifications = [
  { text: "Actively involved in reviewing bogus and inappropriate comments, reviews and posts.", color: "bg-blue-50", textColor: "text-blue-800" },
  { text: "Take immediate action when it has detected a fake review or content.", color: "bg-yellow-50", textColor: "text-yellow-800" },
  { text: "Maintains quality standards and fights with fake content and misleading information.", color: "bg-green-50", textColor: "text-green-800" },
  { text: "Get in touch with local reviewer community to resolve content issues.", color: "bg-purple-50", textColor: "text-purple-800" },
  { text: "Special Notice: Continuing to see reported drivers who have had problems, the details. Continue looking into the issue.", color: "bg-red-50", textColor: "text-red-800" }
];



  // Sample chart data points for visualization
  const chartData = Array.from({length: 50}, (_, i) => ({
    x: i * 2,
    y: 50 + Math.sin(i * 0.3) * 20 + Math.random() * 10
  }));

  const SmallChart = ({ title, color = "#e2922aff" }) => (
    <div className="bg-white p-4 rounded">
      <h4 className="text-black text-sm mb-3">{title}</h4>
      <svg width="100%" height="80" viewBox="0 0 200 80" className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={chartData.slice(0, 30).map((point, i) => `${i * 6},${80 - point.y}`).join(' ')}
        />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Profile Header Section */}
<div 
  className="relative bg-cover bg-center pb-40" 
  style={{ backgroundImage: `url(${coverImage})` }}
>
  <div className="absolute inset-0 bg-black/30"></div>

  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10">
    <div className="relative">
      <img 
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format" 
        alt="Paul Heyman" 
        className="w-32 h-32 rounded-full border-4 border-white object-cover"
      />
    </div>
  </div>
</div>


      {/* Profile Info */}
      <div className="pt-20 pb-8 text-center">
        <div className="flex items-center justify-center space-x-2">
          <h1 className="text-2xl font-bold text-gray-800">Nevil Perera</h1>
          <Shield className="w-6 h-6 text-blue-500" />
        </div>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <span className="text-gray-600">Moderator Specialist for Laptop</span>
          <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
        </div>
        <div className="text-gray-600 text-sm mt-1">Top Local Admin</div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Special Notify Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Special Notify</h2>
          <Grid3X3 className="w-5 h-5 text-gray-400" />
        </div>

        {/* Map through the notifications array */}
        <div className="space-y-3 text-sm">
          {notifications.map((note, index) => (
            <div key={index} className={`p-3 ${note.color} rounded-lg`}>
              <p className={note.textColor}>{note.text}</p>
            </div>
          ))}
        </div>
      </div>


          {/* Manage Views Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Manage Views</h2>
              <Grid3X3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Active Users</span>
                  <span className="text-gray-600 text-sm">New Sign Ups</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">1K</span>
                  <span className="text-2xl font-bold">33,730</span>
                </div>
              </div>
              
              <div>
                <div className="text-gray-600 text-sm mb-1">Daily Active</div>
                <div className="text-2xl font-bold">52089</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-gray-800 font-medium mb-3">Categories</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Categories</span>
                  <span className="text-gray-800 font-medium">142</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Classification</span>
                  <span className="text-gray-800 font-medium">8</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-gray-600 text-sm mb-1">Requested / Pending Categories</div>
              <div className="text-2xl font-bold">19</div>
            </div>
          </div>

          {/* Manage Reviews Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Manage Reviews</h2>
              <Grid3X3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Total Reviews</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold">157.23K</div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Reported Reviews</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold">5.6K</div>
              </div>
              
              <div>
                <div className="text-gray-600 text-sm mb-1">Detected</div>
                <div className="text-lg font-medium">Fake Reviews</div>
                <div className="text-2xl font-bold">16K</div>
              </div>
            </div>
          </div>

        </div>

        {/* Analytics Dashboard Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Analytics Dashboard</h2>
            <Grid3X3 className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SmallChart title="New Users" />
            <SmallChart title="User Engagements (Weekly)" />
          </div>

          
        </div>

      </div>
    </div>
  );
};

export default ModeratorDashboard;