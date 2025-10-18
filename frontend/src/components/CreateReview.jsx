import React, { useState, useEffect } from 'react';
import { X, Image, Video, Smile, MapPin, Star } from 'lucide-react';
import { createReview, getCategories, getSubCategoriesByCategory } from '../services/api';
import { useUser } from '../hooks/useUser';
import { uploadMultipleToCloudinary, testCloudinaryConfig } from '../utils/cloudinary';

export default function ReviewPostUI({ onClose, onReviewCreated }) {
  const { user, isLoading: userLoading, isError: userError } = useUser(); // Get user at component level
  
  const [isOpen, setIsOpen] = useState(true);
  const [reviewData, setReviewData] = useState({
    categoryId: '',
    subCategoryId: '',
    exceptionalCategory: '',
    exceptionalSubCategory: '',
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
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [customSubCategory, setCustomSubCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCustomSubCategory, setShowCustomSubCategory] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');

  // Helper functions for closing and success handling
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleSuccess = () => {
    setShowSuccessMessage(true);
    
    // Auto-close the modal after 2 seconds
    setTimeout(() => {
      handleClose();
      if (onReviewCreated) onReviewCreated();
    }, 2000);
  };

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
        setError('Failed to load categories. Please refresh the page.');
      } finally {
        setLoadingCategories(false);
      }
    };
    
    const testCloudinary = async () => {
      try {
        await testCloudinaryConfig();
        console.log('Cloudinary configuration is valid');
      } catch (error) {
        console.error('Cloudinary configuration test failed:', error);
        setError('Media upload service is not available. You can still create reviews without photos.');
      }
    };
    
    loadCategories();
    testCloudinary();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubCategories = async () => {
      if (reviewData.categoryId) {
        setLoadingSubCategories(true);
        try {
          const subCategoriesData = await getSubCategoriesByCategory(reviewData.categoryId);
          setSubCategories(subCategoriesData);
          setReviewData(prev => ({ ...prev, subCategoryId: '' }));
        } catch (error) {
          console.error('Error loading subcategories:', error);
          setError('Failed to load subcategories');
          setSubCategories([]);
        } finally {
          setLoadingSubCategories(false);
        }
      } else {
        setSubCategories([]);
        setLoadingSubCategories(false);
      }
    };
    
    loadSubCategories();
  }, [reviewData.categoryId]);

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files);
    
    // Validate file types and sizes
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        console.error(`File ${file.name} is too large:`, file.size);
        setError(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      
      const isValidImage = validImageTypes.includes(file.type);
      const isValidVideo = validVideoTypes.includes(file.type);
      
      if (!isValidImage && !isValidVideo) {
        console.error(`File ${file.name} has unsupported type:`, file.type);
        setError(`File "${file.name}" has unsupported format. Please use JPG, PNG, GIF, WebP for images or MP4, WebM, OGG for videos.`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
  let reviewPayload = null;

  try {
      const newMedia = validFiles.map(file => ({
        id: Math.random().toString(36),
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video') ? 'video' : 'image',
        file
      }));
      
      setUploadedMedia([...uploadedMedia, ...newMedia]);
      setError(''); // Clear any previous errors
      console.log('Media preview created for:', newMedia.length, 'files');
    } catch (error) {
      console.error('Error creating file preview:', error);
      setError('Failed to create file preview. Please try again.');
    }
  };

  const removeMedia = (id) => {
    setUploadedMedia(uploadedMedia.filter(item => item.id !== id));
  };

  const handleCategoryChange = async (e) => {
    const value = e.target.value;
    if (value === 'other') {
      setShowCustomCategory(true);
      setReviewData(prev => ({ 
        ...prev, 
        categoryId: '', 
        subCategoryId: '',
        exceptionalCategory: '',
        exceptionalSubCategory: ''
      }));
      setSubCategories([]);
    } else {
      setShowCustomCategory(false);
      setReviewData(prev => ({ 
        ...prev, 
        categoryId: value,
        exceptionalCategory: '',
        exceptionalSubCategory: ''
      }));
    }
  };

  const handleCustomCategorySubmit = async () => {
    if (!customCategory.trim()) return;

    // Save as exceptional category (no database creation)
    setReviewData(prev => ({ 
      ...prev, 
      exceptionalCategory: customCategory.trim(),
      categoryId: '' 
    }));
    setCustomCategory('');
    setShowCustomCategory(false);
    
    // Clear subcategories since we're using a custom category
    setSubCategories([]);
    setReviewData(prev => ({ ...prev, subCategoryId: '', exceptionalSubCategory: '' }));
    setError(''); // Clear any errors
  };

  const handleSubCategoryChange = async (e) => {
    const value = e.target.value;
    if (value === 'other') {
      setShowCustomSubCategory(true);
      setReviewData(prev => ({ 
        ...prev, 
        subCategoryId: '',
        exceptionalSubCategory: ''
      }));
    } else {
      setShowCustomSubCategory(false);
      setReviewData(prev => ({ 
        ...prev, 
        subCategoryId: value,
        exceptionalSubCategory: ''
      }));
    }
  };

  const handleCustomSubCategorySubmit = async () => {
    if (!customSubCategory.trim()) return;

    // Save as exceptional subcategory (no database creation)
    setReviewData(prev => ({ 
      ...prev, 
      exceptionalSubCategory: customSubCategory.trim(),
      subCategoryId: '' 
    }));
    setCustomSubCategory('');
    setShowCustomSubCategory(false);
    setError(''); // Clear any errors
  };

  const handleSubmit = async () => {
    // Clear any previous errors
    setError('');
    
    // Validate required fields
    if (!reviewData.rating || !reviewData.product || !reviewData.reviewText || !reviewData.productOrService) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validate category selection (either standard or exceptional)
    const hasStandardCategory = reviewData.categoryId;
    const hasExceptionalCategory = reviewData.exceptionalCategory;
    
    if (!hasStandardCategory && !hasExceptionalCategory) {
      setError('Please select a category or enter a custom category.');
      return;
    }

    // Validate user is logged in
    console.log('User loading state:', { user, userLoading, userError });
    if (userLoading) {
      setError('Loading user information. Please wait...');
      return;
    }
    
    if (userError || !user) {
      setError('You must be logged in to create a review. Please log in and try again.');
      return;
    }
    
    if (!user.id) {
      setError('User ID not found. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadStage('Preparing upload...');
    
  let reviewPayload = null;

  try {
      console.log('Starting review submission...');
      console.log('User data:', user);
      console.log('Review data before processing:', reviewData);
      
      // Stage 1: Prepare media files
      setUploadProgress(10);
      setUploadStage('Processing media files...');
      
      // Separate images and videos
      const images = uploadedMedia.filter(m => m.type === 'image').map(m => m.file);
      const videos = uploadedMedia.filter(m => m.type === 'video').map(m => m.file);

      console.log('Media files:', { images: images.length, videos: videos.length });

      // Stage 2: Upload media to Cloudinary
      let uploadedPhotos = [];
      let uploadedVideos = [];
      
      try {
        if (images.length > 0) {
          setUploadProgress(20);
          setUploadStage(`Uploading ${images.length} image${images.length > 1 ? 's' : ''}...`);
          console.log('Uploading images to Cloudinary...');
          uploadedPhotos = await uploadMultipleToCloudinary(images, 'image');
          console.log('Images uploaded successfully:', uploadedPhotos);
          setUploadProgress(50);
        }
        
        if (videos.length > 0) {
          setUploadProgress(videos.length > 0 && images.length > 0 ? 60 : 50);
          setUploadStage(`Uploading ${videos.length} video${videos.length > 1 ? 's' : ''}...`);
          console.log('Uploading videos to Cloudinary...');
          uploadedVideos = await uploadMultipleToCloudinary(videos, 'video');
          console.log('Videos uploaded successfully:', uploadedVideos);
          setUploadProgress(70);
        }
        
        if (images.length === 0 && videos.length === 0) {
          setUploadProgress(50);
          setUploadStage('No media to upload...');
        }
      } catch (uploadError) {
        console.error('Media upload failed:', uploadError);
        setError(`Failed to upload media: ${uploadError.message}`);
        setUploadProgress(0);
        setUploadStage('');
        return;
      }

      console.log('Uploaded media URLs:', { photos: uploadedPhotos, videos: uploadedVideos });

      // Prepare review data with uploaded URLs
  reviewPayload = {
        ...reviewData,
        photos: uploadedPhotos,
        videos: uploadedVideos,
        userId: user.id
      };

      // Clean up empty string values for optional fields
      if (reviewPayload.categoryId === '') delete reviewPayload.categoryId;
      if (reviewPayload.subCategoryId === '') delete reviewPayload.subCategoryId;
      if (reviewPayload.exceptionalCategory === '') delete reviewPayload.exceptionalCategory;
      if (reviewPayload.exceptionalSubCategory === '') delete reviewPayload.exceptionalSubCategory;

      console.log('Final review payload:', reviewPayload);

      // Stage 3: Create review
      setUploadProgress(80);
      setUploadStage('Creating review...');

      const response = await createReview(reviewPayload);
      console.log('Review created successfully:', response);
      
      // Stage 4: Success
      setUploadProgress(100);
      setUploadStage('Review posted successfully!');
      
      // Show success message after a brief delay
      setTimeout(() => {
        setShowSuccessMessage(true);
        setUploadProgress(0);
        setUploadStage('');
      }, 500);
      
    } catch (error) {
      console.error('Error creating review:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      if (reviewPayload) {
        console.error('Review payload:', reviewPayload);
      }
      
      let errorMessage = 'Failed to create review. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid review data. Please check all required fields.';
      } else if (error.response?.status === 401) {
        errorMessage = 'You must be logged in to create a review.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = `Network error: ${error.message}`;
      }
      
      setError(errorMessage);
      setUploadProgress(0);
      setUploadStage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-black/40 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-800">Create Review</h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className={`p-4 transition-opacity duration-300 ${showSuccessMessage ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Success Message */}
          {showSuccessMessage && (
            <>
              {/* Confetti Animation */}
              <div className="fixed inset-0 pointer-events-none z-50">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-bounce"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`
                    }}
                  >
                    <div className={`w-2 h-2 rounded-full ${['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-pink-400'][Math.floor(Math.random() * 5)]}`}></div>
                  </div>
                ))}
              </div>
              
              {/* Success Message Card */}
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Review Posted Successfully! 🎉</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Thank you for sharing your experience! Your review will help others make better decisions.
                    </p>
                    {(reviewData.exceptionalCategory || reviewData.exceptionalSubCategory) && (
                      <p className="text-xs text-green-600 mt-1">
                        📋 Your custom categories have been submitted for admin review.
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex justify-center">
                  <div className="w-full bg-green-200 rounded-full h-1 overflow-hidden">
                    <div className="bg-green-500 h-1 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-xs text-green-600 text-center mt-2">This window will close automatically...</p>
                <div className="mt-2 flex justify-center">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-green-600 hover:text-green-800 underline"
                  >
                    Close now
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-400 mr-2">❌</span>
                <span className="text-sm text-red-700">{error}</span>
                <button
                  onClick={() => setError('')}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">{uploadStage}</span>
                <span className="text-sm text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              {uploadProgress === 100 && (
                <div className="mt-2 flex items-center text-green-600">
                  <span className="mr-2">✅</span>
                  <span className="text-sm font-medium">Upload complete!</span>
                </div>
              )}
            </div>
          )}

          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold relative overflow-hidden">
              {/* Always show the fallback first */}
              <span className="w-full h-full flex items-center justify-center">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
              
              {/* Profile picture overlay */}
              {user?.profilePicture && (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="absolute inset-0 w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    console.log('CreateReview: Profile picture failed to load:', user.profilePicture);
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              {showCustomCategory ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomCategorySubmit()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCustomCategorySubmit}
                      disabled={!customCategory.trim()}
                      className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      title="Save as custom category (admin will review and may convert to standard category)"
                    >
                      Save as Custom Category
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomCategory(false);
                        setCustomCategory('');
                      }}
                      className="px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    💡 Your custom category will be reviewed by administrators and may be added as a standard option.
                  </p>
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
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customSubCategory}
                    onChange={(e) => setCustomSubCategory(e.target.value)}
                    placeholder="Enter custom subcategory name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomSubCategorySubmit()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCustomSubCategorySubmit}
                      disabled={!customSubCategory.trim()}
                      className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      title="Save as custom subcategory (admin will review and may convert to standard subcategory)"
                    >
                      Save as Custom Subcategory
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomSubCategory(false);
                        setCustomSubCategory('');
                      }}
                      className="px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    💡 Your custom subcategory will be reviewed by administrators and may be added as a standard option.
                  </p>
                </div>
              ) : (
                <select
                  value={reviewData.subCategoryId}
                  onChange={handleSubCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!reviewData.categoryId || loadingSubCategories}
                >
                  <option value="">
                    {loadingSubCategories ? 'Loading subcategories...' : 'Select sub category'}
                  </option>
                  {subCategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                  {reviewData.categoryId && !loadingSubCategories && <option value="other">Other (Add New)</option>}
                </select>
              )}
            </div>
          </div>

          {/* Exceptional Category Indicator */}
          {(reviewData.exceptionalCategory || reviewData.exceptionalSubCategory) && (
            <div className="mb-4 p-3 bg-orange-50 border-l-4 border-orange-400 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-orange-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-orange-800">Custom Categories Selected</h4>
                  <div className="text-sm text-orange-700">
                    {reviewData.exceptionalCategory && (
                      <p>Custom Category: <span className="font-medium">{reviewData.exceptionalCategory}</span></p>
                    )}
                    {reviewData.exceptionalSubCategory && (
                      <p>Custom Subcategory: <span className="font-medium">{reviewData.exceptionalSubCategory}</span></p>
                    )}
                    <p className="text-xs mt-1">
                      🔍 These custom categories will appear in the admin dashboard for review. 
                      Administrators may convert them to standard categories for future use.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                <label className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer transition" title="Add photos or videos (max 10MB each)">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <Image className="w-5 h-5 text-green-500" />
                </label>
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition" title="Video upload">
                  <Video className="w-5 h-5 text-red-500" />
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition" title="Add emoji">
                  <Smile className="w-5 h-5 text-yellow-500" />
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition" title="Add location">
                  <MapPin className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              📸 Supports JPG, PNG, GIF, WebP images and MP4, WebM videos (max 10MB each)
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={
              !reviewData.rating || 
              !reviewData.product || 
              !reviewData.reviewText || 
              !reviewData.productOrService || 
              (!reviewData.categoryId && !reviewData.exceptionalCategory) ||
              isSubmitting ||
              showSuccessMessage
            }
            className={`w-full font-semibold py-2.5 rounded-lg transition ${
              showSuccessMessage 
                ? 'bg-green-500 text-white' 
                : isSubmitting 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white'
            }`}
          >
            {showSuccessMessage 
              ? '✅ Review Posted Successfully!' 
              : isSubmitting 
                ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {uploadStage || 'Posting Review...'}
                  </div>
                ) 
                : 'Post Review'
            }
          </button>
        </div>
      </div>
    </div>
  );
}