import React, { useState, useEffect } from 'react';
import { reviewsAPI, domainAPI } from '../services/api';

const ExceptionalReviews = () => {
  const [exceptionalReviews, setExceptionalReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [createType, setCreateType] = useState(''); // 'category' or 'subcategory'
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reviewsData, categoriesData] = await Promise.all([
        reviewsAPI.getExceptional(),
        domainAPI.getCategories()
      ]);
      setExceptionalReviews(reviewsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load exceptional reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !selectedReview) return;

    try {
      setProcessing(prev => ({ ...prev, [selectedReview.id]: true }));
      
      const result = await reviewsAPI.createCategoryFromExceptional(
        selectedReview.id,
        newCategoryName.trim()
      );
      
      // Refresh data
      await loadData();
      
      // Close modal
      setShowCreateModal(false);
      setNewCategoryName('');
      setSelectedReview(null);
      
      alert(`Category "${result.category.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Failed to create category');
    } finally {
      setProcessing(prev => ({ ...prev, [selectedReview.id]: false }));
    }
  };

  const handleCreateSubCategory = async () => {
    if (!newSubCategoryName.trim() || !selectedCategoryForSub || !selectedReview) return;

    try {
      setProcessing(prev => ({ ...prev, [selectedReview.id]: true }));
      
      const result = await reviewsAPI.createSubCategoryFromExceptional(
        selectedReview.id,
        newSubCategoryName.trim(),
        selectedCategoryForSub
      );
      
      // Refresh data
      await loadData();
      
      // Close modal
      setShowCreateModal(false);
      setNewSubCategoryName('');
      setSelectedCategoryForSub('');
      setSelectedReview(null);
      
      alert(`Subcategory "${result.subcategory.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating subcategory:', error);
      setError('Failed to create subcategory');
    } finally {
      setProcessing(prev => ({ ...prev, [selectedReview.id]: false }));
    }
  };

  const handleConvertToExisting = async (reviewId, categoryId, subCategoryId = null) => {
    try {
      setProcessing(prev => ({ ...prev, [reviewId]: true }));
      
      await reviewsAPI.convertExceptional(reviewId, {
        categoryId,
        subCategoryId
      });
      
      // Refresh data
      await loadData();
      
      alert('Review converted to standard categories successfully!');
    } catch (error) {
      console.error('Error converting review:', error);
      setError('Failed to convert review');
    } finally {
      setProcessing(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const openCreateModal = (review, type) => {
    setSelectedReview(review);
    setCreateType(type);
    setShowCreateModal(true);
    setError('');
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setSelectedReview(null);
    setCreateType('');
    setNewCategoryName('');
    setNewSubCategoryName('');
    setSelectedCategoryForSub('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Exceptional Reviews Management</h1>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError('')}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {exceptionalReviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Exceptional Reviews</h3>
          <p className="text-gray-500">All reviews are using standard categories.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {exceptionalReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{review.product}</h3>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      Exceptional
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">By: {review.user?.name || 'Unknown User'}</p>
                  <p className="text-gray-700 mb-4">{review.reviewText}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-orange-50 rounded-lg">
                    {review.exceptionalCategory && (
                      <div>
                        <h4 className="font-medium text-orange-800 mb-2">Custom Category:</h4>
                        <p className="text-orange-700 font-semibold">{review.exceptionalCategory}</p>
                        <div className="mt-2 space-y-2">
                          <button
                            onClick={() => openCreateModal(review, 'category')}
                            disabled={processing[review.id]}
                            className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processing[review.id] ? 'Processing...' : 'Create as New Category'}
                          </button>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleConvertToExisting(review.id, e.target.value);
                              }
                            }}
                            disabled={processing[review.id]}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            defaultValue=""
                          >
                            <option value="">Convert to Existing Category</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    
                    {review.exceptionalSubCategory && (
                      <div>
                        <h4 className="font-medium text-orange-800 mb-2">Custom Subcategory:</h4>
                        <p className="text-orange-700 font-semibold">{review.exceptionalSubCategory}</p>
                        <div className="mt-2">
                          <button
                            onClick={() => openCreateModal(review, 'subcategory')}
                            disabled={processing[review.id]}
                            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processing[review.id] ? 'Processing...' : 'Create as New Subcategory'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {createType === 'category' ? 'Create New Category' : 'Create New Subcategory'}
            </h2>
            
            {createType === 'category' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={selectedReview?.exceptionalCategory || 'Enter category name'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim()}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Category
                  </button>
                  <button
                    onClick={closeCreateModal}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {createType === 'subcategory' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Subcategory Name
                  </label>
                  <input
                    type="text"
                    value={newSubCategoryName}
                    onChange={(e) => setNewSubCategoryName(e.target.value)}
                    placeholder={selectedReview?.exceptionalSubCategory || 'Enter subcategory name'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Parent Category
                  </label>
                  <select
                    value={selectedCategoryForSub}
                    onChange={(e) => setSelectedCategoryForSub(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateSubCategory}
                    disabled={!newSubCategoryName.trim() || !selectedCategoryForSub}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Subcategory
                  </button>
                  <button
                    onClick={closeCreateModal}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExceptionalReviews;