import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaArrowUp, FaArrowDown, FaComment, FaShare, FaEllipsisH, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { upvoteReview, downvoteReview, removeVote, getUserVoteStatus, getInteractionStats, updateReview } from '../services/api';
import CommentSection from './CommentSection';
import reviewService from '../services/review.service';

function ReviewCard({ review, onReviewDeleted, onReviewUpdated, onDelete, currentUser: currentUserOverride }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const currentUser = currentUserOverride || authUser;
  const [upvotes, setUpvotes] = useState(review?.upvotes || 0);
  const [downvotes, setDownvotes] = useState(review?.downvotes || 0);
  const [userVote, setUserVote] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(review?.commentsCount || 0);
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [currentReviewText, setCurrentReviewText] = useState(() => {
    return review?.reviewText || review?.content || review?.description || review?.comment || '';
  });
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const optionsRef = useRef(null);

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
  description: currentReviewText,
    images: review?.photos || review?.pictures || review?.images || (review?.image ? [review.image] : []),
    upvotes: review?.upvotesCount || review?.upvotes || review?.likes || 0,
    downvotes: review?.downvotesCount || review?.downvotes || review?.dislikes || 0,
    commentsCount: review?.commentsCount || review?.comments || 0,
    time: review?.createdAt || review?.date || review?.timestamp || new Date().toISOString()
  };

  const isOwner = Boolean(currentUser?.id) && reviewData.user?.id && reviewData.user.id.toString() === currentUser.id.toString();

  useEffect(() => {
    if (!showOptions) return;

    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

  // Debug: Log review data structure (can be removed later)
  console.log('ReviewCard - Original review:', review);
  console.log('ReviewCard - Mapped reviewData:', reviewData);

  useEffect(() => {
    setIsDeleted(false);
  }, [reviewData.id]);

  useEffect(() => {
    const nextText = review?.reviewText || review?.content || review?.description || review?.comment || '';
    setCurrentReviewText(nextText);
    setIsEditing(false);
    setEditedText('');
    setEditError('');
    setIsSavingEdit(false);
  }, [review]);

  // Load user's vote status and interaction stats on component mount
  useEffect(() => {
    const loadUserVoteStatus = async () => {
      if (!currentUser || !reviewData.id) return;

      try {
        // Get user's current vote status
        const voteStatus = await getUserVoteStatus(reviewData.id, currentUser.id);
        setUserVote(voteStatus.voteType);

        // Get latest interaction stats
        const stats = await getInteractionStats(reviewData.id);
        setUpvotes(stats.upvotes);
        setDownvotes(stats.downvotes);
        setCommentsCount(stats.comments);
      } catch (error) {
        console.error('Error loading vote status:', error);
        // Don't show error to user, just use default values
      }
    };

    // Add a small delay to prevent rapid requests
    const timeoutId = setTimeout(loadUserVoteStatus, 100);
    return () => clearTimeout(timeoutId);
  }, [currentUser?.id, reviewData.id]); // Only depend on IDs to prevent unnecessary re-renders

  if (isDeleted) {
    return null;
  }

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

  const handleUpvote = async () => {
    if (!currentUser) {
      alert('Please log in to vote');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (userVote === 'UPVOTE') {
        // Remove upvote
        const result = await removeVote(reviewData.id, currentUser.id);
        setUserVote(null);
        setUpvotes(result.upvotes);
        setDownvotes(result.downvotes);
      } else {
        // Add or change to upvote
        const result = await upvoteReview(reviewData.id, currentUser.id);
        setUserVote('UPVOTE');
        setUpvotes(result.upvotes);
        setDownvotes(result.downvotes);
      }
    } catch (error) {
      console.error('Error handling upvote:', error);
      if (error.response?.status === 429) {
        alert('Too many requests. Please wait a moment before voting again.');
      } else {
        alert('Failed to update vote. Please try again.');
      }
    } finally {
      // Add a minimum delay to prevent rapid clicking
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleDownvote = async () => {
    if (!currentUser) {
      alert('Please log in to vote');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (userVote === 'DOWNVOTE') {
        // Remove downvote
        const result = await removeVote(reviewData.id, currentUser.id);
        setUserVote(null);
        setUpvotes(result.upvotes);
        setDownvotes(result.downvotes);
      } else {
        // Add or change to downvote
        const result = await downvoteReview(reviewData.id, currentUser.id);
        setUserVote('DOWNVOTE');
        setUpvotes(result.upvotes);
        setDownvotes(result.downvotes);
      }
    } catch (error) {
      console.error('Error handling downvote:', error);
      if (error.response?.status === 429) {
        alert('Too many requests. Please wait a moment before voting again.');
      } else {
        alert('Failed to update vote. Please try again.');
      }
    } finally {
      // Add a minimum delay to prevent rapid clicking
      setTimeout(() => setLoading(false), 500);
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

  // Toggle comments section
  const handleCommentsClick = () => {
    setShowComments(!showComments);
  };

  // Handle comment count updates from CommentSection
  const handleCommentCountChange = (newCount) => {
    setCommentsCount(newCount);
  };

  const handleDeleteReview = async () => {
    if (!currentUser?.id) {
      alert('Please log in to manage your review.');
      return;
    }

    if (!isOwner) {
      alert('You can only delete your own reviews.');
      return;
    }

    if (!reviewData.id) {
      alert('Unable to delete this review right now.');
      return;
    }

    const confirmed = window.confirm('Delete this review? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    setIsProcessing(true);

    try {
      await reviewService.deleteReview(reviewData.id, currentUser.id);
      setIsDeleted(true);
      setShowOptions(false);
      if (onReviewDeleted) {
        onReviewDeleted(reviewData.id);
      } else if (onDelete) {
        onDelete(reviewData.id);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      const message = error?.response?.data?.message || 'Failed to delete review. Please try again later.';
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const startEditing = () => {
    setEditedText(currentReviewText);
    setEditError('');
    setIsEditing(true);
    setShowOptions(false);
  };

  const cancelEditing = () => {
    if (isSavingEdit) {
      return;
    }
    setIsEditing(false);
    setEditedText('');
    setEditError('');
  };

  const saveEdit = async () => {
    if (!currentUser?.id) {
      setEditError('Please log in to edit your review.');
      return;
    }

    if (!isOwner) {
      setEditError('You can only edit your own review.');
      return;
    }

    if (!reviewData.id) {
      setEditError('Unable to edit this review right now.');
      return;
    }

    const trimmedText = (editedText || '').trim();
    if (!trimmedText) {
      setEditError('Review text cannot be empty.');
      return;
    }

    if (trimmedText === currentReviewText) {
      setIsEditing(false);
      return;
    }

    setIsSavingEdit(true);
    setEditError('');

    try {
      const response = await updateReview(reviewData.id, {
        userId: currentUser.id,
        reviewText: trimmedText,
      });

      const updatedReview = response?.review;
      const updatedText = updatedReview?.reviewText || trimmedText;
      setCurrentReviewText(updatedText);
      setIsExpanded(false);
      setIsEditing(false);

      if (typeof onReviewUpdated === 'function') {
        onReviewUpdated(updatedReview || {
          ...review,
          reviewText: updatedText,
        });
      }
    } catch (error) {
      console.error('Error updating review:', error);
      const message = error?.response?.data?.message || 'Failed to update review. Please try again later.';
      setEditError(message);
    } finally {
      setIsSavingEdit(false);
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
        {isOwner && (
          <div className="relative" ref={optionsRef}>
            <button
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
              onClick={() => setShowOptions((prev) => !prev)}
              disabled={isProcessing}
            >
              <FaEllipsisH className="w-4 h-4" />
            </button>
            {showOptions && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  onClick={startEditing}
                  disabled={isProcessing || isSavingEdit || isEditing}
                >
                  Edit Review
                </button>
                <div className="border-t border-gray-100" />
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  onClick={handleDeleteReview}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Deleting…' : 'Delete Review'}
                </button>
              </div>
            )}
          </div>
        )}
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
          {isEditing ? (
            <div>
              <textarea
                value={editedText}
                onChange={(event) => setEditedText(event.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={5}
                disabled={isSavingEdit}
              />
              {editError && <p className="text-xs text-red-500 mt-2">{editError}</p>}
              <div className="flex gap-3 mt-3">
                <button
                  onClick={saveEdit}
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingEdit ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  onClick={cancelEditing}
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-wrap">{getDisplayText(reviewData.description)}</p>
              {shouldTruncate(reviewData.description) && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-purple-600 hover:text-purple-700 font-medium mt-2 text-sm transition-colors duration-200"
                >
                  {isExpanded ? 'See less' : 'See more'}
                </button>
              )}
              {editError && <p className="text-xs text-red-500 mt-2">{editError}</p>}
            </>
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
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                userVote === 'UPVOTE' 
                ? 'bg-green-100 text-green-700 shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaArrowUp className="w-4 h-4" />
              <span>{upvotes}</span>
            </button>
            <button
              onClick={handleDownvote}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                userVote === 'DOWNVOTE' 
                ? 'bg-red-100 text-red-700 shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaArrowDown className="w-4 h-4" />
              <span>{downvotes}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCommentsClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                showComments 
                ? 'bg-blue-200 text-blue-800' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <FaComment className="w-4 h-4" />
              <span>{commentsCount || 0}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all">
              <FaShare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <CommentSection 
        reviewId={reviewData.id}
        isVisible={showComments}
        onCommentCountChange={handleCommentCountChange}
      />
    </div>
  );
}

export default ReviewCard;