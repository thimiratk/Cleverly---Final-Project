import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Img from '../../assets/login.png';
import logo from '../../assets/logo.jpeg';
import { Link, useNavigate } from 'react-router-dom'


export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState(''); // Added missing state
  const [password, setPassword] = useState(''); // Added missing state

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Your login API call here
      const loginData = {
        email,
        password,
        rememberMe
      };

      // Example API call (replace with your actual endpoint)
      // const response = await fetch('/api/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(loginData)
      // });

      // if (response.ok) {
      //   const userData = await response.json();
      //   // Check if user has selected a role
      //   if (userData.role) {
      //     // Navigate to appropriate dashboard
      //     if (userData.role === 'worker') {
      //       navigate('/worker-dashboard');
      //     } else if (userData.role === 'client') {
      //       navigate('/client-dashboard');
      //     }
      //   } else {
      //     // User hasn't selected a role yet
      //     navigate('/select-role');
      //   }
      // } else {
      //   throw new Error('Login failed');
      // }

      // For demo purposes, navigate to role selection
      console.log('Login data:', loginData);
      navigate('/roleselection');
      
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans">
     
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

          {/* Sign In Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h1>        
          <p className="text-gray-600 mb-8">
            Don't have an account?
            <a href="./signup" className="text-blue-600 hover:underline ml-1">Create now</a>
          </p>

          {/* Form */}
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                id="email"  
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="anna@gmail.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
            >
              Sign in
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Social Login Buttons */}
          {/* Social Login */}
          <div className="flex justify-center space-x-4 mb-6">
            <button className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
              <span className="text-sm font-bold">f</span>
            </button>
            <button className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
              <span className="text-sm font-bold">in</span>
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Right Side - Feature Card */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-r from-[#F7E9E9] to-blue-300 items-center justify-center p-8 relative overflow-hidden">
        <div className="max-w-md w-full relative z-0">
          {/* Feature Card */}
          <div className="rounded shadow-xl relative z-10">
          <img src={Img} alt="Feature" className="w-full h-full rounded" />          
          </div>
        </div>
      </div>
    </div>
  );
}