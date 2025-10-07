import React, { useState } from 'react'
import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'

export default function ReviewForm({ onReviewSubmitted }) {
  const [formData, setFormData] = useState({
    user_id: '',
    text: '',
    rating: '',
    ip_address: '',
    user_agent: '',
    account_created: '',
    device_info: {}
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Prepare data
      const submitData = {
        ...formData,
        rating: formData.rating ? parseInt(formData.rating) : null,
        device_info: formData.device_info || {}
      }

      const response = await axios.post(`${API_BASE}/analyze-review`, submitData)
      setResult(response.data)
      
      // Reset form
      setFormData({
        user_id: '',
        text: '',
        rating: '',
        ip_address: '',
        user_agent: '',
        account_created: '',
        device_info: {}
      })

      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data)
      }

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze review')
      console.error('Review submission error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Submit Review for Analysis</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID *
            </label>
            <input
              type="text"
              name="user_id"
              value={formData.user_id}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user123"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating (1-5)
            </label>
            <select
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select rating</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>

          {/* IP Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IP Address
            </label>
            <input
              type="text"
              name="ip_address"
              value={formData.ip_address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="192.168.1.1"
            />
          </div>

          {/* Account Created */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Created Date
            </label>
            <input
              type="date"
              name="account_created"
              value={formData.account_created}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* User Agent */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User Agent
          </label>
          <input
            type="text"
            name="user_agent"
            value={formData.user_agent}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          />
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review Text *
          </label>
          <textarea
            name="text"
            value={formData.text}
            onChange={handleInputChange}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your review here..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {loading ? 'Analyzing...' : 'Analyze Review'}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Analysis Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Risk Assessment */}
            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium text-gray-700 mb-2">Risk Assessment</h4>
              <div className={`inline-block px-2 py-1 rounded text-sm font-medium ${getRiskColor(result.rule_based?.risk_level)}`}>
                {result.rule_based?.risk_level || 'Unknown'} Risk
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Score: {result.rule_based?.risk_score || 'N/A'}
              </p>
            </div>

            {/* ML Prediction */}
            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium text-gray-700 mb-2">ML Prediction</h4>
              <p className="text-sm">
                {result.ml_based?.prediction || 'Not available'}
              </p>
            </div>

            {/* Sentiment */}
            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium text-gray-700 mb-2">Sentiment</h4>
              <p className="text-sm">
                {result.sentiment?.[0]?.label || 'Unknown'}
                {result.sentiment?.[0]?.score && (
                  <span className="text-gray-500 ml-1">
                    ({(result.sentiment[0].score * 100).toFixed(1)}%)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Review ID */}
          <div className="mt-3 text-xs text-gray-500">
            Review ID: {result._id}
          </div>
        </div>
      )}
    </div>
  )
}