﻿import React, { useState, useEffect } from "react";
import TrendingSection from "../components/TrendingSection";
import ReviewCard from "../components/ReviewCard";
import CategoriesSection from "../components/CategoriesSection";
import CreateReview from "../components/CreateReview";
import { Link } from "react-router-dom";
import reviewService from "../services/review.service";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [communityStats, setCommunityStats] = useState({
    totalReviews: 0,
    activeUsers: 0,
    verifiedReviews: 0
  });

  // Fetch community stats
  useEffect(() => {
    fetchCommunityStats();
  }, []);

  // Fetch reviews when component mounts or category changes
  useEffect(() => {
    fetchReviews();
  }, [selectedCategory]);

  const fetchCommunityStats = async () => {
    try {
      const stats = await reviewService.getCommunityStats();
      setCommunityStats(stats);
    } catch (error) {
      console.error('Error fetching community stats:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Home: Fetching reviews...', selectedCategory ? `for category: ${selectedCategory}` : 'all categories');
      
      // Add category filter if selected
      const params = {};
      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }
      
      const reviewsData = await reviewService.getAllReviews(params);
      console.log('Home: Received reviews data:', reviewsData);
      
      // Filter out REJECTED reviews from public view
      const filteredReviews = (reviewsData || []).filter(review => {
        // Only show non-rejected reviews on home page
        return review.postState !== 'REJECTED';
      });
      
      setReviews(filteredReviews);
    } catch (err) {
      console.error('Home: Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleReviewCreated = () => {
    setIsModalOpen(false);
    // Refresh reviews after creating a new one
    fetchReviews();
  };

  const handleReviewDeleted = (deletedReviewId) => {
    setReviews((prevReviews) =>
      prevReviews.filter((review) => (review.id || review._id) !== deletedReviewId)
    );
  };

  const handleReviewUpdated = (updatedReview) => {
    if (!updatedReview) return;
    setReviews((prevReviews) =>
      prevReviews.map((review) => {
        const currentId = review.id || review._id;
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

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 min-h-screen pb-4 pt-24">
      {/* Categories Section */}
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <CategoriesSection 
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      {/* Main Feed Layout */}
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto mt-8 px-4">
        {/* Left Sidebar - Quick Stats */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Community Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Reviews</span>
                <span className="font-bold text-purple-600">
                  {communityStats.totalReviews >= 1000 
                    ? `${(communityStats.totalReviews / 1000).toFixed(1)}K+` 
                    : `${communityStats.totalReviews}+`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Users</span>
                <span className="font-bold text-blue-600">
                  {communityStats.activeUsers >= 1000 
                    ? `${(communityStats.activeUsers / 1000).toFixed(1)}K+` 
                    : `${communityStats.activeUsers}+`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Verified Reviews</span>
                <span className="font-bold text-green-600">
                  {communityStats.verifiedReviews >= 1000 
                    ? `${(communityStats.verifiedReviews / 1000).toFixed(1)}K+` 
                    : `${communityStats.verifiedReviews}+`}
                </span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
              <p className="text-sm font-medium text-gray-800">💡 Pro Tip</p>
              <p className="text-xs text-gray-600 mt-1">Write detailed reviews to earn more upvotes!</p>
            </div>
          </div>
        </div>

        {/* Feed (center) */}
        <div className="flex-1 max-w-2xl mx-auto lg:mx-0">
          {/* Create Review CTA */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <h3 className="text-xl font-bold mb-2">Share Your Experience! ✨</h3>
            <p className="text-purple-100 mb-4">Help others make better decisions with your honest reviews</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-50 transition shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Write a Review
            </button>
          </div>

          {/* Category Filter Indicator */}
          {selectedCategory && !loading && (
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Filtered by:</span>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium">
                  Category
                </span>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filter
              </button>
            </div>
          )}

          {/* Feed of reviews */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-gray-600">Loading reviews...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <p className="text-red-600 font-medium">{error}</p>
                  <button 
                    onClick={fetchReviews}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to share your experience!</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Write First Review
                  </button>
                </div>
              </div>
            ) : (
              reviews.map((review) => (
                <ReviewCard
                  key={review.id || review._id}
                  review={review}
                  onReviewDeleted={handleReviewDeleted}
                  onReviewUpdated={handleReviewUpdated}
                />
              ))
            )}

            {/* Load More Button - only show if there are reviews */}
            {!loading && !error && reviews.length > 0 && (
              <div className="text-center py-8">
                <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transition">
                  Load More Reviews
                </button>
              </div>
            )}
          </div>

          {/* Create Review Modal */}
          {isModalOpen && (
            <CreateReview 
              onClose={() => setIsModalOpen(false)} 
              onReviewCreated={handleReviewCreated} 
            />
          )}
        </div>

        {/* Trending sidebar (right) */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <TrendingSection />
        </div>
      </div>
    </div>
  );
}
