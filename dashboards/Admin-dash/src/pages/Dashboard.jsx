import React, { useState, useEffect } from 'react';
import {
  Users,
  Star,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Award,
  FileText,
  MessageSquare,
  Eye,
  CheckCircle,
  BarChart,
  PieChart,
  Calendar,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { reviewsAPI } from '../services/api';

const Dashboard = () => {
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const statsData = await reviewsAPI.getAdminStats();
        setAdminStats(statsData);
        setError(null);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Dashboard" subtitle="Loading dashboard data..." />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Dashboard" subtitle="Error loading dashboard" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-red-500" size={20} />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Navbar 
        title="Dashboard"
        subtitle="Consumer Review Platform Overview"
        icon={TrendingUp}
      />

      <div className="p-6">
        {/* Exceptional Reviews Alert */}
        {adminStats?.overview?.exceptionalReviews > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-amber-600" size={20} />
                <div>
                  <h4 className="text-amber-800 font-medium">Exceptional Categories Pending</h4>
                  <p className="text-amber-700 text-sm">
                    {adminStats.overview.exceptionalReviews} reviews need category conversion
                  </p>
                </div>
              </div>
              <Link 
                to="/exceptional-reviews"
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Review Now
              </Link>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {adminStats?.overview?.totalReviews || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">All reviews in system</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Recent Reviews</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {adminStats?.overview?.recentReviews || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Exceptional Reviews</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {adminStats?.overview?.exceptionalReviews || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Need categorization</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rating Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Rating Distribution</h3>
              <BarChart className="text-gray-400" size={20} />
            </div>
            <div className="space-y-4">
              {adminStats?.ratingDistribution?.map((rating) => (
                <div key={rating.rating} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 w-16">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="text-sm font-medium">{rating.rating}</span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${(rating.count / (adminStats?.overview?.totalReviews || 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">{rating.count}</span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-8">No rating data available</p>
              )}
            </div>
          </div>

          {/* Popular Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Popular Categories</h3>
              <PieChart className="text-gray-400" size={20} />
            </div>
            <div className="space-y-4">
              {adminStats?.popularCategories?.map((category, index) => (
                <div key={category.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' : 
                      index === 1 ? 'bg-green-500' : 
                      index === 2 ? 'bg-yellow-500' : 
                      index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm font-medium">{category.categoryName}</span>
                  </div>
                  <span className="text-sm text-gray-600">{category._count.categoryId} reviews</span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-8">No category data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Active Reviewers & Exceptional Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Active Reviewers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Reviewers</h3>
              <UserCheck className="text-gray-400" size={20} />
            </div>
            <div className="space-y-4">
              {adminStats?.activeReviewers?.map((reviewer, index) => (
                <div key={reviewer.userId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{reviewer.user?.name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500">{reviewer.user?.email || ''}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">{reviewer._count.userId} reviews</span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-8">No reviewer data available</p>
              )}
            </div>
          </div>

          {/* Exceptional Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Pending Categories</h3>
              <FileText className="text-gray-400" size={20} />
            </div>
            <div className="space-y-3">
              {adminStats?.exceptionalCategories?.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-amber-800">{category.category}</p>
                    {category.subcategory && (
                      <p className="text-xs text-amber-600">→ {category.subcategory}</p>
                    )}
                  </div>
                  <Link 
                    to="/exceptional-reviews"
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                  >
                    Review
                  </Link>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-8">No exceptional categories</p>
              )}
              {adminStats?.exceptionalCategories?.length > 5 && (
                <Link 
                  to="/exceptional-reviews"
                  className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2"
                >
                  View All ({adminStats.exceptionalCategories.length - 5} more)
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
