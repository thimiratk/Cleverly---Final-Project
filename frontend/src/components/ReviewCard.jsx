import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaArrowUp, FaArrowDown, FaComment, FaShare, FaEllipsisH, FaUser } from 'react-icons/fa';

function ReviewCard({ review }) {
  const navigate = useNavigate();
  const [upvotes, setUpvotes] = useState(review?.upvotes || 0);
  const [downvotes, setDownvotes] = useState(review?.downvotes || 0);
  const [userVote, setUserVote] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle different data structures from API
  const reviewData = {
    id: review?._id || review?.id,
    user: {
      id: review?.user?.id || review?.user?._id || review?.userId,
      name: review?.user?.name || 'Anonymous',
      avatar: review?.user?.profilePicture || 
              review?.user?.avatar?.url ||
              null
    },
    product: review?.product || review?.productOrService || review?.title || 'Product Review',
    rating: Number(review?.rating) || 0,
    description: review?.reviewText || review?.content || review?.description || review?.comment || '',
    images: review?.photos || review?.pictures || review?.images || (review?.image ? [review.image] : []),
    upvotes: review?.upvotesCount || review?.upvotes || review?.likes || 0,
    downvotes: review?.downvotesCount || review?.downvotes || review?.dislikes || 0,
    commentsCount: review?.commentsCount || review?.comments || 0,
    time: review?.createdAt || review?.date || review?.timestamp || new Date().toISOString()
  };

  // Debug: Log review data structure (can be removed later)
  console.log('ReviewCard - Original review:', review);
  console.log('ReviewCard - Mapped reviewData:', reviewData);

  // Format time from ISO string or timestamp
  function formatTime(timeString) {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  }

  // Check if text should be truncated (more than 4 lines)
  const shouldTruncate = (text) => {
    if (!text) return false;
    // Count line breaks and estimate lines based on length
    const lineBreaks = (text.match(/\n/g) || []).length;
    const estimatedLines = Math.ceil(text.length / 60) + lineBreaks; // ~60 chars per line
    return estimatedLines > 4;
  };

  // Get display text based on expansion state
  const getDisplayText = (text) => {
    if (!shouldTruncate(text) || isExpanded) {
      return text;
    }
    // Find a good truncation point (around 200-250 chars, but at word boundary)
    const maxLength = 200;
    if (text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 150 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  };

  const handleUpvote = () => {
    if (userVote === 'up') {
      setUserVote(null);
      setUpvotes(upvotes - 1);
    } else {
      setUserVote('up');
      setUpvotes(upvotes + 1);
      if (userVote === 'down') setDownvotes(downvotes - 1);
    }
  };

  const handleDownvote = () => {
    if (userVote === 'down') {
      setUserVote(null);
      setDownvotes(downvotes - 1);
    } else {
      setUserVote('down');
      setDownvotes(downvotes + 1);
      if (userVote === 'up') setUpvotes(upvotes - 1);
    }
  };

  // Navigate to user profile
  const handleProfileClick = () => {
    console.log('Full review object:', review);
    console.log('Extracted user data:', reviewData.user);
    console.log('User ID being used for navigation:', reviewData.user.id);
    
    if (reviewData.user.id) {
      navigate(`/user-profile/${reviewData.user.id}`);
    } else {
      console.error('No user ID found for navigation');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4">
          <div 
            className="relative cursor-pointer hover:scale-105 transition-transform"
            onClick={handleProfileClick}
          >
            {/* Always render the fallback first, then overlay the image if available */}
            <div 
              className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold"
            >
              {reviewData.user.name ? reviewData.user.name.charAt(0).toUpperCase() : <FaUser className="w-6 h-6" />}
            </div>
            
            {/* Profile picture overlay */}
            {reviewData.user.avatar && (
              <img
                src={reviewData.user.avatar}
                alt={reviewData.user.name}
                className="absolute inset-0 w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                onError={(e) => {
                  console.log('Avatar image failed to load:', reviewData.user.avatar);
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h4 
              className="font-bold text-gray-900 text-base cursor-pointer hover:text-purple-600 transition-colors"
              onClick={handleProfileClick}
            >
              {reviewData.user.name}
            </h4>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span>⏰</span> {formatTime(reviewData.time)}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition">
          <FaEllipsisH className="w-4 h-4" />
        </button>
      </div>

      {/* Product & Rating */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {reviewData.product}
          </span>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={index < Math.floor(reviewData.rating) ? "text-yellow-400 w-4 h-4" : "text-gray-300 w-4 h-4"}
              />
            ))}
            <span className="text-sm font-bold text-gray-700 ml-1">{reviewData.rating}</span>
          </div>
        </div>
        
        {/* Review Text with See More functionality */}
        <div className="text-gray-700 text-sm leading-relaxed">
          <p className="whitespace-pre-wrap">{getDisplayText(reviewData.description)}</p>
          {shouldTruncate(reviewData.description) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-purple-600 hover:text-purple-700 font-medium mt-2 text-sm transition-colors duration-200"
            >
              {isExpanded ? 'See less' : 'See more'}
            </button>
          )}
        </div>
      </div>

      {/* Review Images */}
      {reviewData.images && reviewData.images.length > 0 && (
        <div className="relative mx-5 mb-4">
          {reviewData.images.length === 1 ? (
            <img
              src={reviewData.images[0]}
              alt={reviewData.product}
              className="w-full h-80 object-cover rounded-xl shadow-md"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.style.display = 'none';
              }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {reviewData.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`${reviewData.product} - Image ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {index === 3 && reviewData.images.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">+{reviewData.images.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                userVote === 'up' 
                ? 'bg-green-100 text-green-700 shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
              }`}
            >
              <FaArrowUp className="w-4 h-4" />
              <span>{reviewData.upvotes}</span>
            </button>
            <button
              onClick={handleDownvote}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                userVote === 'down' 
                ? 'bg-red-100 text-red-700 shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <FaArrowDown className="w-4 h-4" />
              <span>{reviewData.downvotes}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all">
              <FaComment className="w-4 h-4" />
              <span>{reviewData.commentsCount || 0}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all">
              <FaShare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewCard;