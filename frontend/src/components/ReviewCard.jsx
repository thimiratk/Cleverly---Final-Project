import React, { useState } from "react";
import { FaStar, FaArrowUp, FaArrowDown, FaComment, FaShare, FaEllipsisH } from "react-icons/fa";

export default function ReviewCard({ review }) {
  const [upvotes, setUpvotes] = useState(Math.floor(Math.random() * 50) + 10);
  const [downvotes, setDownvotes] = useState(Math.floor(Math.random() * 10));
  const [userVote, setUserVote] = useState(null); // 'up' | 'down' | null
  const [comments] = useState(Math.floor(Math.random() * 20) + 1);

  const handleUpvote = () => {
    if (userVote === 'up') {
      setUserVote(null);
      setUpvotes(upvotes - 1);
    } else {
      setUserVote('up');
      setUpvotes(upvotes + 1);
      if (userVote === 'down') setDownvotes(downvotes - 1);
    }
  };
  const handleDownvote = () => {
    if (userVote === 'down') {
      setUserVote(null);
      setDownvotes(downvotes - 1);
    } else {
      setUserVote('down');
      setDownvotes(downvotes + 1);
      if (userVote === 'up') setUpvotes(upvotes - 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={review.user.avatar}
              alt={review.user.name}
              className="w-12 h-12 rounded-full object-cover border-3 border-gradient-to-r from-purple-400 to-blue-400"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-base">{review.user.name}</h4>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span>⏰</span> {review.time}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition">
          <FaEllipsisH className="w-4 h-4" />
        </button>
      </div>

      {/* Product & Rating */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {review.product}
          </span>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={index < Math.floor(review.rating) ? "text-yellow-400 w-4 h-4" : "text-gray-300 w-4 h-4"}
              />
            ))}
            <span className="text-sm font-bold text-gray-700 ml-1">{review.rating}</span>
          </div>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{review.description}</p>
      </div>

      {/* Image */}
      <div className="relative mx-5 mb-4">
        <img
          src={review.image}
          alt={review.product}
          className="w-full h-80 object-cover rounded-xl shadow-md"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                userVote === 'up' 
                ? 'bg-green-100 text-green-700 shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
              }`}
            >
              <FaArrowUp className="w-4 h-4" />
              <span>{upvotes}</span>
            </button>
            <button
              onClick={handleDownvote}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                userVote === 'down' 
                ? 'bg-red-100 text-red-700 shadow-md transform scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <FaArrowDown className="w-4 h-4" />
              <span>{downvotes}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all">
              <FaComment className="w-4 h-4" />
              <span>{comments}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all">
              <FaShare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}