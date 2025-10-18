/**
 * Badge Management Page
 * Complete badge system with Overview, Assign, and Create tabs
 */

import React, { useState, useEffect } from 'react';
import { 
  Award, Users, Plus, Eye, Check, X, Upload, Image as ImageIcon,
  TrendingUp, CheckCircle, Calendar, Search, Filter, Trash2
} from 'lucide-react';
import * as badgeAPI from '../services/badgeAPI';

const BadgeManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [badges, setBadges] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  // Form states for Create tab
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    category: 'all',
    criteria: {
      followers: { enabled: false, operator: 'more_than', value: 0 },
      trustScore: { enabled: false, operator: 'more_than', value: 0 },
      totalUpvotes: { enabled: false, operator: 'more_than', value: 0 },
      totalComments: { enabled: false, operator: 'more_than', value: 0 },
      totalAgreeComments: { enabled: false, operator: 'more_than', value: 0 },
      reviews: {
        enabled: false,
        minReviews: 1,
        category: 'all',
        perReviewCriteria: {
          upvotes: { enabled: false, operator: 'more_than', value: 0 },
          comments: { enabled: false, operator: 'more_than', value: 0 },
          agreePercentage: { enabled: false, operator: 'more_than', value: 0 }
        }
      }
    }
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Load data on mount and tab change
  useEffect(() => {
    loadCategories();
    if (activeTab === 'overview') {
      loadOverviewData();
    }
  }, [activeTab]);

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:6003/api/domain/categories');
      const data = await response.json();
      console.log('Categories loaded:', data);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Set default categories if fetch fails
      setCategories([
        { id: 'all', name: 'All Categories' },
        { id: 'electronics', name: 'Electronics' },
        { id: 'fashion', name: 'Fashion' },
        { id: 'food', name: 'Food & Beverages' },
        { id: 'services', name: 'Services' },
        { id: 'other', name: 'Other' }
      ]);
    }
  };

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      const stats = await badgeAPI.getBadgeStatistics();
      setStatistics(stats.statistics);
      setBadges(stats.badges || []);
    } catch (error) {
      console.error('Error loading overview data:', error);
      alert('Failed to load badge data');
    } finally {
      setLoading(false);
    }
  };

  const loadEligibleUsers = async (badgeId) => {
    setLoading(true);
    try {
      const response = await badgeAPI.getEligibleUsers(badgeId);
      setEligibleUsers(response.eligibleUsers || []);
      setSelectedBadge(response.badge);
    } catch (error) {
      console.error('Error loading eligible users:', error);
      alert('Failed to load eligible users');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCriteriaChange = (criteriaKey, field, value) => {
    setBadgeForm({
      ...badgeForm,
      criteria: {
        ...badgeForm.criteria,
        [criteriaKey]: {
          ...badgeForm.criteria[criteriaKey],
          [field]: value
        }
      }
    });
  };

  const resetForm = () => {
    setBadgeForm({
      name: '',
      description: '',
      imageUrl: '',
      category: 'all',
      criteria: {
        followers: { enabled: false, operator: 'more_than', value: 0 },
        trustScore: { enabled: false, operator: 'more_than', value: 0 },
        totalUpvotes: { enabled: false, operator: 'more_than', value: 0 },
        totalComments: { enabled: false, operator: 'more_than', value: 0 },
        totalAgreeComments: { enabled: false, operator: 'more_than', value: 0 },
        reviews: {
          enabled: false,
          minReviews: 1,
          category: 'all',
          perReviewCriteria: {
            upvotes: { enabled: false, operator: 'more_than', value: 0 },
            comments: { enabled: false, operator: 'more_than', value: 0 },
            agreePercentage: { enabled: false, operator: 'more_than', value: 0 }
          }
        }
      }
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleCreateBadge = async (e) => {
    e.preventDefault();
    
    if (!badgeForm.name || !badgeForm.description) {
      alert('Please fill in badge name and description');
      return;
    }

    // Check if at least one criterion is enabled
    const hasEnabledCriteria = Object.values(badgeForm.criteria).some(c => c.enabled);
    if (!hasEnabledCriteria) {
      alert('Please enable at least one criterion');
      return;
    }

    setLoading(true);
    try {
      let cloudinaryImageUrl = badgeForm.imageUrl; // Use existing URL if already uploaded

      // If user selected a new image file, upload it to Cloudinary first
      if (imageFile && !badgeForm.imageUrl) {
        try {
          console.log('Uploading image to Cloudinary...');
          cloudinaryImageUrl = await badgeAPI.uploadImageToCloudinary(imageFile);
          console.log('Image uploaded successfully:', cloudinaryImageUrl);
        } catch (uploadError) {
          console.error('Error uploading image to Cloudinary:', uploadError);
          alert('Failed to upload image to Cloudinary. Badge will be created without image.');
          cloudinaryImageUrl = null;
        }
      }

      // Create badge with the Cloudinary URL
      await badgeAPI.createBadge({
        ...badgeForm,
        imageUrl: cloudinaryImageUrl
        // createdBy will be null - TODO: Get from auth context when user ID is available
      });
      
      alert('Badge created successfully!');
      resetForm();
      loadOverviewData();
    } catch (error) {
      console.error('Error creating badge:', error);
      alert('Failed to create badge: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssign = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }

    if (!selectedBadge) {
      alert('No badge selected');
      return;
    }

    setLoading(true);
    try {
      const response = await badgeAPI.bulkAssignBadges(
        selectedBadge.id,
        selectedUsers,
        null // TODO: Get admin user ObjectID from auth context
      );
      
      alert(`Assignment complete!\n${response.results.successful.length} successful, ${response.results.skipped.length} skipped, ${response.results.failed.length} failed.`);
      
      // Reload eligible users
      loadEligibleUsers(selectedBadge.id);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error assigning badges:', error);
      alert('Failed to assign badges');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === eligibleUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(eligibleUsers.map(u => u.id));
    }
  };

  const filteredUsers = eligibleUsers.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteBadge = async (badgeId, badgeName) => {
    if (!window.confirm(`Are you sure you want to delete "${badgeName}"?\n\nThis will also remove all user assignments and delete the badge image from Cloudinary.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await badgeAPI.deleteBadge(badgeId);
      alert(response.message || 'Badge deleted successfully!');
      loadOverviewData(); // Reload badges
    } catch (error) {
      console.error('Error deleting badge:', error);
      alert('Failed to delete badge: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Render Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards - Removed Active/Inactive, kept Total and Assignments */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Badges</p>
                <p className="text-2xl font-bold text-blue-900">{statistics.totalBadges}</p>
              </div>
              <Award className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Assignments</p>
                <p className="text-2xl font-bold text-purple-900">{statistics.totalAssignments}</p>
              </div>
              <Users className="text-purple-500" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* All Badges List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">All Badges</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading badges...</p>
            </div>
          ) : badges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No badges created yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map(badge => (
                <div key={badge.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    {badge.imageUrl ? (
                      <img src={badge.imageUrl} alt={badge.name} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <Award className="text-white" size={32} />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{badge.name}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{badge.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          <Users size={12} className="inline mr-1" />
                          {badge.assignedCount || badge._count?.userBadges || 0} users
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${badge.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {badge.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedBadge(badge);
                        loadEligibleUsers(badge.id);
                        setActiveTab('assign');
                      }}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      View Eligible Users
                    </button>
                    <button
                      onClick={() => handleDeleteBadge(badge.id, badge.name)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      title="Delete Badge"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Assignments */}
      {statistics?.recentAssignments && statistics.recentAssignments.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Badge Assignments</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {statistics.recentAssignments.map(assignment => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {assignment.user.profilePicture ? (
                      <img src={assignment.user.profilePicture} alt={assignment.user.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users size={20} className="text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{assignment.user.name || assignment.user.username}</p>
                      <p className="text-sm text-gray-600">earned <span className="font-medium">{assignment.badge.name}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {assignment.badge.imageUrl && (
                      <img src={assignment.badge.imageUrl} alt={assignment.badge.name} className="w-8 h-8 rounded" />
                    )}
                    <span className="text-xs text-gray-500">
                      <Calendar size={12} className="inline mr-1" />
                      {new Date(assignment.assignedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render Assign Tab - Continued in next part
  const renderAssign = () => (
    <div className="space-y-6">
      {/* Badge Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Badge to Assign</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {badges.filter(b => b.isActive).map(badge => (
            <button
              key={badge.id}
              onClick={() => {
                setSelectedBadge(badge);
                loadEligibleUsers(badge.id);
              }}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedBadge?.id === badge.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                {badge.imageUrl ? (
                  <img src={badge.imageUrl} alt={badge.name} className="w-12 h-12 rounded-lg" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <Award className="text-white" size={24} />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{badge.name}</p>
                  <p className="text-xs text-gray-500">{badge.assignedCount} assigned</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Eligible Users */}
      {selectedBadge && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Eligible Users for "{selectedBadge.name}"</h3>
                <p className="text-sm text-gray-600 mt-1">{filteredUsers.length} users meet the criteria</p>
              </div>
              {selectedUsers.length > 0 && (
                <button
                  onClick={handleBulkAssign}
                  disabled={loading}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                >
                  Assign to {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={selectAllUsers}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                {selectedUsers.length === eligibleUsers.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading eligible users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No eligible users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map(user => (
                  <div 
                    key={user.id} 
                    className={`border rounded-lg p-4 transition-all ${
                      selectedUsers.includes(user.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.name} className="w-12 h-12 rounded-full" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <Users size={24} className="text-gray-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{user.name || user.username}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      
                      {/* User Stats */}
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-gray-800">{user.stats?.followers || 0}</p>
                          <p className="text-xs text-gray-500">Followers</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-800">{user.stats?.totalReviews || 0}</p>
                          <p className="text-xs text-gray-500">Reviews</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-800">{user.stats?.verifiedReviews || 0}</p>
                          <p className="text-xs text-gray-500">Verified</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-800">{user.stats?.upvotes || 0}</p>
                          <p className="text-xs text-gray-500">Upvotes</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-800">{user.stats?.totalComments || 0}</p>
                          <p className="text-xs text-gray-500">Comments</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-800">{user.stats?.agreePercentage || 0}%</p>
                          <p className="text-xs text-gray-500">Agree</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Render Create Tab - Continued in next part
  const renderCreate = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Create New Badge</h3>
      </div>
      <form onSubmit={handleCreateBadge} className="p-6 space-y-6">
        {/* Badge Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Badge Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={badgeForm.name}
            onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })}
            placeholder="e.g., Top Reviewer, Trusted Contributor"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Badge Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Badge Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={badgeForm.description}
            onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })}
            placeholder="Describe what this badge represents and how users can earn it..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Badge Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Badge Image
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {imagePreview || badgeForm.imageUrl ? (
                <img 
                  src={imagePreview || badgeForm.imageUrl} 
                  alt="Badge preview" 
                  className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <ImageIcon className="text-gray-400" size={32} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="badge-image"
              />
              <label
                htmlFor="badge-image"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Upload size={16} className="mr-2" />
                Choose Image
              </label>
              {imageFile && (
                <span className="ml-3 text-sm text-green-600 font-medium">
                  ✓ Image selected: {imageFile.name}
                </span>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Image will be automatically uploaded to Cloudinary when you click "Create Badge"
              </p>
              <p className="text-xs text-gray-500">
                Images are automatically compressed and resized to 200x200px
              </p>
            </div>
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={badgeForm.category}
            onChange={(e) => setBadgeForm({ ...badgeForm, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.length > 0 ? (
              categories.map(category => (
                <option key={category.id} value={category.name.toLowerCase()}>
                  {category.name}
                </option>
              ))
            ) : (
              <>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="food">Food & Beverages</option>
                <option value="services">Services</option>
                <option value="other">Other</option>
              </>
            )}
          </select>
        </div>

        {/* Criteria Builder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Badge Criteria <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Select the conditions users must meet to be eligible for this badge
          </p>

          <div className="space-y-3 bg-gray-50 rounded-lg p-4">
            {/* Followers Count */}
            <CriteriaRow
              label="Followers Count"
              criteria={badgeForm.criteria.followers}
              onChange={(field, value) => handleCriteriaChange('followers', field, value)}
            />

            {/* Trust Score */}
            <CriteriaRow
              label="Trust Score"
              criteria={badgeForm.criteria.trustScore}
              onChange={(field, value) => handleCriteriaChange('trustScore', field, value)}
            />

            {/* Total Upvotes (across all reviews) */}
            <CriteriaRow
              label="Total Upvotes (All Reviews)"
              criteria={badgeForm.criteria.totalUpvotes}
              onChange={(field, value) => handleCriteriaChange('totalUpvotes', field, value)}
            />

            {/* Total Comments (across all reviews) */}
            <CriteriaRow
              label="Total Comments (All Reviews)"
              criteria={badgeForm.criteria.totalComments}
              onChange={(field, value) => handleCriteriaChange('totalComments', field, value)}
            />

            {/* Total Agree Comments (across all reviews) */}
            <CriteriaRow
              label="Total Agree Comments (All Reviews)"
              criteria={badgeForm.criteria.totalAgreeComments}
              onChange={(field, value) => handleCriteriaChange('totalAgreeComments', field, value)}
            />

            {/* Review-based Criteria */}
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <input
                  type="checkbox"
                  checked={badgeForm.criteria.reviews.enabled}
                  onChange={(e) => {
                    setBadgeForm({
                      ...badgeForm,
                      criteria: {
                        ...badgeForm.criteria,
                        reviews: {
                          ...badgeForm.criteria.reviews,
                          enabled: e.target.checked
                        }
                      }
                    });
                  }}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="font-medium text-gray-700">Review-Based Criteria</label>
              </div>

              {badgeForm.criteria.reviews.enabled && (
                <div className="ml-9 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {/* Minimum Reviews Required */}
                  <div className="flex items-center space-x-3">
                    <label className="font-medium text-gray-700 w-48">Minimum Reviews:</label>
                    <input
                      type="number"
                      value={badgeForm.criteria.reviews.minReviews}
                      onChange={(e) => {
                        setBadgeForm({
                          ...badgeForm,
                          criteria: {
                            ...badgeForm.criteria,
                            reviews: {
                              ...badgeForm.criteria.reviews,
                              minReviews: parseInt(e.target.value) || 1
                            }
                          }
                        });
                      }}
                      min="1"
                      className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Review Category */}
                  <div className="flex items-center space-x-3">
                    <label className="font-medium text-gray-700 w-48">Review Category:</label>
                    <select
                      value={badgeForm.criteria.reviews.category}
                      onChange={(e) => {
                        setBadgeForm({
                          ...badgeForm,
                          criteria: {
                            ...badgeForm.criteria,
                            reviews: {
                              ...badgeForm.criteria.reviews,
                              category: e.target.value
                            }
                          }
                        });
                      }}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Per Review Criteria */}
                  <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Each Review Must Have:</h4>
                    
                    <div className="space-y-2">
                      {/* Upvotes per review */}
                      <CriteriaRow
                        label="Upvotes"
                        criteria={badgeForm.criteria.reviews.perReviewCriteria.upvotes}
                        onChange={(field, value) => {
                          setBadgeForm({
                            ...badgeForm,
                            criteria: {
                              ...badgeForm.criteria,
                              reviews: {
                                ...badgeForm.criteria.reviews,
                                perReviewCriteria: {
                                  ...badgeForm.criteria.reviews.perReviewCriteria,
                                  upvotes: {
                                    ...badgeForm.criteria.reviews.perReviewCriteria.upvotes,
                                    [field]: value
                                  }
                                }
                              }
                            }
                          });
                        }}
                      />

                      {/* Comments per review */}
                      <CriteriaRow
                        label="Comments"
                        criteria={badgeForm.criteria.reviews.perReviewCriteria.comments}
                        onChange={(field, value) => {
                          setBadgeForm({
                            ...badgeForm,
                            criteria: {
                              ...badgeForm.criteria,
                              reviews: {
                                ...badgeForm.criteria.reviews,
                                perReviewCriteria: {
                                  ...badgeForm.criteria.reviews.perReviewCriteria,
                                  comments: {
                                    ...badgeForm.criteria.reviews.perReviewCriteria.comments,
                                    [field]: value
                                  }
                                }
                              }
                            }
                          });
                        }}
                      />

                      {/* Agree Percentage per review */}
                      <CriteriaRow
                        label="Agree %"
                        criteria={badgeForm.criteria.reviews.perReviewCriteria.agreePercentage}
                        onChange={(field, value) => {
                          setBadgeForm({
                            ...badgeForm,
                            criteria: {
                              ...badgeForm.criteria,
                              reviews: {
                                ...badgeForm.criteria.reviews,
                                perReviewCriteria: {
                                  ...badgeForm.criteria.reviews.perReviewCriteria,
                                  agreePercentage: {
                                    ...badgeForm.criteria.reviews.perReviewCriteria.agreePercentage,
                                    [field]: value
                                  }
                                }
                              }
                            }
                          });
                        }}
                        isPercentage={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
                resetForm();
              }
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {imageFile ? 'Uploading & Creating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2" />
                {imageFile ? 'Upload Image & Create Badge' : 'Create Badge'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Award className="mr-3 text-blue-500" size={36} />
            Badge Management
          </h1>
          <p className="text-gray-600 mt-2">Manage reviewer badges and recognition system</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Eye className="inline mr-2" size={20} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('assign')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'assign'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="inline mr-2" size={20} />
              Assign
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'create'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Plus className="inline mr-2" size={20} />
              Create
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'assign' && renderAssign()}
        {activeTab === 'create' && renderCreate()}
      </div>
    </div>
  );
};

// Criteria Row Component
const CriteriaRow = ({ label, criteria, onChange, isPercentage = false }) => {
  return (
    <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border border-gray-200">
      <input
        type="checkbox"
        checked={criteria.enabled}
        onChange={(e) => onChange('enabled', e.target.checked)}
        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <div className="flex-1 flex items-center space-x-3">
        <label className="font-medium text-gray-700 w-40">{label}</label>
        {criteria.enabled && (
          <>
            <select
              value={criteria.operator}
              onChange={(e) => onChange('operator', e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="more_than">More than</option>
              <option value="less_than">Less than</option>
              <option value="equal">Equal to</option>
            </select>
            <input
              type="number"
              value={criteria.value}
              onChange={(e) => onChange('value', parseInt(e.target.value) || 0)}
              min="0"
              max={isPercentage ? 100 : undefined}
              className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {isPercentage && <span className="text-gray-600">%</span>}
          </>
        )}
      </div>
    </div>
  );
};

export default BadgeManagement;
