import React from "react";
import { FaStar, FaChartLine } from "react-icons/fa";

const trendingReviews = [
  {
    id: 1,
    product: "iPhone 15 Pro Max",
    rating: 4.8,
    reviewCount: 1245,
    image: "/src/assets/posts/phone1.jpg",
  },
  {
    id: 2,
    product: "MacBook Pro M3",
    rating: 4.9,
    reviewCount: 892,
    image: "/src/assets/posts/MacBook.webp",
  },
  {
    id: 3,
    product: "Samsung Galaxy S24",
    rating: 4.7,
    reviewCount: 654,
    image: "/src/assets/posts/phone2.png",
  },
  {
    id: 4,
    product: "Dell XPS 13",
    rating: 4.6,
    reviewCount: 432,
    image: "/src/assets/posts/laptop.jpg",
  },
];

export default function TrendingSection() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
      <div className="flex items-center gap-2 mb-4">
        <FaChartLine className="text-orange-500 w-5 h-5" />
        <h3 className="text-lg font-semibold text-gray-900">Trending Reviews</h3>
      </div>
      
      <div className="space-y-4">
        {trendingReviews.map((review) => (
          <div key={review.id} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors">
            <img
              src={review.image}
              alt={review.product}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm truncate">
                {review.product}
              </h4>
              <div className="flex items-center gap-1 mt-1">
                <FaStar className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-gray-600">{review.rating}</span>
                <span className="text-xs text-gray-400">({review.reviewCount})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-sky-600 hover:text-sky-700 text-sm font-medium py-2">
        View all trending
      </button>
    </div>
  );
}