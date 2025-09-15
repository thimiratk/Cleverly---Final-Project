import React from "react";
import StoriesSection from "../components/StoriesSection";
import TrendingSection from "../components/TrendingSection";
import ReviewCard from "../components/ReviewCard";
import { Link } from "react-router-dom";

export default function Home() {
  // Dummy reviews for the feed
  const reviews = [
    {
      id: 1,
      user: {
        name: "Alex Rodriguez",
        avatar: "/src/assets/aron.png",
      },
      product: "MacBook Pro 16\"",
      image: "/src/assets/posts/MacBook.webp",
      rating: 4.8,
      time: "2h ago",
      description: "The new MacBook Pro is a powerhouse for professionals. The display is stunning and battery life is impressive.",
    },
    {
      id: 2,
      user: {
        name: "Sarah Chen",
        avatar: "/src/assets/selena.jpg",
      },
      product: "iPhone 14 Pro",
      image: "/src/assets/posts/phone1.jpg",
      rating: 4.7,
      time: "4h ago",
      description: "Amazing camera and smooth performance. A bit pricey but worth it for Apple fans.",
    },
    {
      id: 3,
      user: {
        name: "John Smith",
        avatar: "/src/assets/profile.png",
      },
      product: "Dell XPS 13",
      image: "/src/assets/posts/laptop.jpg",
      rating: 4.5,
      time: "6h ago",
      description: "Sleek design and great performance. Perfect for on-the-go productivity.",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-4 pt-24">
      {/* Stories Section */}
      <div className="max-w-2xl mx-auto pt-8">
        <StoriesSection />
      </div>

      {/* Main Feed Layout */}
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto mt-6 px-2 md:px-0">
        {/* Feed (center) */}
        <div className="flex-1 max-w-2xl mx-auto">
          {/* Floating action button for creating a review */}
          <Link
            to="/reviews/create"
            className="fixed bottom-8 right-8 z-30 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200"
            title="Create Review"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>

          {/* Feed of reviews */}
          <div className="flex flex-col gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>

        {/* Trending sidebar (right) */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <TrendingSection />
        </div>
      </div>
    </div>
  );
}
