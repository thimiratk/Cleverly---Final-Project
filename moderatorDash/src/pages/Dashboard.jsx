import { useState, useEffect } from 'react';
import { AlertTriangle, MessageSquare, Users, FileText, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendsRes, activityRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getTrends(),
        dashboardAPI.getRecentActivity()
      ]);

      setStats(statsRes.data);
      
      // Process trends data
      setTrendData(trendsRes.data.daily || []);
      
      // Process sentiment data
      if (trendsRes.data.sentimentDistribution) {
        const sentiment = trendsRes.data.sentimentDistribution;
        setSentimentData([
          { name: 'Positive', value: sentiment.positive || 0, color: '#10b981' },
          { name: 'Neutral', value: sentiment.neutral || 0, color: '#6b7280' },
          { name: 'Negative', value: sentiment.negative || 0, color: '#ef4444' },
        ]);
      }

      setRecentActivity(activityRes.data.activities || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Set fallback data
      setStats({
        totalPosts: 0,
        fraudulentPosts: 0,
        totalComments: 0,
        negativeComments: 0,
        activeUsers: 0,
        flaggedUsers: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</h3>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trendValue}%
          </span>
          <span className="text-sm text-gray-500 ml-2">vs last week</span>
        </div>
      )}
    </div>
  );

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your platform's fraud detection and sentiment analysis</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Posts"
          value={stats?.totalPosts || 0}
          subtitle={`${stats?.fraudulentPosts || 0} flagged as fraudulent`}
          icon={FileText}
          color="bg-blue-500"
          trend={stats?.postsTrend?.direction}
          trendValue={stats?.postsTrend?.percentage || 0}
        />
        <StatCard
          title="Fraudulent Posts"
          value={stats?.fraudulentPosts || 0}
          subtitle={`${stats?.totalPosts ? ((stats.fraudulentPosts / stats.totalPosts) * 100).toFixed(1) : '0.0'}% of total`}
          icon={AlertTriangle}
          color="bg-red-500"
          trend={stats?.fraudTrend?.direction}
          trendValue={stats?.fraudTrend?.percentage || 0}
        />
        <StatCard
          title="Total Comments"
          value={stats?.totalComments || 0}
          subtitle={`${stats?.negativeComments || 0} negative sentiment`}
          icon={MessageSquare}
          color="bg-green-500"
          trend={stats?.commentsTrend?.direction}
          trendValue={stats?.commentsTrend?.percentage || 0}
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          subtitle={`${stats?.flaggedUsers || 0} flagged users`}
          icon={Users}
          color="bg-purple-500"
          trend={stats?.usersTrend?.direction}
          trendValue={stats?.usersTrend?.percentage || 0}
        />
        <StatCard
          title="Detection Rate"
          value={`${stats?.totalPosts ? ((stats.fraudulentPosts / stats.totalPosts) * 100).toFixed(1) : '0.0'}%`}
          subtitle="Fraud detection accuracy"
          icon={AlertTriangle}
          color="bg-orange-500"
        />
        <StatCard
          title="Sentiment Score"
          value={`${stats?.totalComments ? (((stats.totalComments - stats.negativeComments) / stats.totalComments) * 100).toFixed(1) : '0.0'}%`}
          subtitle="Positive sentiment"
          icon={MessageSquare}
          color="bg-teal-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={2} name="Posts" />
              <Line type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={2} name="Fraud Detected" />
              <Line type="monotone" dataKey="comments" stroke="#10b981" strokeWidth={2} name="Comments" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fraud Detection Comparison */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fraud Detection Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Bar dataKey="posts" fill="#3b82f6" name="Total Posts" />
            <Bar dataKey="fraud" fill="#ef4444" name="Fraud Detected" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={activity.id || index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`h-2 w-2 rounded-full mt-2 ${
                  activity.severity === 'high' ? 'bg-red-500' :
                  activity.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time || activity.timestamp}</p>
                </div>
                <span className={`badge-${activity.severity === 'high' ? 'danger' : activity.severity === 'medium' ? 'warning' : 'success'}`}>
                  {activity.severity}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
