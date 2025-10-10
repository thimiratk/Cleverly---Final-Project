import { useState } from 'react';
import { Search, Shield, AlertTriangle, User, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

const UserActivity = () => {
  const [users, setUsers] = useState([
    { id: 1, username: '@john_doe', email: 'john@example.com', postsCount: 45, fraudCount: 2, status: 'active', joinDate: '2024-01-15', risk: 'low' },
    { id: 2, username: '@suspicious_user', email: 'sus@example.com', postsCount: 120, fraudCount: 15, status: 'flagged', joinDate: '2024-08-20', risk: 'high' },
    { id: 3, username: '@alice', email: 'alice@example.com', postsCount: 78, fraudCount: 0, status: 'active', joinDate: '2023-12-01', risk: 'low' },
    { id: 4, username: '@bob_spam', email: 'bob@example.com', postsCount: 200, fraudCount: 25, status: 'suspended', joinDate: '2024-09-10', risk: 'high' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');

  const updateUserStatus = (userId, newStatus) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    toast.success(`User status updated to ${newStatus}`);
  };

  const getRiskBadge = (risk) => {
    const colors = {
      low: 'badge-success',
      medium: 'badge-warning',
      high: 'badge-danger'
    };
    return colors[risk] || 'badge-info';
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'badge-success',
      flagged: 'badge-warning',
      suspended: 'badge-danger'
    };
    return colors[status] || 'badge-info';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesRisk = filterRisk === 'all' || user.risk === filterRisk;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Activity</h1>
        <p className="text-gray-600 mt-1">Monitor user behavior and manage flagged accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {users.filter(u => u.status === 'active').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Flagged Users</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {users.filter(u => u.status === 'flagged').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">High Risk</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {users.filter(u => u.risk === 'high').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input sm:w-40"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="flagged">Flagged</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="input sm:w-40"
        >
          <option value="all">All Risk</option>
          <option value="low">Low Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="high">High Risk</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">User</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Posts</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Fraud Count</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Risk Level</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Joined</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-900">{user.postsCount}</td>
                <td className="py-3 px-4">
                  <span className={user.fraudCount > 10 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                    {user.fraudCount}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={getRiskBadge(user.risk)}>{user.risk}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={getStatusBadge(user.status)}>{user.status}</span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(user.joinDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end space-x-2">
                    {user.status === 'active' && (
                      <button
                        onClick={() => updateUserStatus(user.id, 'flagged')}
                        className="text-yellow-600 hover:text-yellow-700"
                        title="Flag user"
                      >
                        <AlertTriangle className="h-5 w-5" />
                      </button>
                    )}
                    {user.status !== 'suspended' && (
                      <button
                        onClick={() => updateUserStatus(user.id, 'suspended')}
                        className="text-red-600 hover:text-red-700"
                        title="Suspend user"
                      >
                        <Ban className="h-5 w-5" />
                      </button>
                    )}
                    {user.status === 'suspended' && (
                      <button
                        onClick={() => updateUserStatus(user.id, 'active')}
                        className="text-green-600 hover:text-green-700"
                        title="Reactivate user"
                      >
                        <Shield className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserActivity;
