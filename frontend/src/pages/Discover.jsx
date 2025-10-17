import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, TrendingUp, Users, Grid, Eye } from 'lucide-react';
import discoverService from '../services/discover.service';

export default function CleverlyDiscoverPage() {
  const [activeTab, setActiveTab] = useState('reviewers');
  const [topReviewers, setTopReviewers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDiscoverData();
  }, []);

  const fetchDiscoverData = async () => {
    try {
      setLoading(true);
      const [reviewersData, categoriesData] = await Promise.all([
        discoverService.getTopReviewers(10),
        discoverService.getCategories()
      ]);
      setTopReviewers(reviewersData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching discover data:', error);
      setError('Failed to load discover data');
    } finally {
      setLoading(false);
    }
  };



  const formatCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getAvatarColor = (index) => {
    const colors = ['bg-orange-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-pink-400', 'bg-yellow-400', 'bg-red-400', 'bg-indigo-400'];
    return colors[index % colors.length];
  };

  const renderTopReviewersContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center">
          {error}
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <Users className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900">Top Reviewers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topReviewers.length > 0 ? (
            topReviewers.map((reviewer, index) => (
              <div key={reviewer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  {reviewer.profilePicture || reviewer.avatar ? (
                    <img
                      src={reviewer.profilePicture || reviewer.avatar}
                      alt={reviewer.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-16 h-16 ${getAvatarColor(index)} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold text-xl">{reviewer.name[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">{reviewer.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{reviewer.username}</p>
                    <p className="text-sm text-gray-600">Trust Score: <span className="font-semibold text-green-600">{reviewer.trustScore}</span></p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reviews</span>
                    <span className="font-semibold">{formatCount(reviewer.reviews)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Followers</span>
                    <span className="font-semibold">{formatCount(reviewer.followers)}</span>
                  </div>
                </div>
                {reviewer.categories && reviewer.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {reviewer.categories.map((category, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {category}
                      </span>
                    ))}
                  </div>
                )}
                <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded-lg hover:shadow-lg transition">
                  Follow
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No reviewers found
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCategoriesContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center">
          {error}
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <Filter className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <div key={category.id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{category.name}</h3>
                <div className="text-3xl font-bold text-purple-600 mb-1">{formatCount(category.count)}</div>
                <p className="text-sm text-gray-500">{category.reviews}</p>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-8 text-gray-500">
              No categories found
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover</h1>
            <p className="text-lg text-gray-600">Explore trending products, top reviewers, and curated collections</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'reviewers', label: 'Top Reviewers' },
              { id: 'categories', label: 'Categories' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'reviewers' && renderTopReviewersContent()}
        {activeTab === 'categories' && renderCategoriesContent()}
      </main>
    </div>
  );
}