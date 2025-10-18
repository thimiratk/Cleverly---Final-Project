import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate  } from 'react-router-dom';
import { toast } from "react-hot-toast";

import loginImage from '../assets/login.png';
import { useAuth } from '../context/AuthContext';

import GoogleButton from "../components/GoogleButtonSignin";


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
    if (result.success) {
      toast.success('Login successful!');
    } else {
      // Ensure message is a string, not an object
      const errorMessage = typeof result.message === 'string' 
        ? result.message 
        : result.message?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    }
  } catch (error) {
    // Ensure error message is a string
    const errorMessage = typeof error === 'string' 
      ? error 
      : error.message || "Login failed. Please check your credentials.";
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};


return (
  <div className="min-h-screen bg-white flex justify-center items-center gap-x-50">
    {/* Left Side - Login Form */}
    <div className="w-full max-w-md p-8">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-7xl font-normal text-gray-800 tracking-wider"
            style={{ fontFamily: '"Pacifico", cursive' }}
          >
            Cleverly
          </h1>
        </div>

        {/* Sign In Header */}
        <h2 className="text-2xl font-normal text-gray-900 mb-6 text-center">
          Welcome Back!
        </h2>
        <p className="text-center text-gray-600 mb-8 text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-sm text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
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
              className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-sm text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-semibold"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm py-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-600">Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-blue-500 hover:underline font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-4"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 text-gray-500 bg-white font-semibold">
              or continue with
            </span>
          </div>
        </div>

        {/* Social Login */}
        <div className="flex justify-center">
          <GoogleButton />
        </div>
      </div>
    </div>

    {/* Right Side - Image */}
    <div className="hidden lg:flex w-full max-w-md items-center justify-center p-8 relative">
      <div className="relative w-full max-w-md">
        <div>
          <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
            <img
              src={loginImage}
              alt="Login"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              Share Your Voice
            </h2>
            <p className="mt-2 text-gray-600">
              Connect, review, and discover authentic product experiences
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-full opacity-30"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-100 rounded-full opacity-30"></div>
      </div>
    </div>
  </div>
)};
