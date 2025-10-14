import React, { useState, useEffect } from 'react';
import { Search, Shield, Mail, Phone, Users, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import { usersAPI } from '../services/api';

const ModeratorManagement = () => {
  const [moderators, setModerators] = useState([]);
  const [stats, setStats] = useState([
    { id: 1, value: '0', label: 'Total Moderators', icon: '👤', color: 'bg-orange-100' },
    { id: 2, value: '0', label: 'Active Users', icon: '📦', color: 'bg-purple-100' },
    { id: 3, value: '0', label: 'Reviewers', icon: '⏰', color: 'bg-yellow-100' },
    { id: 4, value: '0', label: 'Total Pendings', icon: '💙', color: 'bg-blue-100' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModerators = async () => {
      try {
        const users = await usersAPI.getAll();
        
        // Filter moderators and admins
        const moderatorUsers = users.filter(user => 
          user.role === 'moderator' || user.role === 'admin'
        );
        
        // Calculate stats
        const totalModerators = moderatorUsers.length;
        const activeUsers = users.filter(user => user.isActive !== false).length;
        const reviewers = users.filter(user => user.role === 'reviewer').length;
        const pending = 0; // Can be calculated based on pending requests
        
        setStats([
          { id: 1, value: totalModerators.toString(), label: 'Total Moderators', icon: '👤', color: 'bg-orange-100' },
          { id: 2, value: activeUsers.toString(), label: 'Active Users', icon: '📦', color: 'bg-purple-100' },
          { id: 3, value: reviewers.toString(), label: 'Reviewers', icon: '⏰', color: 'bg-yellow-100' },
          { id: 4, value: pending.toString(), label: 'Total Pendings', icon: '�', color: 'bg-blue-100' }
        ]);
        
        // Transform user data for moderators table
        setModerators(moderatorUsers.map(user => ({
          id: user._id,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
          email: user.email,
          phone: user.phone || '+1 234-567-8900',
          role: user.role,
          status: user.isActive !== false ? 'Active' : 'Inactive',
          location: user.location || 'Unknown',
          joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
          trustScore: user.trustScore || 0,
          badges: user.badges?.length || 0
        })));
        
      } catch (error) {
        console.error('Error fetching moderators:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModerators();
  }, []);

  // Function to handle adding a new moderator
  const handleAddModerator = () => {
    // Add your logic here for adding a moderator
    alert('Add Moderator functionality - You can implement a modal or redirect to a form here');
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-gray-100">
        <Navbar 
          title="Moderator Management"
          subtitle="Manage and monitor moderator activities"
          icon={Shield}
        />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading moderators...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      {/* Header */}
      <Navbar 
        title="Moderator Management"
        subtitle="Manage and monitor moderator activities"
        icon={Shield}
        customActions={
          <button 
            onClick={handleAddModerator}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Moderator
          </button>
        }
      />

      {/* Statistics Cards Grid */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Moderators Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Assigned Area</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {moderators.map((moderator) => (
                <tr key={moderator.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{moderator.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{moderator.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{moderator.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{moderator.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{moderator.assignedArea}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${moderator.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {moderator.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                      <button className="text-sm text-red-600 hover:text-red-800">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModeratorManagement;