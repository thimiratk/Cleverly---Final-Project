import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  CheckCircle, 
  Users, 
  Shield, 
  AlertTriangle, 
  Plus, 
  Star, 
  Award, 
  TrendingUp 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { analyticsAPI, reviewsAPI, usersAPI, fraudAPI } from '../services/api';

// Components
const MetricCard = ({ title, value, change, icon: IconComponent, borderColor, iconBgColor, iconColor }) => (
  <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${borderColor}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-green-600 text-xs mt-1">{change}</p>
      </div>
      <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
        <IconComponent className={iconColor} size={24} />
      </div>
    </div>
  </div>
);

const HealthCard = ({ title, status, description, icon: IconComponent, bgColor, iconBgColor, iconColor, statusColor }) => (
  <div className={`text-center p-4 ${bgColor} rounded-lg`}>
    <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
      <IconComponent className={`w-6 h-6 ${iconColor}`} />
    </div>
    <h4 className="font-semibold text-gray-800">{title}</h4>
    <p className={`text-2xl font-bold ${statusColor} mt-2`}>{status}</p>
    <p className="text-sm text-gray-600 mt-1">{description}</p>
  </div>
);

const TrustMetricsChart = ({ data }) => (
  <div className="space-y-3">
    {data.map((item, index) => (
      <div key={index} className="flex items-center justify-between">
        <span className="text-xs text-gray-600 w-8">{item.month}</span>
        <div className="flex-1 mx-3">
          <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="bg-green-400 h-full" 
              style={{ width: `${item.verified}%` }}
            />
            <div 
              className="bg-red-400 h-full" 
              style={{ width: `${item.fraud}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-gray-600 w-8">{item.verified}%</span>
      </div>
    ))}
  </div>
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalReviews: 0,
    activeReviewers: 0,
    avgTrustScore: 0,
    fraudDetectionRate: 0,
    verificationRate: 0,
    categories: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from multiple endpoints
        const [reviews, users, fraudReports] = await Promise.all([
          reviewsAPI.getAll(),
          usersAPI.getAll(),
          fraudAPI.getAll()
        ]);

        // Calculate analytics metrics
        const totalReviews = reviews.length;
        const verifiedReviews = reviews.filter(review => review.isVerified).length;
        const verificationRate = totalReviews > 0 ? ((verifiedReviews / totalReviews) * 100).toFixed(1) : 0;
        
        const activeReviewers = users.filter(user => user.role === 'reviewer' || user.role === 'admin').length;
        const avgTrustScore = users.length > 0 ? 
          (users.reduce((sum, user) => sum + (user.trustScore || 0), 0) / users.length).toFixed(1) : 0;
        
        const fraudDetectionRate = 97.1; // Can be calculated based on fraud reports vs total reviews
        
        // Group reviews by category for category performance
        const categoryMap = {};
        reviews.forEach(review => {
          const category = review.category || 'General';
          if (!categoryMap[category]) {
            categoryMap[category] = { count: 0, totalScore: 0, trustScore: 0 };
          }
          categoryMap[category].count++;
          categoryMap[category].totalScore += review.rating || 0;
        });

        const categories = Object.entries(categoryMap).map(([name, data]) => ({
          name,
          reviews: data.count,
          trustScore: data.count > 0 ? (data.totalScore / data.count).toFixed(1) : 0,
          icon: getCategoryIcon(name)
        })).sort((a, b) => b.reviews - a.reviews).slice(0, 5);

        setAnalyticsData({
          totalReviews,
          activeReviewers,
          avgTrustScore,
          fraudDetectionRate,
          verificationRate,
          categories,
          recentActivity: reviews.slice(-10).reverse() // Last 10 reviews
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const getCategoryIcon = (category) => {
    const icons = {
      'Electronics': '📱',
      'Fashion': '👕',
      'Home & Garden': '🏠',
      'Beauty': '💄',
      'Sports': '⚽',
      'Books': '📚',
      'Automotive': '🚗',
      'General': '📦'
    };
    return icons[category] || '📦';
  };

  if (loading) {
    return (
      <div className="flex-1">
        <Navbar 
          title="Trust Analytics"
          subtitle="Platform insights and review quality metrics"
          icon={BarChart3}
        />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1">
      <Navbar 
        title="Trust Analytics"
        subtitle="Platform insights and review quality metrics"
        icon={BarChart3}
      />

      <div className="p-6 space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Review Verification Rate"
            value={`${analyticsData.verificationRate}%`}
            change={`↗ +2.3% this month`}
            icon={CheckCircle}
            borderColor="border-green-500"
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
          
          <MetricCard
            title="Active Reviewers"
            value={analyticsData.activeReviewers.toLocaleString()}
            change="↗ +8.7% growth"
            icon={Users}
            borderColor="border-blue-500"
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          
          <MetricCard
            title="Average Trust Score"
            value={`${analyticsData.avgTrustScore}/10`}
            change="↗ +0.4 improved"
            icon={Shield}
            borderColor="border-purple-500"
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
          
          <MetricCard
            title="Fraud Detection"
            value={`${analyticsData.fraudDetectionRate}%`}
            change="↗ +1.2% accuracy"
            icon={AlertTriangle}
            borderColor="border-orange-500"
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Performance Table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Review Categories Performance</h2>
                <div className="flex items-center space-x-2">
                  <Plus size={16} className="text-gray-600" />
                  <span className="text-sm text-blue-600 cursor-pointer hover:underline">Add Category</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">Performance metrics by product categories</p>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Rank</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Category</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Reviews</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Trust Score</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.categories.map((item, index) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-4 text-sm text-gray-600">#{index + 1}</td>
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="font-medium text-gray-800">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-gray-600">{item.reviews.toLocaleString()}</td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{item.trustScore}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Trust Metrics Chart */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Monthly Trust Metrics</h3>
              <p className="text-sm text-gray-500 mt-1">Review verification rates over time</p>
            </div>
            
            <div className="p-6">
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 text-blue-200 mx-auto mb-4" />
                <p className="text-gray-500">Chart visualization coming soon</p>
                <p className="text-sm text-gray-400">Real-time trust metrics tracking</p>
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-gray-600">Verified Reviews</span>
                  </div>
                  <span className="font-medium">{analyticsData.verificationRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-gray-600">Fraud Detected</span>
                  </div>
                  <span className="font-medium">{(100 - parseFloat(analyticsData.verificationRate)).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Health Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Platform Health Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HealthCard
              title="Review Quality"
              status="Excellent"
              description={`${analyticsData.avgTrustScore}/10 average score`}
              icon={CheckCircle}
              bgColor="bg-green-50"
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
              statusColor="text-green-600"
            />
            
            <HealthCard
              title="Badge System"
              status="Active"
              description={`${analyticsData.activeReviewers} trusted reviewers`}
              icon={Award}
              bgColor="bg-blue-50"
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
              statusColor="text-blue-600"
            />
            
            <HealthCard
              title="Growth Trend"
              status="Positive"
              description={`${analyticsData.totalReviews} total reviews`}
              icon={TrendingUp}
              bgColor="bg-purple-50"
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
              statusColor="text-purple-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
