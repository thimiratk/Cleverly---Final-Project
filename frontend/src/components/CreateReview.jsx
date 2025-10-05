import React, { useState, useEffect } from 'react';
import { X, Image, Video, Smile, MapPin, Star } from 'lucide-react';
import { createReview, getCategories, createCategory, createSubCategory } from '../services/api';
import { useUser } from '../hooks/useUser';
import { uploadMultipleToCloudinary } from '../utils/cloudinary';

export default function ReviewPostUI() {
  const [isOpen, setIsOpen] = useState(true);
  const [reviewData, setReviewData] = useState({
    categoryId: '',
    subCategoryId: '',
    productOrService: '',
    product: '',
    rating: 0,
    reviewText: '',
    photos: [],
    videos: []
  });
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [customCategory, setCustomCategory] = useState('');
  const [customSubCategory, setCustomSubCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCustomSubCategory, setShowCustomSubCategory] = useState(false);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (reviewData.categoryId) {
      const selectedCategory = categories.find(cat => cat.id === reviewData.categoryId);
      setSubCategories(selectedCategory ? selectedCategory.subCategories : []);
      setReviewData(prev => ({ ...prev, subCategoryId: '' }));
    }
  }, [reviewData.categoryId, categories]);

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      id: Math.random().toString(36),
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
      file
    }));
    setUploadedMedia([...uploadedMedia, ...newMedia]);
  };

  const removeMedia = (id) => {
    setUploadedMedia(uploadedMedia.filter(item => item.id !== id));
  };

  const handleCategoryChange = async (e) => {
    const value = e.target.value;
    if (value === 'other') {
      setShowCustomCategory(true);
      setReviewData(prev => ({ ...prev, categoryId: '' }));
    } else {
      setShowCustomCategory(false);
      setReviewData(prev => ({ ...prev, categoryId: value }));
    }
  };

  const handleCustomCategorySubmit = async () => {
    if (!customCategory.trim()) return;

    try {
      const newCategory = await createCategory({ name: customCategory.trim() });
      setCategories(prev => [...prev, newCategory]);
      setReviewData(prev => ({ ...prev, categoryId: newCategory.id }));
      setCustomCategory('');
      setShowCustomCategory(false);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category. Please try again.');
    }
  };

  const handleSubCategoryChange = async (e) => {
    const value = e.target.value;
    if (value === 'other') {
      setShowCustomSubCategory(true);
      setReviewData(prev => ({ ...prev, subCategoryId: '' }));
    } else {
      setShowCustomSubCategory(false);
      setReviewData(prev => ({ ...prev, subCategoryId: value }));
    }
  };

  const handleCustomSubCategorySubmit = async () => {
    if (!customSubCategory.trim() || !reviewData.categoryId) return;

    try {
      const newSubCategory = await createSubCategory({
        name: customSubCategory.trim(),
        categoryId: reviewData.categoryId
      });
      setSubCategories(prev => [...prev, newSubCategory]);
      setReviewData(prev => ({ ...prev, subCategoryId: newSubCategory.id }));
      setCustomSubCategory('');
      setShowCustomSubCategory(false);
    } catch (error) {
      console.error('Error creating subcategory:', error);
      alert('Failed to create subcategory. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!reviewData.rating || !reviewData.product || !reviewData.reviewText || !reviewData.categoryId || !reviewData.productOrService) {
      alert('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Separate images and videos
      const images = uploadedMedia.filter(m => m.type === 'image').map(m => m.file);
      const videos = uploadedMedia.filter(m => m.type === 'video').map(m => m.file);

      // Upload images and videos to Cloudinary
      const uploadedPhotos = await uploadMultipleToCloudinary(images, 'image');
      const uploadedVideos = await uploadMultipleToCloudinary(videos, 'video');

      // Prepare review data with uploaded URLs
      const reviewPayload = {
        ...reviewData,
        photos: uploadedPhotos,
        videos: uploadedVideos,
        userId: useUser().user?.id || ''
      };

      const response = await createReview(reviewPayload);
      alert('Review posted successfully!');
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating review:', error);
      alert('Failed to create review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Create Review</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
              HD
            </div>
            <div>
              <p className="font-semibold text-gray-800">Hiran Devinda</p>
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                <span>🌍</span>
                <span>Public</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredStar || reviewData.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {reviewData.rating > 0 && (
                <span className="ml-2 text-sm text-gray-600 self-center">
                  {reviewData.rating} star{reviewData.rating > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              {showCustomCategory ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter category name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomCategorySubmit()}
                  />
                  <button
                    onClick={handleCustomCategorySubmit}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomCategory(false);
                      setCustomCategory('');
                    }}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <select
                  value={reviewData.categoryId}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? 'Loading...' : 'Select category'}
                  </option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                  <option value="other">Other (Add New)</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
              {showCustomSubCategory ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSubCategory}
                    onChange={(e) => setCustomSubCategory(e.target.value)}
                    placeholder="Enter subcategory name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomSubCategorySubmit()}
                  />
                  <button
                    onClick={handleCustomSubCategorySubmit}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomSubCategory(false);
                      setCustomSubCategory('');
                    }}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <select
                  value={reviewData.subCategoryId}
                  onChange={handleSubCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!reviewData.categoryId}
                >
                  <option value="">Select sub category</option>
                  {subCategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                  {reviewData.categoryId && <option value="other">Other (Add New)</option>}
                </select>
              )}
            </div>
          </div>

          {/* Product/Service Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={reviewData.productOrService}
              onChange={(e) => setReviewData({ ...reviewData, productOrService: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select type</option>
              <option value="product">Product</option>
              <option value="service">Service</option>
            </select>
          </div>

          {/* Product/Service Details */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product/Service Name *</label>
            <input
              type="text"
              value={reviewData.product}
              onChange={(e) => setReviewData({ ...reviewData, product: e.target.value })}
              placeholder="Enter product or service name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Review Text */}
          <div className="mb-4">
            <textarea
              value={reviewData.reviewText}
              onChange={(e) => setReviewData({ ...reviewData, reviewText: e.target.value })}
              placeholder="What's your experience? Share your review..."
              className="w-full px-3 py-2 border-0 focus:ring-0 resize-none text-gray-800 placeholder-gray-400 text-lg"
              rows="3"
            />
          </div>

          {/* Media Preview */}
          {uploadedMedia.length > 0 && (
            <div className="mb-4 border border-gray-200 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2">
                {uploadedMedia.map((media, index) => (
                  <div key={media.id} className="relative group">
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-full h-48 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <button
                      onClick={() => removeMedia(media.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                    {index === 1 && uploadedMedia.length > 2 && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center text-white text-3xl font-semibold">
                        +{uploadedMedia.length - 2}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to Review Options */}
          <div className="border border-gray-300 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Add to your review</span>
              <div className="flex gap-1">
                <label className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <Image className="w-5 h-5 text-green-500" />
                </label>
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                  <Video className="w-5 h-5 text-red-500" />
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                  <Smile className="w-5 h-5 text-yellow-500" />
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                  <MapPin className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!reviewData.rating || !reviewData.product || !reviewData.reviewText || !reviewData.categoryId || !reviewData.productOrService || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
          >
            {isSubmitting ? 'Posting Review...' : 'Post Review'}
          </button>
        </div>
      </div>
    </div>
  );
}