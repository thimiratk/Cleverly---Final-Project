import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, TrendingUp, User, Star, MessageCircle, Eye, Calendar } from 'lucide-react';
import API from '../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({ reviews: [], users: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, reviews, users
  const [sortBy, setSortBy] = useState('relevance'); // relevance, recent, popular

  useEffect(() => {
    if (query) {
      searchContent();
    }
  }, [query, filter, sortBy]);

  const searchContent = async () => {
    setIsLoading(true);
    try {
      // Fetch both reviews and users in parallel
      const [reviewsResponse, usersResponse] = await Promise.all([
        API.get(`/reviews/search`, {
          params: {
            q: query,
            limit: 50,
            sortBy: sortBy
          }
        }).catch(err => ({ data: { reviews: [], total: 0 } })),
        API.get(`/user-profile/search`, {
          params: {
            q: query,
            limit: 20
          }
        }).catch(err => ({ data: { users: [], total: 0 } }))
      ]);

      const reviews = reviewsResponse.data.reviews || [];
      const users = usersResponse.data.users || [];

      setResults({
        reviews: reviews,
        users: users,
        total: reviews.length + users.length
      });
    } catch (error) {
      console.error('Search error:', error);
      setResults({ reviews: [], users: [], total: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserCard = (user) => (
    <Link
      key={user.id}
      to={`/user-profile/${user.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all block"
    >
      {/* User Header */}
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`}
          alt={user.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-lg text-gray-900">{user.name}</h3>
            {user.trustScore && parseInt(user.trustScore) > 70 && (
              <span className="text-blue-500 text-sm">✓</span>
            )}
          </div>
          <p className="text-sm text-gray-600">@{user.username}</p>
          {user.bio && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{user.bio}</p>
          )}
        </div>
      </div>

      {/* User Stats */}
      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-gray-900">{user.trustScore || 0}</span>
          <span className="text-gray-500">Trust Score</span>
        </div>
        <div className="flex items-center space-x-1">
          <MessageCircle className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">{user.reviewsCount || 0}</span>
          <span className="text-gray-500">Reviews</span>
        </div>
        <div className="flex items-center space-x-1">
          <User className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">{user.followersCount || 0}</span>
          <span className="text-gray-500">Followers</span>
        </div>
      </div>
    </Link>
  );

  const renderReviewCard = (review) => (
    <Link
      key={review.id}
      to={`/review/${review.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all block"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={review.user?.profilePicture || review.user?.avatar?.url || `https://ui-avatars.com/api/?name=${review.user?.name || 'User'}&background=random`}
            alt={review.user?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">{review.user?.name}</span>
              {review.user?.isVerified && (
                <span className="text-blue-500 text-xs">✓</span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-1 font-semibold text-gray-900">{review.rating}</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="mb-3">
        <h3 className="font-semibold text-lg text-gray-900 mb-1">{review.product}</h3>
        <span className="inline-block px-2 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-full">
          {review.category?.name || review.exceptionalCategory || 'Uncategorized'}
        </span>
      </div>

      {/* Review Text */}
      <p className="text-gray-700 mb-4 line-clamp-3">{review.reviewText}</p>

      {/* Stats */}
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <Eye className="w-4 h-4" />
          <span>{review.views || 0}</span>
        </div>
        <div className="flex items-center space-x-1">
          <MessageCircle className="w-4 h-4" />
          <span>{review.commentsCount || 0}</span>
        </div>
        <div className="flex items-center space-x-1">
          <TrendingUp className="w-4 h-4" />
          <span>{review.upvotesCount || 0} likes</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Search className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
          </div>
          <p className="text-gray-600">
            {isLoading ? (
              'Searching...'
            ) : (
              <>
                Found <span className="font-semibold text-purple-600">{results.total}</span> results for "
                <span className="font-semibold">{query}</span>"
              </>
            )}
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Filter Tabs */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({results.total})
              </button>
              <button
                onClick={() => setFilter('reviews')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'reviews'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Reviews ({results.reviews.length})
              </button>
              <button
                onClick={() => setFilter('users')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'users'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Users ({results.users.length})
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="relevance">Most Relevant</option>
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : results.total === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Users Section */}
            {(filter === 'all' || filter === 'users') && results.users.length > 0 && (
              <div>
                {filter === 'all' && (
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Users</h2>
                )}
                <div className="space-y-4">
                  {results.users.map(renderUserCard)}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {(filter === 'all' || filter === 'reviews') && results.reviews.length > 0 && (
              <div>
                {filter === 'all' && results.users.length > 0 && (
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Reviews</h2>
                )}
                <div className="space-y-4">
                  {results.reviews.map(renderReviewCard)}
                </div>
              </div>
            )}

            {/* No results for specific filter */}
            {((filter === 'users' && results.users.length === 0) ||
              (filter === 'reviews' && results.reviews.length === 0)) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No {filter} found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
