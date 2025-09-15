import React, { useState } from "react";
import { FaStar, FaHeart, FaComment, FaShare, FaEllipsisH } from "react-icons/fa";

export default function ReviewCard({ review }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 100) + 20);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src={review.user.avatar}
            alt={review.user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
            <p className="text-sm text-gray-500">{review.time}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <FaEllipsisH className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-semibold text-gray-900">{review.product}</span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={index < Math.floor(review.rating) ? "text-yellow-400 w-4 h-4" : "text-gray-300 w-4 h-4"}
              />
            ))}
            <span className="text-sm text-gray-600 ml-1">{review.rating}</span>
          </div>
        </div>
        <p className="text-gray-700">{review.description}</p>
      </div>

      <div className="relative">
        <img
          src={review.image}
          alt={review.product}
          className="w-full h-80 object-cover"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={liked ? "flex items-center gap-2 text-red-500" : "flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"}
            >
              <FaHeart className={liked ? "w-5 h-5 fill-current" : "w-5 h-5"} />
              <span className="text-sm font-medium">{likes}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-sky-600 transition-colors">
              <FaComment className="w-5 h-5" />
              <span className="text-sm font-medium">Comment</span>
            </button>
            <button className="text-gray-600 hover:text-sky-600 transition-colors">
              <FaShare className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <span className="font-medium">{likes} likes</span>
        </div>
        <div className="mt-2">
          <span className="font-semibold text-gray-900">{review.user.name}</span>
          <span className="text-gray-700 ml-2">Great product! Highly recommend it.</span>
        </div>
        <button className="text-gray-500 text-sm mt-1 hover:text-gray-700">
          View all comments
        </button>
      </div>
    </div>
  );
}