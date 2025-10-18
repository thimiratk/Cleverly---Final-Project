import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera, Shield, Award, Users, Star, Eye, TrendingUp, AlertTriangle, CheckCircle, Clock, Flag, BadgeCheck, MessageSquare, ThumbsUp, UserCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import { adminAPI } from '../services/api';

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    department: '',
    role: '',
    joinDate: '',
    bio: '',
    permissions: []
  });

  const [tempData, setTempData] = useState(profileData);

  // Load admin profile data on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        const data = await adminAPI.getProfile();
        setProfileData(data);
        setTempData(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Fall back to default data if API fails
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setTempData(profileData);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updatedData = await adminAPI.updateProfile(tempData);
      setProfileData(updatedData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Platform-specific statistics for consumer review admin
  const adminStats = [
    { label: 'Verified Reviews', value: '45,672', icon: CheckCircle, color: 'bg-green-500', description: 'Reviews verified as authentic' },
    { label: 'Trusted Reviewers', value: '3,421', icon: Award, color: 'bg-blue-500', description: 'Users with trusted reviewer badges' },
    { label: 'Fraud Detection Rate', value: '94.8%', icon: Shield, color: 'bg-purple-500', description: 'Fake reviews successfully detected' },
    { label: 'Review Quality Score', value: '8.7/10', icon: Star, color: 'bg-yellow-500', description: 'Average platform review quality' }
  ];

  // Recent admin activities specific to review platform
  const recentActivities = [
    { 
      id: 1, 
      action: 'Verified authenticity of 24 flagged reviews', 
      time: '2 hours ago', 
      type: 'verification',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    { 
      id: 2, 
      action: 'Awarded "Trusted Reviewer" badge to user Emma Thompson', 
      time: '4 hours ago', 
      type: 'badge',
      icon: Award,
      color: 'text-blue-600'
    },
    { 
      id: 3, 
      action: 'Detected and removed fake review network (18 accounts)', 
      time: '6 hours ago', 
      type: 'fraud_detection',
      icon: Flag,
      color: 'text-red-600'
    },
    { 
      id: 4, 
      action: 'Updated ML model for sentiment analysis', 
      time: '1 day ago', 
      type: 'system',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    { 
      id: 5, 
      action: 'Moderated reported business profile: TechGadgets Store', 
      time: '2 days ago', 
      type: 'moderation',
      icon: AlertTriangle,
      color: 'text-orange-600'
    }
  ];

  // Platform management tools for review administrators
  const quickActions = [
    { label: 'Review Queue', icon: Eye, count: '23', color: 'bg-blue-500', description: 'Pending reviews for verification' },
    { label: 'Fraud Alerts', icon: AlertTriangle, count: '5', color: 'bg-red-500', description: 'Suspicious activity detected' },
    { label: 'Badge Requests', icon: Award, count: '12', color: 'bg-yellow-500', description: 'Users eligible for badges' },
    { label: 'User Reports', icon: Flag, count: '8', color: 'bg-orange-500', description: 'User-reported content' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        showSearch={false}
        customActions={
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Platform Administrator</span>
            <div className="w-2 h-2 bg-green-400 rounded-full" title="System Status: Online"></div>
          </div>
        }
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <button className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border-2 border-gray-100 hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profileData.name}</h1>
                <p className="text-xl text-gray-600 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-500" />
                  {profileData.role}
                </p>
                <p className="text-gray-500">{profileData.department}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined {new Date(profileData.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{profileData.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={tempData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{profileData.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={tempData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{profileData.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{profileData.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={tempData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{profileData.bio}</p>
                  </div>
                )}
              </div>

              {/* Admin Permissions */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Permissions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {profileData.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center px-3 py-2 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Activities */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button key={index} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${action.color} mr-3 group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{action.label}</p>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                    </div>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {action.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`p-2 rounded-full bg-gray-100`}>
                      <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
