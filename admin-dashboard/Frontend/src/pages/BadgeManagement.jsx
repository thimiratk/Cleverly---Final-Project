import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Star, 
  Shield, 
  Crown, 
  CheckCircle, 
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { badgesAPI, usersAPI } from '../services/api';

const BadgeManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [badges, setBadges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // State for create badge form
  const [badgeName, setBadgeName] = useState('');
  const [badgeColor, setBadgeColor] = useState('blue');
  const [badgeDescription, setBadgeDescription] = useState('');
  const [badgeCriteria, setBadgeCriteria] = useState('');
  const [badgeIcon, setBadgeIcon] = useState('Award');
  const [badgeRequirements, setBadgeRequirements] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [badgesData, usersData] = await Promise.all([
        badgesAPI.getAll(),
        usersAPI.getAll()
      ]);
      setBadges(badgesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBadge = async (userId, badgeId) => {
    try {
      await badgesAPI.assign(userId, badgeId);
      await loadData();
      alert('Badge assigned successfully!');
    } catch (error) {
      console.error('Failed to assign badge:', error);
      alert('Failed to assign badge');
    }
  };

  const getIconComponent = (iconName) => {
    const icons = { Shield, Crown, CheckCircle, Users, Award };
    return icons[iconName] || Shield;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Badge Management" subtitle="Loading badge data..." />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Navbar 
        title="Badge Management"
        subtitle="Manage reviewer badges and recognition system"
        icon={Award}
      />

      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          {['overview', 'assign', 'create'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {badges.map((badge) => {
                const IconComponent = getIconComponent(badge.icon);
                return (
                  <div key={badge._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${getColorClasses(badge.color)}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-sm text-gray-500">
                        {badge.holders} holders
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{badge.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{badge.description}</p>
                    {badge.requirements && badge.requirements.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">Requirements:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {badge.requirements.map((req, index) => (
                            <li key={index} className="flex items-center">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Assign Tab */}
        {activeTab === 'assign' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Assign Badges to Users</h3>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">Trust Score: {user.trustScore || 0}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select 
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignBadge(user._id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">Select Badge</option>
                      {badges.map((badge) => (
                        <option key={badge._id} value={badge._id}>
                          {badge.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Create New Badge</h3>
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              onSubmit={async (e) => {
                e.preventDefault();
                setCreateLoading(true);
                try {
                  await badgesAPI.create({
                    name: badgeName,
                    color: badgeColor,
                    description: badgeDescription,
                    criteria: badgeCriteria,
                    icon: badgeIcon,
                    requirements: badgeRequirements
                      ? badgeRequirements.split(',').map((r) => r.trim())
                      : [],
                  });
                  setBadgeName('');
                  setBadgeColor('blue');
                  setBadgeDescription('');
                  setBadgeCriteria('');
                  setBadgeIcon('Award');
                  setBadgeRequirements('');
                  await loadData();
                  alert('Badge created successfully!');
                } catch (error) {
                  alert('Failed to create badge');
                } finally {
                  setCreateLoading(false);
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter badge name"
                  value={badgeName}
                  onChange={e => setBadgeName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge Color</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={badgeColor}
                  onChange={e => setBadgeColor(e.target.value)}
                >
                  <option value="blue">Blue</option>
                  <option value="purple">Purple</option>
                  <option value="green">Green</option>
                  <option value="orange">Orange</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Criteria</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Top Reviewer, Helpful, etc."
                  value={badgeCriteria}
                  onChange={e => setBadgeCriteria(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Award, Star, Shield, Crown, CheckCircle"
                  value={badgeIcon}
                  onChange={e => setBadgeIcon(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Enter badge description"
                  value={badgeDescription}
                  onChange={e => setBadgeDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Requirements (comma separated)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 10 reviews, 5 upvotes"
                  value={badgeRequirements}
                  onChange={e => setBadgeRequirements(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  disabled={createLoading}
                >
                  {createLoading ? 'Creating...' : 'Create Badge'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeManagement;
