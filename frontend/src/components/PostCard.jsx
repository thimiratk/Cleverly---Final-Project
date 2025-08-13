// src/components/PostCard.jsx
import React, { useState } from "react";
import { Heart, MessageCircle, Star, Share, MoreHorizontal } from "lucide-react";

const PostCard = ({ 
  id, 
  author, 
  profileImage, // New prop for profile image
  text, 
  images, 
  likes, 
  rating, 
  reviews 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const nextImage = () => {
    if (images && images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images && images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center space-x-3">
          {/* Profile Image */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt={`${author}'s profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              // Fallback to initials if no profile image
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium text-sm">
                {author?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Author Name */}
          <div>
            <h3 className="font-medium text-gray-900">{author}</h3>
            <p className="text-sm text-gray-500">Just now</p>
          </div>
        </div>
        
        {/* More Options */}
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 leading-relaxed">{text}</p>
      </div>

      {/* Images */}
      {images && images.length > 0 && (
        <div className="relative">
          <div className="aspect-video bg-gray-100 max-h-96">
            <img
              src={images[currentImageIndex]}
              alt="Post content"
              className="w-full h-full object-contain cursor-pointer bg-gray-50"
              onClick={nextImage}
            />
          </div>

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
              >
                ←
              </button>

              {/* Next Button */}
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
              >
                →
              </button>

              {/* Image Indicators */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex
                        ? "bg-white"
                        : "bg-white bg-opacity-50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Post Stats */}
      <div className="px-4 py-3 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>{likes}</span>
          <span>2K</span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span>{rating}</span>
          </div>
          <span>{reviews}</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={toggleLike}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
            />
          </button>

          <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
          </button>

          <button className="flex items-center space-x-2 text-gray-600 hover:text-yellow-500 transition-colors">
            <Star className="w-5 h-5" />
          </button>
        </div>

        <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
          <Share className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PostCard;