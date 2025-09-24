import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import registerImage from "../assets/login.png"; // reuse same image or change
import API from "../services/api";
import GoogleButton from "../components/GoogleButtonSignup";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6 digits
  const inputRefs = useRef([]);

  const [timer, setTimer] = useState(60);

  // Countdown timer effect
  useEffect(() => {
    if (showOtp && timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [showOtp, timer]);

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

  const handleOtpChange = (index, value) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!showOtp && !validateForm()) return;

    setIsLoading(true);
    try {
      if (!showOtp) {
        const response = await API.post("/auth/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

        toast.success("Registration successful!");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/reviews");
      } else {
        // OTP verification flow
        const enteredOtp = otp.join("");
        if (enteredOtp.length !== 6) {
          toast.error("Please enter the 6-digit OTP");
        } else {
          toast.success("OTP verified successfully!");
          navigate("/reviews");
        }
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    setTimer(60); // restart countdown
    toast.success("OTP resent successfully!");
    // call your API to resend OTP here
  };

  return (
    <div className="min-h-screen bg-white flex justify-center items-center gap-x-50">
      {/* Left Side */}
      {!showOtp ? (
        // Register form (unchanged)
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
            {/* Header */}
            <h2 className="text-2xl font-normal text-gray-900 mb-6 text-center">
              Create Your Account
            </h2>
            <p className="text-center text-gray-600 mb-8 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-500 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
            <form className="space-y-3" onSubmit={handleSubmit}>
              {/* Name */}
              <div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-sm text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                  placeholder="Full name"
                  required
                />
              </div>
              {/* Email */}
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
              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-sm text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                  placeholder="Enter your password"
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
              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-sm text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-semibold"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-4"
              >
                {isLoading ? "Creating account..." : "Sign up"}
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
            {/* Social Register */}
            <div className="flex justify-center">
              <GoogleButton />
            </div>
          </div>
        </div>
      ) : (
        // OTP Verification
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
            {/* Header */}
            <h2 className="text-2xl font-normal text-gray-900 mb-6 text-center">
              Verify Your Account
            </h2>
            <p className="text-center text-gray-600 mb-8 text-sm">
              Enter the 6-digit OTP we sent to your email
            </p>
            <form className="space-y-3" onSubmit={handleSubmit}>
              {/* OTP Input */}
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    maxLength={1}
                    className="w-12 px-3 py-3 bg-gray-50 border border-gray-300 rounded-sm text-gray-900 text-center tracking-widest text-lg focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                    placeholder="-"
                    onChange={(e) =>
                      handleOtpChange(index, e.target.value)
                    }
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    value={digit}
                  />
                ))}
              </div>
              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-4"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
            {/* Resend OTP */}
            <p className="text-center text-gray-600 mt-6 text-sm">
              {timer > 0 ? (
                <>Resend OTP in {timer}s</>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-blue-500 font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </p>
            {/* Back to login */}
            <p className="text-center text-gray-600 mt-4 text-sm">
              <Link
                to="/login"
                className="text-blue-500 font-semibold hover:underline"
              >
                Back to Sign in
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Right Side - Image */}
      <div className="hidden lg:flex w-full max-w-md items-center justify-center p-8 relative">
        <div className="relative w-full max-w-md">
          <div>
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
              <img
                src={registerImage}
                alt="Register"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-2xl font-semibold text-gray-800">
                Join Our Community
              </h2>
              <p className="mt-2 text-gray-600">
                Create an account to share and discover authentic product
                experiences
              </p>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-full opacity-30"></div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-100 rounded-full opacity-30"></div>
        </div>
      </div>
    </div>
  );
}
