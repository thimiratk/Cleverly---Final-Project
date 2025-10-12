import { useState } from 'react';
import { Search, MessageSquare, Smile, Meh, Frown, TrendingUp } from 'lucide-react';
import { sentimentAnalysisAPI } from '../services/api';
import toast from 'react-hot-toast';

const CommentAnalysis = () => {
  const [comments, setComments] = useState([
    { id: 1, postId: 101, username: '@alice', text: 'This is absolutely amazing! Love it!', timestamp: new Date().toISOString(), sentiment: null },
    { id: 2, postId: 102, username: '@bob', text: 'Not bad, could be better though', timestamp: new Date().toISOString(), sentiment: null },
    { id: 3, postId: 101, username: '@charlie', text: 'Terrible experience, very disappointed', timestamp: new Date().toISOString(), sentiment: null },
    { id: 4, postId: 103, username: '@diana', text: 'Great work! Keep it up!', timestamp: new Date().toISOString(), sentiment: null },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [loading, setLoading] = useState(false);
  const [bulkAnalyzing, setBulkAnalyzing] = useState(false);

  const analyzeSingle = async (comment) => {
    setLoading(true);
    try {
      const result = await sentimentAnalysisAPI.analyzeSentiment(comment.text);
      
      setComments(comments.map(c =>
        c.id === comment.id
          ? { ...c, sentiment: result }
          : c
      ));
      
      toast.success('Sentiment analyzed');
    } catch (error) {
      toast.error('Failed to analyze sentiment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeAll = async () => {
    setBulkAnalyzing(true);
    try {
      const unanalyzedComments = comments.filter(c => !c.sentiment);
      const texts = unanalyzedComments.map(c => c.text);
      
      const results = await sentimentAnalysisAPI.analyzeBatch(texts);
      
      const updatedComments = comments.map(comment => {
        const index = unanalyzedComments.findIndex(c => c.id === comment.id);
        if (index !== -1) {
          return { ...comment, sentiment: results[index] };
        }
        return comment;
      });
      
      setComments(updatedComments);
      toast.success(`Analyzed ${unanalyzedComments.length} comments`);
    } catch (error) {
      toast.error('Failed to analyze comments');
      console.error(error);
    } finally {
      setBulkAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    if (!sentiment) return 'bg-gray-100 text-gray-800';
    
    const label = sentiment.sentiment || sentiment.label || '';
    if (label.toLowerCase().includes('positive')) return 'bg-green-100 text-green-800';
    if (label.toLowerCase().includes('negative')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSentimentIcon = (sentiment) => {
    if (!sentiment) return <MessageSquare className="h-5 w-5" />;
    
    const label = sentiment.sentiment || sentiment.label || '';
    if (label.toLowerCase().includes('positive')) return <Smile className="h-5 w-5 text-green-600" />;
    if (label.toLowerCase().includes('negative')) return <Frown className="h-5 w-5 text-red-600" />;
    return <Meh className="h-5 w-5 text-gray-600" />;
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterSentiment === 'all') return matchesSearch;
    if (filterSentiment === 'analyzed') return matchesSearch && comment.sentiment !== null;
    if (filterSentiment === 'pending') return matchesSearch && comment.sentiment === null;
    
    const label = comment.sentiment?.sentiment || comment.sentiment?.label || '';
    return matchesSearch && label.toLowerCase().includes(filterSentiment);
  });

  const stats = {
    total: comments.length,
    analyzed: comments.filter(c => c.sentiment).length,
    positive: comments.filter(c => {
      const label = c.sentiment?.sentiment || c.sentiment?.label || '';
      return label.toLowerCase().includes('positive');
    }).length,
    negative: comments.filter(c => {
      const label = c.sentiment?.sentiment || c.sentiment?.label || '';
      return label.toLowerCase().includes('negative');
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comment Analysis</h1>
          <p className="text-gray-600 mt-1">Analyze sentiment of user comments</p>
        </div>
        <button
          onClick={analyzeAll}
          disabled={bulkAnalyzing}
          className="btn-primary"
        >
          {bulkAnalyzing ? 'Analyzing...' : 'Analyze All'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Total Comments</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Analyzed</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.analyzed}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Positive</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.positive}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Negative</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.negative}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filterSentiment}
          onChange={(e) => setFilterSentiment(e.target.value)}
          className="input sm:w-48"
        >
          <option value="all">All Comments</option>
          <option value="analyzed">Analyzed</option>
          <option value="pending">Pending</option>
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
          <option value="neutral">Neutral</option>
        </select>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.map((comment) => (
          <div key={comment.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-semibold text-gray-900">{comment.username}</span>
                  <span className="text-sm text-gray-500">
                    Post #{comment.postId}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3">{comment.text}</p>
                
                {comment.sentiment && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getSentimentIcon(comment.sentiment)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(comment.sentiment)}`}>
                        {comment.sentiment.sentiment || comment.sentiment.label}
                      </span>
                    </div>
                    
                    {comment.sentiment.confidence !== undefined && (
                      <span className="text-sm text-gray-600">
                        Confidence: {(comment.sentiment.confidence * 100).toFixed(1)}%
                      </span>
                    )}
                    
                    {comment.sentiment.score !== undefined && (
                      <span className="text-sm text-gray-600">
                        Score: {comment.sentiment.score.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {!comment.sentiment && (
                <button
                  onClick={() => analyzeSingle(comment)}
                  disabled={loading}
                  className="btn-primary text-sm ml-4"
                >
                  Analyze
                </button>
              )}
            </div>
          </div>
        ))}
        
        {filteredComments.length === 0 && (
          <div className="text-center py-12 card">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No comments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentAnalysis;
