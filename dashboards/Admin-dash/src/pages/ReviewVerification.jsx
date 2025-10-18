import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Star,
  Calendar,
  Flag,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { reviewsAPI } from '../services/api';

const ReviewVerification = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [reviews, setReviews] = useState({
    pending: [],
    verified: [],
    rejected: [],
    flagged: []
  });
  const [stats, setStats] = useState({
    pendingReviews: 0,
    verifiedReviews: 0,
    rejectedReviews: 0,
    verifiedToday: 0,
    flaggedReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState(''); // Get from auth context

  useEffect(() => {
    // Get admin ID from localStorage or auth context
    const storedAdminId = localStorage.getItem('userId') || 'admin-temp-id';
    setAdminId(storedAdminId);
    
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchReviewsByState('pending'),
        fetchReviewsByState('verified'),
        fetchReviewsByState('rejected'),
        fetchReviewsByState('flagged'),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewsByState = async (postState) => {
    try {
      const data = await reviewsAPI.getByPostState(postState.toUpperCase());
      setReviews(prev => ({
        ...prev,
        [postState]: data || []
      }));
    } catch (error) {
      console.error(`Error fetching ${postState} reviews:`, error);
      setReviews(prev => ({
        ...prev,
        [postState]: []
      }));
    }
  };

  const fetchStats = async () => {
    try {
      const data = await reviewsAPI.getAdminStats();
      if (data?.verification) {
        setStats({
          pendingReviews: data.verification.pendingReviews || 0,
          verifiedReviews: data.verification.verifiedReviews || 0,
          rejectedReviews: data.verification.rejectedReviews || 0,
          verifiedToday: data.verification.verifiedToday || 0,
          flaggedReviews: data.verification.flaggedReviews || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      await reviewsAPI.approveReview(reviewId, adminId, 'Approved by admin');
      // Refresh all tabs to update counts
      await fetchAllData();
      alert('Review approved successfully!');
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Error approving review. Please try again.');
    }
  };

  const handleRejectReview = async (reviewId) => {
    try {
      await reviewsAPI.rejectReview(reviewId, adminId, 'Rejected by admin');
      // Refresh all tabs to update counts
      await fetchAllData();
      alert('Review rejected successfully!');
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert('Error rejecting review. Please try again.');
    }
  };

  const handleFlagReview = async (reviewId) => {
    try {
      await reviewsAPI.flagReview(reviewId, adminId, 'Flagged for manual review');
      // Refresh all tabs to update counts
      await fetchAllData();
      alert('Review flagged successfully!');
    } catch (error) {
      console.error('Error flagging review:', error);
      alert('Error flagging review. Please try again.');
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

  const getRuleRiskColor = (score) => {
    // Rule-based score is 0-100 scale
    if (score <= 20) return 'text-green-600 bg-green-50';    // MINIMAL/LOW
    if (score <= 50) return 'text-yellow-600 bg-yellow-50';  // MEDIUM
    if (score <= 75) return 'text-orange-600 bg-orange-50';  // HIGH
    return 'text-red-600 bg-red-50';                          // CRITICAL
  };

  const getSentimentIcon = (sentiment) => {
    if (!sentiment) return <Minus size={16} className="text-gray-400" />;
    
    // Handle array format from sentiment API: { sentiment: [{ label: "POSITIVE", score: 0.95 }] }
    let label = sentiment;
    if (Array.isArray(sentiment)) {
      label = sentiment[0]?.label || sentiment;
    } else if (sentiment.sentiment && Array.isArray(sentiment.sentiment)) {
      label = sentiment.sentiment[0]?.label || sentiment;
    } else if (sentiment.label) {
      label = sentiment.label;
    }
    
    const labelStr = typeof label === 'string' ? label.toUpperCase() : String(label).toUpperCase();
    
    if (labelStr.includes('POSITIVE') || labelStr.includes('POS')) return <TrendingUp size={16} className="text-green-600" />;
    if (labelStr.includes('NEGATIVE') || labelStr.includes('NEG')) return <TrendingDown size={16} className="text-red-600" />;
    return <Minus size={16} className="text-yellow-600" />;
  };

  const getSentimentLabel = (sentiment) => {
    if (!sentiment) return 'N/A';
    
    // Handle array format from sentiment API
    let label = sentiment;
    if (Array.isArray(sentiment)) {
      label = sentiment[0]?.label || 'N/A';
    } else if (sentiment.sentiment && Array.isArray(sentiment.sentiment)) {
      label = sentiment.sentiment[0]?.label || 'N/A';
    } else if (sentiment.label) {
      label = sentiment.label;
    }
    
    if (typeof label !== 'string') {
      return String(label);
    }
    
    // Clean up label (remove LABEL_ prefix if exists)
    const cleanLabel = label.replace('LABEL_', '').replace(/_/g, ' ');
    return cleanLabel.charAt(0).toUpperCase() + cleanLabel.slice(1).toLowerCase();
  };

  const getSentimentScore = (sentiment) => {
    if (!sentiment) return null;
    
    // Handle array format
    if (Array.isArray(sentiment)) {
      return sentiment[0]?.score;
    } else if (sentiment.sentiment && Array.isArray(sentiment.sentiment)) {
      return sentiment.sentiment[0]?.score;
    } else if (sentiment.score) {
      return sentiment.score;
    }
    return null;
  };

  const renderReviewCard = (review, type) => {
    if (!review) return null;
    
    // Extract analysis data safely - handle both direct objects and stringified JSON
    let mlFraud = review.mlFraudResult;
    let ruleFraud = review.ruleFraudResult;
    let sentiment = review.sentimentResult;
    
    // Parse if they're strings (sometimes happens with JSON fields)
    if (typeof mlFraud === 'string') {
      try { mlFraud = JSON.parse(mlFraud); } catch (e) { mlFraud = null; }
    }
    if (typeof ruleFraud === 'string') {
      try { ruleFraud = JSON.parse(ruleFraud); } catch (e) { ruleFraud = null; }
    }
    if (typeof sentiment === 'string') {
      try { sentiment = JSON.parse(sentiment); } catch (e) { sentiment = null; }
    }
    
    // Calculate risk score from ML fraud detection
    // ML returns: { label: "fake"/"genuine", confidence: 0.85 }
    let mlRiskScore = 'N/A';
    if (mlFraud) {
      if (mlFraud.confidence !== undefined) {
        // If label is "fake", use confidence directly; if "genuine", inverse it
        const isFake = mlFraud.label?.toLowerCase() === 'fake';
        const fraudProb = isFake ? mlFraud.confidence : (1 - mlFraud.confidence);
        mlRiskScore = (fraudProb * 10).toFixed(1);
      }
    }
    
    // Get rule-based fraud score
    // Rule-based returns: { risk_score: 15, risk_level: "MINIMAL", risk_factors: [...] }
    const ruleRiskScore = ruleFraud?.risk_score 
      ? parseFloat(ruleFraud.risk_score).toFixed(1)
      : 'N/A';

    return (
      <div key={review.id} className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              A
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{review.user?.name || 'Anonymous'}</h4>
              <p className="text-sm text-gray-600">{review.product || review.productOrService || 'Unknown Product'}</p>
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
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <p className="text-gray-700 mb-4">{review.reviewText}</p>

        {/* Fraud Detection & Sentiment Analysis */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Analysis Results</h5>
          
          {/* ML-Based Fraud Detection */}
          {mlFraud && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ML Fraud Score:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${mlRiskScore !== 'N/A' ? getRiskColor(parseFloat(mlRiskScore)) : 'text-gray-600 bg-gray-100'}`}>
                  {mlRiskScore}/10
                </span>
              </div>
              {mlFraud.label && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Prediction:</span>
                  <span className={`text-xs font-medium ${mlFraud.label?.toLowerCase() === 'fake' ? 'text-red-600' : 'text-green-600'}`}>
                    {mlFraud.label} ({mlFraud.confidence ? (mlFraud.confidence * 100).toFixed(1) : 'N/A'}%)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Rule-Based Fraud Detection */}
          {ruleFraud && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rule-Based Score:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ruleRiskScore !== 'N/A' ? getRuleRiskColor(parseFloat(ruleRiskScore)) : 'text-gray-600 bg-gray-100'}`}>
                  {ruleRiskScore}/100
                </span>
              </div>
              {ruleFraud.risk_level && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Risk Level:</span>
                  <span className={`text-xs font-medium ${
                    ruleFraud.risk_level === 'MINIMAL' ? 'text-green-600' :
                    ruleFraud.risk_level === 'LOW' ? 'text-green-600' :
                    ruleFraud.risk_level === 'MEDIUM' ? 'text-yellow-600' :
                    ruleFraud.risk_level === 'HIGH' ? 'text-orange-600' :
                    ruleFraud.risk_level === 'CRITICAL' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {ruleFraud.risk_level}
                  </span>
                </div>
              )}
              {ruleFraud.risk_factors && ruleFraud.risk_factors.length > 0 && (
                <div className="text-xs text-gray-500">
                  Factors: {ruleFraud.risk_factors.slice(0, 2).join(', ')}
                  {ruleFraud.risk_factors.length > 2 && ` +${ruleFraud.risk_factors.length - 2} more`}
                </div>
              )}
              {ruleFraud.recommendations && ruleFraud.recommendations.length > 0 && (
                <div className="flex items-start space-x-2 mt-1">
                  <span className="text-xs text-gray-500">Recommendation:</span>
                  <span className="text-xs text-blue-600 font-medium">
                    {ruleFraud.recommendations[0]}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Sentiment Analysis */}
          {sentiment && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sentiment:</span>
              <div className="flex items-center space-x-2">
                {getSentimentIcon(sentiment)}
                <span className="text-sm font-medium text-gray-700">
                  {getSentimentLabel(sentiment)}
                </span>
                {getSentimentScore(sentiment) && (
                  <span className="text-xs text-gray-500">
                    ({(getSentimentScore(sentiment) * 100).toFixed(0)}%)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {type === 'pending' && (
          <div className="flex space-x-3 mt-4">
            <button 
              onClick={() => handleApproveReview(review.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ThumbsUp size={16} />
              <span>Approve</span>
            </button>
            <button 
              onClick={() => handleRejectReview(review.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ThumbsDown size={16} />
              <span>Reject</span>
            </button>
            <button 
              onClick={() => handleFlagReview(review.id)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Flag size={16} />
              <span>Flag for Manual Review</span>
            </button>
          </div>
        )}

        {type === 'verified' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Verified At:</span>
              <span className="text-sm text-green-600">
                {review.reviewedAt ? new Date(review.reviewedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            {review.adminNotes && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Notes:</span>
                <span className="text-sm text-gray-700">{review.adminNotes}</span>
              </div>
            )}
          </div>
        )}

        {type === 'rejected' && (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <span className="font-semibold">Rejected:</span> This review was marked as fraudulent or violating guidelines.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Rejected At:</span>
              <span className="text-sm text-red-600">
                {review.reviewedAt ? new Date(review.reviewedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            {review.adminNotes && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Notes:</span>
                <span className="text-sm text-gray-700">{review.adminNotes}</span>
              </div>
            )}
          </div>
        )}

        {type === 'flagged' && (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Flagged for Review:</span> This review requires manual investigation.
              </p>
            </div>
            {review.adminNotes && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Notes:</span>
                <span className="text-sm text-gray-700">{review.adminNotes}</span>
              </div>
            )}
            {/* Allow actions on flagged reviews */}
            <div className="flex space-x-3 mt-4">
              <button 
                onClick={() => handleApproveReview(review.id)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ThumbsUp size={16} />
                <span>Approve</span>
              </button>
              <button 
                onClick={() => handleRejectReview(review.id)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <ThumbsDown size={16} />
                <span>Reject</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getActiveReviews = () => {
    switch (activeTab) {
      case 'pending': return reviews.pending;
      case 'verified': return reviews.verified;
      case 'rejected': return reviews.rejected;
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
                <p className="text-2xl font-bold text-gray-800">{stats.pendingReviews}</p>
              </div>
              <Eye className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Verified Reviews</p>
                <p className="text-2xl font-bold text-gray-800">{stats.verifiedReviews}</p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rejected Reviews</p>
                <p className="text-2xl font-bold text-gray-800">{stats.rejectedReviews}</p>
              </div>
              <ThumbsDown className="text-red-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Flagged Reviews</p>
                <p className="text-2xl font-bold text-gray-800">{stats.flaggedReviews}</p>
              </div>
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        {/* Control Panel - Tabs Only (No Search/Filters) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
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
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'rejected' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Rejected ({reviews.rejected.length})
            </button>
            <button
              onClick={() => setActiveTab('flagged')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'flagged' 
                  ? 'bg-yellow-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Flagged ({reviews.flagged.length})
            </button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews[activeTab].length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <Shield className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No {activeTab} reviews</h3>
              <p className="text-sm text-gray-500">
                {activeTab === 'pending' 
                  ? 'All reviews have been processed!' 
                  : `No reviews in ${activeTab} status.`}
              </p>
            </div>
          ) : (
            reviews[activeTab].map(review => renderReviewCard(review, activeTab))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewVerification;
