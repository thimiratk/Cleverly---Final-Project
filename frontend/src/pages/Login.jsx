import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate  } from 'react-router-dom';
import { toast } from "react-hot-toast";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import loginImage from '../assets/login.png';
import { useAuth } from '../context/AuthContext';
import API from "../services/api";


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate(); 
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success('Login successful!');
      }
       navigate('/reviews');   // ✅ redirect after login
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }

    try {
      const response = await API.post("/auth/login", {
        ...formData,
        rememberMe
      });
      
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Login successful!");
      navigate('/reviews');
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-transform duration-200">
              <span className="text-white text-2xl font-bold">C</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              CLEVERLY
            </h1>
          </div>

          {/* Sign In Header */}
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Welcome Back!</h2>
          <p className="text-center text-gray-600 mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
              Sign up
            </Link>
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white/80 border-0 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm"
                placeholder="Email address"
                autoComplete="email"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white/80 border-0 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                />
                <span className="text-gray-600">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-500 bg-[#f8f9ff]">or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="flex justify-center space-x-4">
            <button 
              type="button"
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              <FaGoogle className="w-5 h-5" />
            </button>
            <button 
              type="button"
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              <FaFacebook className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-100/50 to-purple-100/50 items-center justify-center p-8 relative">
        <div className="relative w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-[1.02] transition-all duration-300">
            <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
              <img 
                src={loginImage} 
                alt="Login" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Share Your Voice</h2>
              <p className="mt-2 text-gray-600">
                Connect, review, and discover authentic product experiences
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
}
