import React, { useState } from 'react';
import { X, Camera, User, Mail, Lock, Briefcase, MapPin } from 'lucide-react';

// Mock UI components
const Button = ({ children, variant = 'default', size = 'default', className = '', onClick, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2 text-sm'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Avatar = ({ children, className = '' }) => (
  <div className={`relative inline-flex items-center justify-center overflow-hidden bg-gray-100 rounded-full ${className}`}>
    {children}
  </div>
);

const AvatarImage = ({ src, alt }) => (
  src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : null
);

const AvatarFallback = ({ children, className = '' }) => (
  <span className={`text-gray-500 ${className}`}>{children}</span>
);

// Profile Edit Modal Component
const ProfileEditModal = ({ isOpen, onClose, user, onSave }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    job: user?.job || '',
    location: user?.location || '',
    website: user?.website || '',
    profileImage: user?.avatar || null
  });

  const [accountData, setAccountData] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleAccountChange = (field, value) => {
    setAccountData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({ ...prev, profileImage: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (activeTab === 'account' && accountData.newPassword && accountData.newPassword !== accountData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    onSave({
      profile: profileData,
      account: accountData
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
            >
              <X size={24} />
            </Button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-4 mt-4">
            <Button
              onClick={() => setActiveTab('profile')}
              variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
              size="sm"
              className={activeTab === 'profile' 
                ? 'bg-white text-blue-600' 
                : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-20'
              }
            >
              Profile Details
            </Button>
            <Button
              onClick={() => setActiveTab('account')}
              variant={activeTab === 'account' ? 'secondary' : 'ghost'}
              size="sm"
              className={activeTab === 'account' 
                ? 'bg-white text-blue-600' 
                : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-20'
              }
            >
              Account Settings
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto max-h-[50vh]">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileData.profileImage} alt="Profile" />
                    <AvatarFallback className="text-2xl">
                      <User size={32} />
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="profile-image" className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
                    <Camera size={16} />
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">Click camera icon to change photo</p>
              </div>

              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.job}
                      onChange={(e) => handleProfileChange('job', e.target.value)}
                      className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your job title"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => handleProfileChange('location', e.target.value)}
                      className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  rows={3}
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-sm text-gray-500 mt-1">{profileData.bio.length}/200 characters</p>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={accountData.email}
                    onChange={(e) => handleAccountChange('email', e.target.value)}
                    className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={accountData.currentPassword}
                        onChange={(e) => handleAccountChange('currentPassword', e.target.value)}
                        className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={accountData.newPassword}
                        onChange={(e) => handleAccountChange('newPassword', e.target.value)}
                        className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={accountData.confirmPassword}
                        onChange={(e) => handleAccountChange('confirmPassword', e.target.value)}
                        className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  {accountData.newPassword && accountData.confirmPassword && accountData.newPassword !== accountData.confirmPassword && (
                    <p className="text-red-500 text-sm">Passwords do not match</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;