import { useState, useEffect } from 'react';
import CreateReview from '../components/CreateReview';
import ReviewCard from '../components/ReviewCard';
import { createReview, getReviews } from '../services/api';
import API from '../services/api'; // Keep this only if you use it for likes/comments

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [commentText, setCommentText] = useState({});
  const token = localStorage.getItem("token");

  // Safely parse user
  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  // ✅ Fetch all reviews using new getReviews()
  const fetchReviews = async () => {
    try {
      const data = await getReviews();
      setReviews(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  // ✅ Create review using new createReview()
  const handleReviewCreated = async (newReview) => {
    try {
      const formData = new FormData();
      formData.append("product", newReview.productName);
      formData.append("rating", newReview.rating);
      formData.append("comment", newReview.comment);
      if (newReview.image) {
        formData.append("image", newReview.image);
      }

      const created = await createReview(formData);
      setReviews([created, ...reviews]);
    } catch (error) {
      console.error("Error creating review:", error);
    }
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews((prev) => prev.filter((r) => (r._id || r.id) !== reviewId));
  };

  const handleReviewUpdated = (updatedReview) => {
    if (!updatedReview) return;
    setReviews((prevReviews) =>
      prevReviews.map((review) => {
        const currentId = review._id || review.id;
        const updatedId = updatedReview.id || updatedReview._id;
        if (!currentId || !updatedId || currentId !== updatedId) {
          return review;
        }
        return {
          ...review,
          ...updatedReview,
          reviewText: updatedReview.reviewText ?? review.reviewText,
        };
      })
    );
  };

  // ✅ Like review (kept as API call — can be moved later)
  const handleLike = async (reviewId) => {
    if (!user) return;
    try {
      await API.post(`/reviews/${reviewId}/like`);
      await fetchReviews();
    } catch (error) {
      console.error("Error liking review:", error);
    }
  };

  // ✅ Comment on review (kept as API call — can be moved later)
  const handleComment = async (reviewId, commentContent) => {
    if (!user) return;
    try {
      await API.post(`/reviews/${reviewId}/comments`, {
        text: commentContent,
        userId: user._id,
      });
      await fetchReviews();
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 pt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Product Reviews
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your experiences and help others make informed decisions
          </p>
        </div>

        {user ? (
          <div className="mb-12">
            <CreateReview onReviewCreated={handleReviewCreated} />
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-xl mb-12 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              Join the Conversation
            </h3>
            <p className="text-blue-600 mb-4">
              Login to share your product experiences with others
            </p>
            <a
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-150"
            >
              Login to Write a Review
            </a>
          </div>
        )}

        <div className="grid gap-8">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={{
                  ...review,
                  id: review._id,
                  userId: review.user?._id,
                  user: {
                    ...review.user,
                    id: review.user?._id,
                    avatar: review.user?.avatar || "/default-avatar.png",
                    name: review.user?.name || "Anonymous",
                  },
                }}
                currentUser={user ? { id: user._id, role: user.role } : null}
                onReviewDeleted={handleReviewDeleted}
                onReviewUpdated={handleReviewUpdated}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 48 48"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M24 4L6 12v24l18 8 18-8V12L24 4zm0 8v32M6 12l18 8m18-8l-18 8"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Reviews Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Be the first to share your experience!
              </p>
              {!user && (
                <a
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-150"
                >
                  Login to Write a Review
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
