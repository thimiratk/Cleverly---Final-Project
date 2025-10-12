import { useState } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { ruleBasedFraudAPI, mlFraudDetectionAPI } from '../services/api';
import toast from 'react-hot-toast';

const PostMonitoring = () => {
  const [posts, setPosts] = useState([
    { id: 1, userId: 'user_123', username: '@john_doe', text: 'This is an amazing product! Highly recommend to everyone!', rating: 5, timestamp: new Date().toISOString(), status: 'pending' },
    { id: 2, userId: 'user_456', username: '@jane_smith', text: 'Great quality and fast shipping', rating: 4, timestamp: new Date().toISOString(), status: 'approved' },
    { id: 3, userId: 'user_789', username: '@suspicious', text: 'Buy now! Amazing deal! Click here!', rating: 5, timestamp: new Date().toISOString(), status: 'pending' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const analyzePost = async (post) => {
    setLoading(true);
    setSelectedPost(post);
    
    try {
      // Run both rule-based and ML-based detection
      const [ruleResult, mlResult] = await Promise.all([
        ruleBasedFraudAPI.detectPost({
          text: post.text,
          rating: post.rating,
          userId: post.userId,
          postId: post.id,
        }),
        mlFraudDetectionAPI.detectFraud(post.text),
      ]);

      setAnalysisResult({
        rule: ruleResult,
        ml: mlResult,
      });

      toast.success('Analysis completed');
    } catch (error) {
      toast.error('Failed to analyze post');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updatePostStatus = (postId, status) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, status } : p));
    toast.success(`Post ${status}`);
    setSelectedPost(null);
    setAnalysisResult(null);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Post Monitoring</h1>
        <p className="text-gray-600 mt-1">Monitor and analyze posts for fraudulent activity</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input sm:w-48"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="flagged">Flagged</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{post.username}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(post.timestamp).toLocaleString()}
                  </p>
                </div>
                <span className={`badge-${
                  post.status === 'approved' ? 'success' :
                  post.status === 'rejected' ? 'danger' :
                  post.status === 'flagged' ? 'warning' : 'info'
                }`}>
                  {post.status}
                </span>
              </div>
              
              <p className="text-gray-700 mb-3">{post.text}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Rating:</span>
                  <span className="text-yellow-500">{'⭐'.repeat(post.rating)}</span>
                </div>
                <button
                  onClick={() => analyzePost(post)}
                  disabled={loading}
                  className="btn-primary text-sm"
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  Analyze
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Analysis Panel */}
        <div className="card sticky top-6">
          {selectedPost && analysisResult ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Results</h3>
                <p className="text-sm text-gray-600">Post from {selectedPost.username}</p>
              </div>

              {/* Post Content */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">{selectedPost.text}</p>
              </div>

              {/* Rule-based Analysis */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Rule-based Detection</h4>
                <div className="space-y-2">
                  {analysisResult.rule.is_fraud ? (
                    <div className="flex items-center space-x-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">Fraud Detected</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">No Fraud Detected</span>
                    </div>
                  )}
                  
                  {analysisResult.rule.flags_triggered && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Flags Triggered:</p>
                      <div className="space-y-1">
                        {analysisResult.rule.flags_triggered.map((flag, idx) => (
                          <div key={idx} className="text-sm bg-yellow-50 text-yellow-800 px-3 py-1 rounded">
                            {flag}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {analysisResult.rule.fraud_score !== undefined && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">
                        Fraud Score: <span className="font-semibold">{analysisResult.rule.fraud_score}/100</span>
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${
                            analysisResult.rule.fraud_score > 70 ? 'bg-red-500' :
                            analysisResult.rule.fraud_score > 40 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${analysisResult.rule.fraud_score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ML-based Analysis */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">ML-based Detection</h4>
                <div className="space-y-2">
                  {analysisResult.ml.is_fraud || analysisResult.ml.prediction === 'fraud' ? (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-medium">Fraud Detected by ML Model</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Legitimate Content</span>
                    </div>
                  )}
                  
                  {analysisResult.ml.confidence && (
                    <p className="text-sm text-gray-600">
                      Confidence: <span className="font-semibold">{(analysisResult.ml.confidence * 100).toFixed(1)}%</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={() => updatePostStatus(selectedPost.id, 'approved')}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => updatePostStatus(selectedPost.id, 'flagged')}
                  className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                >
                  Flag
                </button>
                <button
                  onClick={() => updatePostStatus(selectedPost.id, 'rejected')}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Select a post to view analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostMonitoring;
