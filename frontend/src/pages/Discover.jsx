import React, { useState } from 'react';
import { Search, Filter, ChevronDown, TrendingUp, Users, Grid, Eye } from 'lucide-react';
import FilterDropdown from '../components/FilterDropdown';

export default function CleverlyDiscoverPage() {
  const [activeTab, setActiveTab] = useState('trending');

  const trendingProducts = [
    {
      id: 1,
      title: "iPhone 15 Pro",
      category: "Technology",
      rating: 4.3,
      reviews: "2,847 reviews",
      rank: "#98",
      bgColor: "bg-gray-900",
      textColor: "text-gray-400"
    },
    {
      id: 2,
      title: "Starbucks Pumpkin Spice Latte",
      category: "Food & Dining",
      rating: 4.1,
      reviews: "1,923 reviews",
      rank: "#95",
      bgColor: "bg-gray-800",
      textColor: "text-gray-300"
    },
    {
      id: 3,
      title: "Tesla Model Y",
      category: "Automotive",
      rating: 4.5,
      reviews: "1,456 reviews",
      rank: "#92",
      bgColor: "bg-gray-600",
      textColor: "text-white"
    },
    {
      id: 4,
      title: "Airbnb Brooklyn Loft",
      category: "Travel",
      rating: 4.7,
      reviews: "892 reviews",
      rank: "#89",
      bgColor: "bg-orange-100",
      textColor: "text-gray-800"
    }
  ];

  const topReviewers = [
    {
      id: 1,
      name: "Alex Chen",
      handle: "@alexchen_tech",
      trustScore: "92%",
      reviews: 345,
      followers: "12,500",
      categories: ["Technology", "Gadgets"],
      avatar: "bg-orange-400"
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      handle: "@maria_foodie",
      trustScore: "88%",
      reviews: 287,
      followers: "8,900",
      categories: ["Food", "Restaurants"],
      avatar: "bg-blue-400"
    },
    {
      id: 3,
      name: "David Park",
      handle: "@david_travels",
      trustScore: "95%",
      reviews: 198,
      followers: "15,200",
      categories: ["Travel", "Hotels"],
      avatar: "bg-green-400"
    }
  ];

  const categories = [
    { name: "All Categories", count: "25.6K", reviews: "reviews" },
    { name: "Technology", count: "8.2K", reviews: "reviews" },
    { name: "Food & Dining", count: "6.1K", reviews: "reviews" },
    { name: "Travel & Hotels", count: "4.3K", reviews: "reviews" },
    { name: "Fashion", count: "3.8K", reviews: "reviews" },
    { name: "Beauty", count: "3.2K", reviews: "reviews" },
    { name: "Home & Garden", count: "2.9K", reviews: "reviews" },
    { name: "Automotive", count: "2.1K", reviews: "reviews" }
  ];

  const collections = [
    {
      id: 1,
      title: "Best Tech of 2024",
      description: "Top-rated gadgets and devices this year",
      reviews: "45 reviews",
      author: "TechExpert",
      bgImage: "bg-blue-100"
    },
    {
      id: 2,
      title: "Hidden Coffee Gems in NYC",
      description: "Local coffee shops you need to try",
      reviews: "28 reviews",
      author: "CoffeeLover",
      bgImage: "bg-gray-200"
    },
    {
      id: 3,
      title: "Budget Beauty Finds",
      description: "Amazing products under $20",
      reviews: "32 reviews",
      author: "BeautyGuru",
      bgImage: "bg-orange-200"
    }
  ];

  const renderTrendingContent = () => (
    <div>
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="w-6 h-6 text-orange-500" />
        <h2 className="text-2xl font-bold text-gray-900">Trending Products</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trendingProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className={`relative h-48 ${product.bgColor} flex items-center justify-center`}>
              <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                {product.rank}
              </span>
              <div className={`text-6xl font-light ${product.textColor}`}>
                {product.id === 1 && "15"}
                {product.id === 2 && "☕"}
                {product.id === 3 && "🚗"}
                {product.id === 4 && "🏠"}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{product.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{product.category}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-semibold text-gray-900">{product.rating}</span>
                </div>
                <span className="text-sm text-gray-500">{product.reviews}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTopReviewersContent = () => (
    <div>
      <div className="flex items-center space-x-2 mb-6">
        <Users className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-900">Top Reviewers</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topReviewers.map((reviewer) => (
          <div key={reviewer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-16 h-16 ${reviewer.avatar} rounded-full flex items-center justify-center`}>
                <span className="text-white font-bold text-xl">{reviewer.name[0]}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{reviewer.name}</h3>
                <p className="text-sm text-gray-600">{reviewer.handle}</p>
                <p className="text-sm text-gray-600">Trust Score: <span className="font-semibold">{reviewer.trustScore}</span></p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Reviews</span>
                <span className="font-semibold">{reviewer.reviews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Followers</span>
                <span className="font-semibold">{reviewer.followers}</span>
              </div>
            </div>
            <div className="flex space-x-2 mb-4">
              {reviewer.categories.map((category, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {category}
                </span>
              ))}
            </div>
            <button className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors">
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCategoriesContent = () => (
    <div>
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="w-6 h-6 text-purple-500" />
        <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-semibold text-gray-900 text-lg mb-2">{category.name}</h3>
            <div className="text-3xl font-bold text-blue-600 mb-1">{category.count}</div>
            <p className="text-sm text-gray-500">{category.reviews}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCollectionsContent = () => (
    <div>
      <div className="flex items-center space-x-2 mb-6">
        <Eye className="w-6 h-6 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-900">Featured Collections</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <div key={collection.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className={`h-48 ${collection.bgImage} flex items-center justify-center`}>
              <div className="text-6xl">
                {collection.id === 1 && "💻"}
                {collection.id === 2 && "☕"}
                {collection.id === 3 && "💄"}
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{collection.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{collection.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{collection.reviews}</span>
                <span>by {collection.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover</h1>
            <p className="text-lg text-gray-600">Explore trending products, top reviewers, and curated collections</p>
          </div>

          {/* Search and Filter Row */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products, reviews, or users..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <FilterDropdown />
            <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'trending', label: 'Trending' },
              { id: 'reviewers', label: 'Top Reviewers' },
              { id: 'categories', label: 'Categories' },
              { id: 'collections', label: 'Collections' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'trending' && renderTrendingContent()}
        {activeTab === 'reviewers' && renderTopReviewersContent()}
        {activeTab === 'categories' && renderCategoriesContent()}
        {activeTab === 'collections' && renderCollectionsContent()}
      </main>
    </div>
  );
}