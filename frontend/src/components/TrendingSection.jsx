import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import discoverService from "../services/discover.service";

export default function TrendingSection() {
  const [topReviewers, setTopReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopReviewers();
  }, []);

  const fetchTopReviewers = async () => {
    try {
      setLoading(true);
      const reviewersData = await discoverService.getTopReviewers(4);
      setTopReviewers(reviewersData);
    } catch (error) {
      console.error('Error fetching top reviewers:', error);
      setError('Failed to load top reviewers');
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
    const colors = ['bg-orange-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
        <div className="text-center text-red-500 text-sm py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
      <div className="flex items-center gap-2 mb-4">
        <Users className="text-blue-500 w-5 h-5" />
        <h3 className="text-lg font-semibold text-gray-900">Top Reviewers</h3>
      </div>
      
      <div className="space-y-4">
        {topReviewers.length > 0 ? (
          topReviewers.map((reviewer, index) => (
            <div key={reviewer.id} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors">
              {reviewer.profilePicture || reviewer.avatar ? (
                <img
                  src={reviewer.profilePicture || reviewer.avatar}
                  alt={reviewer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className={`w-12 h-12 ${getAvatarColor(index)} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{reviewer.name[0]}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {reviewer.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-green-600 font-semibold">{reviewer.trustScore}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-600">{formatCount(reviewer.reviews)} reviews</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 text-sm py-4">
            No reviewers found
          </div>
        )}
      </div>
    </div>
  );
}