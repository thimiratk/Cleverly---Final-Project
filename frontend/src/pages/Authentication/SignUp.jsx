import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Star, Check } from 'lucide-react';

const CleverlySignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [activeReaction, setActiveReaction] = useState(0);
  const [pulseEffect, setPulseEffect] = useState(false);

  const reactions = ['🔥', '💜', '⭐', '💖', '✨'];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReaction(prev => (prev + 1) % reactions.length);
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 300);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex">
      {/* Left Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <span className="text-white text-2xl font-bold">C</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              CLEVERLY
            </h1>
            
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                placeholder="User name or E-mail"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-blue-100/60 border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
              />
            </div>
            
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-blue-100/60 border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
              />
            </div>
            
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-blue-100/60 border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-4 px-8 rounded-full hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign Up
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-gray-500 text-sm">Or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Social Login */}
          <div className="flex justify-center space-x-4 mb-6">
            <button className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
              <span className="text-sm font-bold">f</span>
            </button>
            <button className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
              <span className="text-sm font-bold">in</span>
            </button>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Forgot password?
            </button>
            <div className="text-sm text-gray-600">
              Have an account?{' '}
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Social Media Interface */}
      <div className="flex-1 bg-gradient-to-br from-pink-100 to-purple-100 p-8 relative overflow-hidden">
        {/* Floating Social Cards */}
        <div className="relative h-full">
          {/* Main Profile Card */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-96 bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative h-full">
              <img
                src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=face"
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              
              {/* Reaction Bubble */}
              <div className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg">
                <span className={`text-2xl transition-transform duration-300 ${pulseEffect ? 'scale-125' : 'scale-100'}`}>
                  {reactions[activeReaction]}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between">
                <button className="bg-white/90 rounded-full p-3 shadow-lg hover:bg-white transition-colors">
                  <MessageCircle className="w-6 h-6 text-gray-700" />
                </button>
                <button className="bg-white/90 rounded-full p-3 shadow-lg hover:bg-white transition-colors">
                  <Heart className="w-6 h-6 text-red-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Floating Mini Cards */}
          <div className="absolute top-8 left-8 w-24 h-32 bg-orange-400 rounded-2xl shadow-xl transform rotate-12 hover:rotate-6 transition-transform duration-300">
            <div className="p-3 h-full flex flex-col justify-between">
              <div className="w-8 h-8 bg-red-500 rounded-full"></div>
              <div className="text-white text-xs font-bold">Story</div>
            </div>
          </div>

          <div className="absolute top-16 right-8 w-20 h-20 bg-green-500 rounded-full shadow-xl flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>

          <div className="absolute bottom-32 left-16 w-28 h-20 bg-purple-500 rounded-2xl shadow-xl transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <div className="p-3 h-full flex items-center justify-center">
              <Star className="w-8 h-8 text-yellow-300" />
            </div>
          </div>

          <div className="absolute bottom-16 right-12 w-16 h-24 bg-gradient-to-b from-blue-400 to-purple-500 rounded-2xl shadow-xl">
            <div className="p-2 h-full flex flex-col justify-center items-center">
              <div className="w-8 h-8 bg-white rounded-full mb-2"></div>
              <div className="w-6 h-1 bg-white rounded"></div>
              <div className="w-4 h-1 bg-white/70 rounded mt-1"></div>
            </div>
          </div>

          {/* Animated Background Elements */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>
          <div className="absolute top-3/4 left-1/3 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default CleverlySignUp;