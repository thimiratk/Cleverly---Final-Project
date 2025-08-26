// src/pages/Trendings.jsx
import React from "react";
import { Heart, MessageCircle, Share2, TrendingUp } from "lucide-react";

const Trendings = () => {
  const trendingPosts = [
    {
      id: 1,
      user: "Emma Watson",
      time: "2h ago",
      content: "🌟 Just watched an amazing documentary about AI shaping the future. Highly recommend!",
      image: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=800",
      likes: 120,
      comments: 45,
    },
    {
      id: 2,
      user: "Chris Evans",
      time: "5h ago",
      content: "Throwback to last year’s trip to Iceland ❄️ What a breathtaking place!",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      likes: 200,
      comments: 67,
    },
    {
      id: 3,
      user: "Sophia Lee",
      time: "1d ago",
      content: "Excited to share my new UI/UX design portfolio 🎨🚀 Feedback is welcome!",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
      likes: 95,
      comments: 30,
    },
  ];

return (
  <div className="mt-16"> 
    {/* Trendings Title */}
    <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <TrendingUp className="w-6 h-6 text-blue-600" />
      Trendings
    </h1>

    {/* Trending Posts */}
    <div className="space-y-6">
      {trendingPosts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-800">{post.user}</h2>
              <span className="text-sm text-gray-500">{post.time}</span>
            </div>
            <p className="text-gray-700 mb-3">{post.content}</p>
          </div>
          {post.image && (
            <img
              src={post.image}
              alt="Post"
              className="w-full h-64 object-cover"
            />
          )}
          <div className="p-4 flex items-center gap-6 text-gray-600">
            <button className="flex items-center gap-1 hover:text-red-500 transition">
              <Heart className="w-5 h-5" />
              <span className="text-sm">{post.likes}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500 transition">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.comments}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-green-500 transition">
              <Share2 className="w-5 h-5" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

};

export default Trendings;
