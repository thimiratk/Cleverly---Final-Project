import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Search,
  Filter,
  Star,
  User,
  Calendar,
  Flag,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { reviewsAPI } from '../services/api';

const ReviewVerification = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [reviews, setReviews] = useState({
    pending: [],
    verified: [],
    flagged: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const allReviews = await reviewsAPI.getAll();
        
        // Categorize reviews based on verification status
        const pending = allReviews.filter(review => !review.isVerified && !review.isFlagged);
        const verified = allReviews.filter(review => review.isVerified);
        const flagged = allReviews.filter(review => review.isFlagged);
        
        setReviews({
          pending: pending.map(review => ({
            id: review._id,
            reviewer: review.author?.name || review.author || 'Anonymous',
            product: review.productName || review.title || 'Unknown Product',
            rating: review.rating || 0,
            content: review.content || review.text || '',
            date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown',
            riskScore: Math.random() * 10, // Mock risk score
            sentiment: review.sentiment || (review.rating >= 4 ? 'positive' : review.rating <= 2 ? 'negative' : 'neutral'),
            flags: []
          })),
          verified: verified.map(review => ({
            id: review._id,
            reviewer: review.author?.name || review.author || 'Anonymous',
            product: review.productName || review.title || 'Unknown Product',
            rating: review.rating || 0,
            content: review.content || review.text || '',
            date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown',
            verifiedDate: review.verifiedAt ? new Date(review.verifiedAt).toLocaleDateString() : new Date().toLocaleDateString(),
            verifiedBy: 'System'
          })),
          flagged: flagged.map(review => ({
            id: review._id,
            reviewer: review.author?.name || review.author || 'Anonymous',
            product: review.productName || review.title || 'Unknown Product',
            rating: review.rating || 0,
            content: review.content || review.text || '',
            date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown',
            reason: 'Suspicious Content',
            severity: 'Medium'
          }))
        });
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleVerifyReview = async (reviewId) => {
    try {
      await reviewsAPI.update(reviewId, { isVerified: true });
      // Move review from pending to verified
      const review = reviews.pending.find(r => r.id === reviewId);
      if (review) {
        setReviews(prev => ({
          ...prev,
          pending: prev.pending.filter(r => r.id !== reviewId),
          verified: [...prev.verified, { ...review, verifiedDate: new Date().toLocaleDateString(), verifiedBy: 'Admin' }]
        }));
      }
    } catch (error) {
      console.error('Error verifying review:', error);
      alert('Error verifying review');
    }
  };

  const handleFlagReview = async (reviewId) => {
    try {
      await reviewsAPI.update(reviewId, { isFlagged: true });
      // Move review from pending to flagged
      const review = reviews.pending.find(r => r.id === reviewId);
      if (review) {
        setReviews(prev => ({
          ...prev,
          pending: prev.pending.filter(r => r.id !== reviewId),
          flagged: [...prev.flagged, { ...review, reason: 'Manual Flag', severity: 'Medium' }]
        }));
      }
    } catch (error) {
      console.error('Error flagging review:', error);
      alert('Error flagging review');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-gray-100">
        <Navbar 
          title="Review Verification"
          subtitle="Verify and manage review authenticity"
          icon={Shield}
        />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  const getRiskColor = (score) => {
    if (score <= 3) return 'text-green-600 bg-green-50';
    if (score <= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const renderReviewCard = (review, type) => (
    <div key={review.id} className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {review.reviewer.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{review.reviewer}</h4>
            <p className="text-sm text-gray-600">{review.product}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
              />
            ))}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Calendar size={12} className="mr-1" />
            {review.date}
          </div>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{review.content}</p>

      {type === 'pending' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Risk Score:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(review.riskScore)}`}>
              {review.riskScore}/10
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {review.flags.map((flag, index) => (
              <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                {flag}
              </span>
            ))}
          </div>

          <div className="flex space-x-3 mt-4">
            <button 
              onClick={() => handleVerifyReview(review.id, 'approve')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ThumbsUp size={16} />
              <span>Approve</span>
            </button>
            <button 
              onClick={() => handleVerifyReview(review.id, 'reject')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ThumbsDown size={16} />
              <span>Reject</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Flag size={16} />
              <span>Flag for Manual Review</span>
            </button>
          </div>
        </div>
      )}

      {type === 'verified' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Verified By:</span>
            <span className="text-sm text-green-600">{review.verifiedBy}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Trust Score:</span>
            <span className="text-sm font-medium text-green-600">{review.trustScore}/10</span>
          </div>
        </div>
      )}

      {type === 'flagged' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Risk Score:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(review.riskScore)}`}>
              {review.riskScore}/10
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {review.flags.map((flag, index) => (
              <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                {flag}
              </span>
            ))}
          </div>

          <div className="flex space-x-3 mt-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <AlertTriangle size={16} />
              <span>Remove Review</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <User size={16} />
              <span>Investigate User</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const getActiveReviews = () => {
    switch (activeTab) {
      case 'pending': return reviews.pending;
      case 'verified': return reviews.verified;
      case 'flagged': return reviews.flagged;
      default: return reviews.pending;
    }
  };

  return (
    <div className="flex-1">
      <Navbar 
        title="Review Verification"
        subtitle="Verify authenticity and quality of user reviews"
        icon={Shield}
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-800">23</p>
              </div>
              <Eye className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Verified Today</p>
                <p className="text-2xl font-bold text-gray-800">142</p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Flagged Reviews</p>
                <p className="text-2xl font-bold text-gray-800">8</p>
              </div>
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Accuracy Rate</p>
                <p className="text-2xl font-bold text-gray-800">94.8%</p>
              </div>
              <Shield className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'pending' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Pending ({reviews.pending.length})
              </button>
              <button
                onClick={() => setActiveTab('verified')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'verified' 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Verified ({reviews.verified.length})
              </button>
              <button
                onClick={() => setActiveTab('flagged')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'flagged' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Flagged ({reviews.flagged.length})
              </button>
            </div>

            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                <Filter size={16} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {getActiveReviews().map(review => renderReviewCard(review, activeTab))}
        </div>
      </div>
    </div>
  );
};

export default ReviewVerification;
