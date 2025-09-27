import React, { useState } from 'react';
import { ArrowLeft, Upload, Star, MapPin, Eye, Home } from 'lucide-react';


const WriteReview = ({ currentUser = { name: 'Sarah Johnson', username: 'sarahj_reviews', avatar: null }, onCancel, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    rating: 0,
    title: '',
    content: '',
    images: [],
    location: '',
    tags: [],
    isPublic: true,
    allowComments: true
  });

  const categories = ['Technology', 'Food & Dining', 'Travel & Hotels', 'Fashion', 'Beauty', 'Home & Garden'];
  const suggestedTags = ['recommended', 'overpriced', 'great-value', 'disappointing', 'must-have', 'skip-it'];

  const handleRating = (rating) => setFormData({ ...formData, rating });
  const handleTag = (tag) => {
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    setFormData({ ...formData, tags: newTags });
  };

  const mockImageUpload = () => {
    setFormData({ 
      ...formData, 
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop'] 
    });
  };

  const Step1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">What are you reviewing?</label>
        <input
          type="text"
          placeholder="Search for a product or service..."
          value={formData.productName}
          onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
        
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Your Rating</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => handleRating(star)}>
              <Star className={`w-8 h-8 ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            </button>
          ))}
          {formData.rating > 0 && <span className="ml-2 text-sm text-gray-500">{formData.rating}/5</span>}
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={!formData.productName || !formData.category || formData.rating === 0}
        className="w-full bg-blue-500 text-white py-2 rounded-lg disabled:bg-gray-400"
      >
        Continue
      </button>
    </div>
  );

  const Step2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Review Title</label>
        <input
          placeholder="Sum up your experience in one line..."
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Your Review</label>
        <textarea
          placeholder="Share your detailed experience..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
        />
        <p className="text-sm text-gray-500 mt-1">{formData.content.length}/1000 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Add Photos/Videos</label>
        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {formData.images.map((img, i) => (
              <img key={i} src={img} alt="Upload" className="w-full h-32 object-cover rounded-lg" />
            ))}
          </div>
        )}
        <button
          onClick={mockImageUpload}
          className="w-full border-2 border-dashed border-gray-300 py-4 rounded-lg hover:border-blue-500"
        >
          <Upload className="w-4 h-4 mx-auto mb-2" />
          Upload Photos/Videos
        </button>
      </div>

      <div className="flex gap-4">
        <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 py-2 rounded-lg">Back</button>
        <button
          onClick={() => setStep(3)}
          disabled={!formData.title || !formData.content}
          className="flex-1 bg-blue-500 text-white py-2 rounded-lg disabled:bg-gray-400"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Location (Optional)</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            placeholder="Where did you experience this?"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="flex flex-wrap gap-2">
          {suggestedTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm border ${
                formData.tags.includes(tag)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Make review public</p>
            <p className="text-sm text-gray-500">Others can see and interact with your review</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Allow comments</p>
            <p className="text-sm text-gray-500">Let others comment on your review</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowComments}
              onChange={(e) => setFormData({ ...formData, allowComments: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 py-2 rounded-lg">Back</button>
        <button onClick={() => setStep(4)} className="flex-1 bg-blue-500 text-white py-2 rounded-lg">Preview</button>
      </div>
    </div>
  );

  const Step4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="font-semibold text-lg mb-2">Review Preview</h3>
        <p className="text-gray-500">Here's how your review will appear</p>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full" />
            ) : (
              <span className="text-sm font-medium">{currentUser.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{currentUser.name}</span>
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">✓ Verified</span>
            </div>
            <div className="text-xs text-gray-500">@{currentUser.username} • Just now</div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h3 className="font-medium text-sm">{formData.productName}</h3>
          <p className="text-xs text-gray-500">{formData.category}</p>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} className={`w-4 h-4 ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
        </div>

        <h2 className="font-medium mb-2">{formData.title}</h2>
        <p className="text-sm text-gray-700 mb-4">{formData.content}</p>

        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {formData.images.map((img, i) => (
              <img key={i} src={img} alt="Review" className="w-full h-32 object-cover rounded-lg" />
            ))}
          </div>
        )}

        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {formData.tags.map(tag => (
              <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button onClick={() => setStep(3)} className="flex-1 border border-gray-300 py-2 rounded-lg">Back to Edit</button>
        <button onClick={() => onSubmit?.(formData)} 
      
        className="flex-1 bg-blue-500 text-white py-2 rounded-lg">Publish Review</button>
      </div>
    </div>
  );

  return (
    
     <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background Blur */}
  
      <div
        className="absolute inset-0  bg-opacity-10 backdrop-blur-xs"
        onClick={onCancel}
      ></div>

      {/* Focused Small Window */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 z-10">
       
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-semibold">Create Review</h1>
          <p className="text-sm text-gray-500">Step {step} of 4</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map(stepNum => (
            <div
              key={stepNum}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stepNum <= step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {stepNum === 4 ? <Eye className="w-4 h-4" /> : stepNum}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
    </div>
    </div>
  );
};

export default WriteReview;