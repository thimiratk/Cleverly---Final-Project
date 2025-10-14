import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  Eye, 
  Users,
  Flag,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { fraudAPI, usersAPI, reviewsAPI } from '../services/api';

const TrustAndSafety = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [data, setData] = useState({
    reports: [],
    blockedUsers: [],
    stats: {
      totalReports: 0,
      activeInvestigations: 0,
      blockedUsers: 0,
      resolvedToday: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSafetyData = async () => {
      try {
        const [fraudReports, users, reviews] = await Promise.all([
          fraudAPI.getAll(),
          usersAPI.getAll(),
          reviewsAPI.getAll()
        ]);

        // Transform fraud reports to safety reports
        const reports = fraudReports.map(report => ({
          id: report._id,
          type: report.type || 'Safety Violation',
          reporter: 'System Auto-Detection',
          reported: report.reportedUser || 'Unknown User',
          content: report.description || 'Safety concern detected',
          severity: report.severity || 'medium',
          status: report.status || 'pending',
          date: report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown',
          evidence: report.evidence || []
        }));

        // Get blocked/inactive users
        const blockedUsers = users.filter(user => user.isActive === false || user.isBanned).map(user => ({
          id: user._id,
          username: user.name || user.email,
          email: user.email,
          reason: 'Violations of community guidelines',
          blockedDate: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown',
          violations: Math.floor(Math.random() * 5) + 1
        }));

        const stats = {
          totalReports: reports.length,
          activeInvestigations: reports.filter(r => r.status === 'investigating').length,
          blockedUsers: blockedUsers.length,
          resolvedToday: reports.filter(r => r.status === 'resolved').length
        };

        setData({ reports, blockedUsers, stats });
      } catch (error) {
        console.error('Error fetching safety data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSafetyData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-gray-100">
        <Navbar 
          title="Trust & Safety"
          subtitle="Monitor and maintain platform security"
          icon={Shield}
        />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading safety data...</p>
          </div>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'investigating': return 'text-blue-600 bg-blue-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'action_taken': return 'text-purple-600 bg-purple-50';
      case 'dismissed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActionTypeIcon = (type) => {
    switch (type) {
      case 'content': return <Flag size={16} className="text-orange-600" />;
      case 'user': return <Ban size={16} className="text-red-600" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-600" />;
      default: return <Shield size={16} className="text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const renderReports = () => (
    <div className="space-y-4">
      {data.reports.map((report) => (
        <div key={report.id} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <AlertTriangle className="text-red-500" size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-800">{report.type}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(report.severity)}`}>
                    {report.severity}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{report.content}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Reporter:</span>
                    <span className="ml-2 text-gray-800">{report.reporter}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Reported User:</span>
                    <span className="ml-2 text-gray-800">{report.reported}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-2 text-gray-800">{formatDate(report.date)}</span>
                  </div>
                </div>
                
                {report.evidence && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-500">Evidence:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {report.evidence.map((item, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                Investigate
              </button>
              <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderActions = () => (
    <div className="space-y-4">
      {moderationActions.map((action) => (
        <div key={action.id} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>{getActionTypeIcon(action.type)}</div>
              <div>
                <h3 className="font-semibold text-gray-800">{action.action}</h3>
                <p className="text-sm text-gray-600">Target: {action.target}</p>
                <p className="text-sm text-gray-600">Reason: {action.reason}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-800">{action.moderator}</p>
              <p className="text-xs text-gray-500">{formatDate(action.date)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBlockedUsers = () => (
    <div className="space-y-4">
      {data.blockedUsers.map((user) => (
        <div key={user.id} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Ban className="text-red-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{user.username}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-600">Reason: {user.reason}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>Blocked by: {user.blockedBy}</span>
                  <span>Date: {formatDate(user.blockedDate)}</span>
                  <span>Reviews Removed: {user.reviewsRemoved}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.status === 'permanent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user.status}
              </span>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                  Unblock
                </button>
                <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                  Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1">
      <Navbar 
        title="Trust & Safety"
        subtitle="Monitor and manage platform security and user safety"
        icon={Shield}
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Open Reports</p>
                <p className="text-2xl font-bold text-gray-800">{data.stats.totalReports}</p>
                <p className="text-red-600 text-xs mt-1">{data.stats.activeInvestigations} investigating</p>
              </div>
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Resolved Today</p>
                <p className="text-2xl font-bold text-gray-800">{data.stats.resolvedToday}</p>
                <p className="text-green-600 text-xs mt-1">Safety actions taken</p>
              </div>
              <Shield className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Blocked Users</p>
                <p className="text-2xl font-bold text-gray-800">{data.stats.blockedUsers}</p>
                <p className="text-orange-600 text-xs mt-1">Safety measures</p>
              </div>
              <Ban className="text-orange-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Response Time</p>
                <p className="text-2xl font-bold text-gray-800">2.3h</p>
                <p className="text-green-600 text-xs mt-1">↘ -15min improved</p>
              </div>
              <Clock className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'reports' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Safety Reports ({safetyReports.length})
              </button>
              <button
                onClick={() => setActiveTab('actions')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'actions' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Moderation Actions ({moderationActions.length})
              </button>
              <button
                onClick={() => setActiveTab('blocked')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'blocked' 
                    ? 'bg-orange-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Blocked Users ({blockedUsers.length})
              </button>
            </div>

            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                <Filter size={16} />
                <span>Filters</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'actions' && renderActions()}
        {activeTab === 'blocked' && renderBlockedUsers()}
      </div>
    </div>
  );
};

export default TrustAndSafety;
