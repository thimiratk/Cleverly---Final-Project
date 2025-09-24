import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import verifyImage from "../assets/login.png"; // can reuse or replace
import API from "../services/api";

export default function OtpVerify() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const validateForm = () => {
    if (!otp.trim()) {
      toast.error("OTP is required");
      return false;
    }
    if (otp.length < 4) {
      toast.error("OTP must be at least 4 digits");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await API.post("/auth/verify-otp", { otp });
      toast.success("OTP verified successfully!");
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/reviews");
    } catch (error) {
      console.error("OTP verify error:", error);
      toast.error(error.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center items-center gap-x-50">
      {/* Left Side - OTP Verify Form */}
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
            Enter the OTP we sent to your email
          </p>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* OTP Input */}
            <div>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-sm text-gray-900 text-center tracking-widest text-lg focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                placeholder="Enter OTP"
                required
              />
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
            Didn’t receive the code?{" "}
            <button
              onClick={() => toast.success("OTP resent successfully!")}
              className="text-blue-500 font-semibold hover:underline"
            >
              Resend OTP
            </button>
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

      {/* Right Side - Image */}
      <div className="hidden lg:flex w-full max-w-md items-center justify-center p-8 relative">
        <div className="relative w-full max-w-md">
          <div>
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
              <img
                src={verifyImage}
                alt="Verify OTP"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-2xl font-semibold text-gray-800">
                Secure Your Account
              </h2>
              <p className="mt-2 text-gray-600">
                Enter the one-time code to complete your verification
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
