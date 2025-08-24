import React, { useState, useRef } from 'react';
import { Camera, Edit } from 'lucide-react';
import profileImage from "../../assets/profile.png";

const CreatePost = ({ onPostSubmit }) => {
  const [reviewText, setReviewText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const inputRef = useRef(null); // For focusing input

  const handlePhotoClick = () => {
    document.getElementById("postImageInput").click();
  };

  const handleReviewClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = () => {
    if (!reviewText.trim() && !selectedImage) {
      alert("Please add text or an image before posting!");
      return;
    }

    const newPost = {
      text: reviewText,
      image: selectedImage,
      createdAt: new Date(),
    };

    if (onPostSubmit) {
      onPostSubmit(newPost);
    }

    setReviewText("");
    setSelectedImage(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 flex gap-4">
          {/* Photo Upload */}
          <div
            className="flex-1 bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={handlePhotoClick}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Camera className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-sm text-gray-600">Photo</span>
            </div>
          </div>

          {/* Write Review */}
          <div
            className="flex-1 bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={handleReviewClick}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Write a review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Post Input Area */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Post your Review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
          >
            Post
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        id="postImageInput"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />

      {/* Image Preview */}
      {selectedImage && (
        <div className="mt-3">
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Selected"
            className="max-h-48 rounded-lg border"
          />
        </div>
      )}
    </div>
  );
};

export default CreatePost;
