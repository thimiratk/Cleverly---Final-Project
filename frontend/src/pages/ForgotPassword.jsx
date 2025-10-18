import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import resetImage from "../assets/login.png"; // can reuse same image
import API from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: reset password
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6 digits
  const inputRefs = useRef([]);
  const [timer, setTimer] = useState(60);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP countdown timer
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [step, timer]);

  const handleOtpChange = (index, value) => {
    if (/^\d*$/.test(value)) {
      const newOtpArr = [...otp];
      newOtpArr[index] = value;
      setOtp(newOtpArr);
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    setIsLoading(true);
    try {
      const response = await API.post("/forgot-password", { email });
      if (response.data.message.includes("OTP sent")) {
        toast.success("OTP sent to your email!");
        setStep(2);
        setTimer(60);
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error || error.response?.data?.message || "Error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    setIsLoading(true);
    try {
      const response = await API.post("/verify-forgot-password-otp", { email, otp: enteredOtp });
      if (response.data.success) {
        toast.success("OTP verified successfully!");
        setStep(3);
      } else {
        toast.error(response.data.message || "OTP verification failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error || error.response?.data?.message || "Error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const response = await API.post("/reset-password", { email, newPassword });
      if (response.data.message === "Password reset successfully") {
        toast.success("Password reset successfully!");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Reset failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error || error.response?.data?.message || "Error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();
    setTimer(60);
    try {
      await API.post("/forgot-password", { email });
      toast.success("OTP resent successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center items-center gap-x-50">
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
          {/* Form Header */}
          {step === 1 && <h2 className="text-2xl font-normal text-gray-900 mb-6 text-center">Forgot Password</h2>}
          {step === 2 && <h2 className="text-2xl font-normal text-gray-900 mb-6 text-center">Verify OTP</h2>}
          {step === 3 && <h2 className="text-2xl font-normal text-gray-900 mb-6 text-center">Reset Password</h2>}

          {step === 1 && (
            <form className="space-y-3" onSubmit={handleSendOtp}>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-sm text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-4"
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <>
              <p className="text-center text-gray-600 mb-8 text-sm">
                Enter the 6-digit OTP sent to your email
              </p>
              <form className="space-y-3" onSubmit={handleVerifyOtp}>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      ref={(el) => { if(el) inputRefs.current[index] = el }}
                      maxLength={1}
                      className="w-12 px-3 py-3 bg-gray-50 border border-gray-300 rounded-sm text-gray-900 text-center tracking-widest text-lg focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                      placeholder="-"
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      value={digit}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-4"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
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
            </>
          )}

          {step === 3 && (
            <form className="space-y-3" onSubmit={handleResetPassword}>
              <div>
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-sm text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-sm text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-4"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

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
                src={resetImage}
                alt="Reset"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-2xl font-semibold text-gray-800">
                Reset Your Password
              </h2>
              <p className="mt-2 text-gray-600">
                Enter your email and follow the steps to reset your password.
              </p>
            </div>
          </div>
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-full opacity-30"></div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-100 rounded-full opacity-30"></div>
        </div>
      </div>
    </div>
  );
}
