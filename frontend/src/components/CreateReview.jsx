import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const CreateReview = ({ onReviewCreated }) => {
  const [formData, setFormData] = useState({
    productName: '',
    rating: 0,
    comment: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to create review
      const formDataToSend = new FormData();
      formDataToSend.append('productName', formData.productName);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('comment', formData.comment);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      // const response = await api.post('/reviews', formDataToSend);
      // onReviewCreated(response.data);

      // Clear form
      setFormData({
        productName: '',
        rating: 0,
        comment: '',
        image: null
      });
      setImagePreview(null);
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h2>
        <p className="text-gray-600">Help others by sharing your honest review</p>
      </div>
      <form onSubmit={handleSubmit}>
        {/* Product Name */}
        <div className="mb-6">
          <label htmlFor="productName" className="block text-sm font-semibold text-gray-700 mb-2">
            Product Name
          </label>
          <input
            type="text"
            id="productName"
            name="productName"
            value={formData.productName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
            placeholder="e.g., iPhone 15"
          />
        </div>

        {/* Rating */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                className="transform hover:scale-110 transition duration-150 focus:outline-none"
              >
                <FaStar
                  className={`w-8 h-8 ${
                    star <= (hoveredStar || formData.rating)
                      ? 'text-yellow-400'
                      : 'text-gray-200'
                  } transition duration-150`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">
              {formData.rating ? `${formData.rating} out of 5` : 'Select a rating'}
            </span>
          </div>
        </div>

        {/* Review Comment */}
        <div className="mb-6">
          <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            required
            rows="4"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
            placeholder="Share your experience with this product. What did you like or dislike? Would you recommend it?"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Product Image (optional)
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col w-full h-32 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-sm text-gray-500">Click to upload a photo</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          {imagePreview && (
            <div className="mt-4">
              <div className="relative w-40 h-40">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData(prev => ({ ...prev, image: null }));
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 font-semibold"
        >
          Post Review
        </button>
      </form>
    </div>
  );
};

export default CreateReview;
