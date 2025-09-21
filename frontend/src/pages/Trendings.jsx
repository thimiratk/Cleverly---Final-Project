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

  const trendingTopics = [
    { tag: "#iPhone15Pro", reviews: "12.5K reviews" },
    { tag: "#NYCFood", reviews: "8.2K reviews" },
    { tag: "#SkinCare", reviews: "15.3K reviews" },
    { tag: "#AirPods", reviews: "6.8K reviews" },
    { tag: "#Starbucks", reviews: "9.1K reviews" }
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

        {/* Trending Topics Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900">Trending Topics</h2>
          </div>

          <div className="flex flex-wrap gap-4">
            {trendingTopics.map((topic, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                <div className="text-blue-600 font-semibold text-lg mb-1">{topic.tag}</div>
                <div className="text-sm text-gray-500">{topic.reviews}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Review Post */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Post Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">Alex Chen</span>
                    <span className="text-blue-500">✓</span>
                    <span className="text-sm text-blue-600 font-medium">Verified</span>
                    <span className="text-sm text-gray-600 font-medium">Tech Expert</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>@alexchen_tech</span>
                    <span>•</span>
                    <span>2 hours ago</span>
                    <span>•</span>
                    <span>📍 San Francisco, CA</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Product Info */}
            <div className="flex items-center space-x-3 mt-4 mb-4">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">📱</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">iPhone 15 Pro</h3>
                <p className="text-sm text-gray-600">Technology</p>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400 text-lg">★</span>
                ))}
                <span className="ml-2 font-semibold text-gray-900">5.0</span>
              </div>
            </div>

            {/* Review Title and Content */}
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Incredible camera upgrade, but battery life could be better
            </h2>
            <p className="text-gray-700 leading-relaxed">
              After using the iPhone 15 Pro for 3 weeks, I'm impressed with the camera improvements. The 5x zoom is a game-changer for photography enthusiasts. However, I've noticed the battery drains faster than m... 
              <button className="text-blue-600 font-medium hover:underline">Read more</button>
            </p>
          </div>

          {/* Images */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                <span className="text-gray-400 text-4xl font-light">15</span>
              </div>
              <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Post Actions */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                  <div className="flex items-center space-x-1">
                    <ChevronUp className="w-5 h-5" />
                    <ChevronDown className="w-3 h-3" />
                  </div>
                  <span className="font-medium">144</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                  <ThumbsUp className="w-5 h-5" />
                  <span className="font-medium">124</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">18</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                  <Share className="w-5 h-5" />
                  <span className="font-medium">7</span>
                </button>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Bookmark className="w-5 h-5 text-blue-600 fill-blue-600" />
              </button>
            </div>
            <button className="text-gray-600 hover:text-gray-900 text-sm font-medium mt-3">
              View all 18 comments
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}