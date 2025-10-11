﻿import React, { useState, useEffect } from "react";
import StoriesSection from "../components/StoriesSection";
import TrendingSection from "../components/TrendingSection";
import ReviewCard from "../components/ReviewCard";
import CategoriesSection from "../components/CategoriesSection";
import CreateReview from "../components/CreateReview";
import { Link } from "react-router-dom";
import reviewService from "../services/review.service";
import aron from '../assets/aron.png';
import selena from '../assets/selena.jpg';
import profile from '../assets/profile.png';
import macbook from '../assets/posts/MacBook.webp';
import phone1 from '../assets/posts/phone1.jpg';
import laptop from '../assets/posts/laptop.jpg';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reviews when component mounts
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Home: Fetching all reviews...');
      const reviewsData = await reviewService.getAllReviews();
      console.log('Home: Received reviews data:', reviewsData);
      setReviews(reviewsData || []);
    } catch (err) {
      console.error('Home: Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCreated = () => {
    setIsModalOpen(false);
    // Refresh reviews after creating a new one
    fetchReviews();
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 min-h-screen pb-4 pt-24">
      {/* Welcome Header */}
      <div className="max-w-4xl mx-auto pt-6 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Welcome to Cleverly
          </h1>
          <p className="text-gray-600 text-lg">Discover amazing reviews from our community</p>
        </div>
      </div>

      {/* Stories Section */}
      <div className="max-w-4xl mx-auto pt-4 px-4">
        <StoriesSection />
      </div>

      {/* Categories Section */}
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <CategoriesSection />
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
                <span className="font-bold text-purple-600">12.5K+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Users</span>
                <span className="font-bold text-blue-600">2.8K+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Products Reviewed</span>
                <span className="font-bold text-green-600">4.2K+</span>
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
                <ReviewCard key={review.id} review={review} />
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
          
          {/* Trending Reviewers */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 sticky top-96">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🌟 Top Reviewers</h3>
            <div className="space-y-3">
              {[
                { name: "Alex Chen", reviews: 89, avatar: "/src/assets/aron.png" },
                { name: "Sarah Johnson", reviews: 76, avatar: "/src/assets/selena.jpg" },
                { name: "Mike Davis", reviews: 63, avatar: "/src/assets/profile.png" }
              ].map((reviewer, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <img src={reviewer.avatar} alt={reviewer.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{reviewer.name}</p>
                    <p className="text-xs text-gray-500">{reviewer.reviews} reviews</p>
                  </div>
                  <button className="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full font-medium hover:bg-purple-200">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
