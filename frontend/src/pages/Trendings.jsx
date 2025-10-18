import React from 'react';
import { Search, Plus, Bell, MoreHorizontal, ThumbsUp, MessageCircle, Share, ChevronDown, ChevronUp, Bookmark, TrendingUp } from 'lucide-react';

export default function CleverlyTrendingPage() {
  const trendingCards = [
    {
      id: 1,
      title: "iPhone 15 Pro vs Pixel 8 Pro - Camera Comparison",
      author: "TechReviewer",
      rating: 4.5,
      category: "Technology",
      interactions: "2,847 interactions",
      image: "/api/placeholder/400/240",
      bgColor: "bg-gray-900"
    },
    {
      id: 2,
      title: "Best Coffee Shops in NYC - Hidden Gems",
      author: "CoffeeLover",
      rating: 4.8,
      category: "Food & Dining",
      interactions: "1,923 interactions",
      image: "/api/placeholder/400/240",
      bgColor: "bg-gray-600"
    },
    {
      id: 3,
      title: "Affordable Skincare Routine That Actually Works",
      author: "BeautyGuru",
      authorInitial: "B",
      rating: 4.9,
      category: "Beauty",
      interactions: "3,156 interactions",
      image: "/api/placeholder/400/240",
      bgColor: "bg-orange-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trending Now Section */}
        <div className="mb-12 mt-16">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">Trending Now</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingCards.map((card) => (
              <div key={card.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Card Image */}
                <div className={`relative h-48 ${card.bgColor} flex items-center justify-center`}>
                  <span className="absolute top-4 left-4">
                    <span className="bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Trending</span>
                    </span>
                  </span>
                  {card.id === 1 && (
                    <div className="text-gray-400 text-6xl font-light">15</div>
                  )}
                  {card.id === 2 && (
                    <div className="w-16 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                      <div className="text-white text-sm">☕</div>
                    </div>
                  )}
                  {card.id === 3 && (
                    <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-3 line-clamp-2">
                    {card.title}
                  </h3>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {card.authorInitial ? (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">{card.authorInitial}</span>
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                      )}
                      <span className="text-sm font-medium text-gray-700">{card.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm font-semibold text-gray-900">{card.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{card.category}</span>
                    <span className="text-sm text-gray-500">{card.interactions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}