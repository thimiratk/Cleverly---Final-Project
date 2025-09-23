import React, { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Star, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from '../context/AuthContext';
import GoogleButton from "../components/GoogleButtonSignup";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showOtp, setShowOtp] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [canResend, setCanResend] = useState(true);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [activeReaction, setActiveReaction] = useState(0);
  const [pulseEffect, setPulseEffect] = useState(false);

  const reactions = ["🔥", "💜", "⭐", "💖", "✨"];

  // Emoji reaction animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReaction((prev) => (prev + 1) % reactions.length);
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 300);
    }, 2000);
    return () => clearInterval(interval);
  }, [reactions.length]);

  // Timer for OTP resend
  useEffect(() => {
    if (showOtp && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showOtp, canResend]);

  // Handle input change
  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle OTP change
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Validation helper
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
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
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success('OTP sent to your email!');
        setShowOtp(true); // Show OTP form
        setCanResend(false); // Start timer
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    setIsLoading(true);
    try {
      // Add your OTP verification API call here
      // const result = await verifyOtp(formData.email, otpString);
      
      toast.success('Registration successful!');
      navigate('/login'); // Navigate to login after successful verification
    } catch (error) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    try {
      // Add your resend OTP API call here
      toast.success('OTP resent successfully!');
      setCanResend(false);
      setTimer(60);
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex">
      {/* Left Side - Form */}
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

          {!showOtp ? (
            /* Registration Form */
            <div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Username"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-blue-100/60 border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  autoComplete="name"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-blue-100/60 border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  autoComplete="email"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-blue-100/60 border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  autoComplete="new-password"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-blue-100/60 border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  autoComplete="new-password"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-4 px-8 rounded-full hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-4 text-gray-500 text-sm">OR</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* Social Login */}
              <div className="flex justify-center space-x-4 mb-6">
                <GoogleButton/>
              </div>

              {/* Footer Links */}
              <div className="text-center space-y-2">
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Forgot password?
                </Link>
                <div className="text-sm text-gray-600">
                  Have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* OTP Form */
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
                <p className="text-gray-600 text-sm">
                  We sent a 6-digit code to <br/>
                  <span className="font-medium">{formData.email}</span>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex justify-center space-x-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      ref={(el) => inputRefs.current[index] = el}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      autoComplete="off"
                    />
                  ))}
                </div>

                {serverError && (
                  <div className="text-red-500 text-sm text-center">{serverError}</div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-4 px-8 rounded-full hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResendOtp}
                  disabled={!canResend}
                  className={`text-sm font-medium ${
                    canResend 
                      ? "text-blue-600 hover:text-blue-700 cursor-pointer" 
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {canResend ? "Resend OTP" : `Resend in ${timer}s`}
                </button>
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={() => setShowOtp(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to registration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Social Media Interface */}
      <div className="hidden lg:block flex-1 bg-gradient-to-br from-pink-100 to-purple-100 p-8 relative overflow-hidden">
        {/* Floating Social Cards */}
        <div className="relative h-full">
          {/* Main Profile Card */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative h-full w-full">
              <img
                src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=face"
                alt="Profile"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

              {/* Reaction Bubble */}
              <div className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg">
                <span
                  className={`text-2xl transition-transform duration-300 ${
                    pulseEffect ? "scale-125" : "scale-100"
                  }`}
                >
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

export default Register;