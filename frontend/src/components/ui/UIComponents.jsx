import React, { useState } from "react";

// 🔹 Reusable UI Components
export const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-sm",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

export const Card = ({ children, className = "", onClick }) => (
  <div
    className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

export const Avatar = ({ children, className = "" }) => (
  <div
    className={`relative inline-flex items-center justify-center overflow-hidden bg-gray-100 rounded-full ${className}`}
  >
    {children}
  </div>
);

export const AvatarImage = ({ src, alt }) =>
  src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : null;

export const AvatarFallback = ({ children, className = "" }) => (
  <span className={`text-gray-500 ${className}`}>{children}</span>
);

export const Progress = ({ value, className = "" }) => (
  <div className={`w-full bg-gray-300 rounded-full h-2.5 ${className}`}>
    <div
      className="bg-gray-800 h-2.5 rounded-full transition-all"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

// 🔹 Tabs Components
export const Tabs = ({ children, defaultValue, className = "" }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

export const TabsList = ({ children, activeTab, setActiveTab }) => (
  <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-200 p-1">
    {React.Children.map(children, (child) =>
      React.cloneElement(child, { activeTab, setActiveTab })
    )}
  </div>
);

export const TabsTrigger = ({ children, value, activeTab, setActiveTab }) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
      activeTab === value
        ? "bg-white text-gray-900 shadow-sm"
        : "text-gray-600 hover:text-gray-900"
    }`}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

export const TabsContent = ({ children, value, activeTab }) =>
  activeTab === value ? <div>{children}</div> : null;

// 🔹 Common Utility Functions
export const formatNumber = (num) => {
  if (num >= 1000) {
    return num.toLocaleString();
  }
  return num.toString();
};

// 🔹 Common Constants
export const COMMON_STYLES = {
  gradientHeader: "bg-gradient-to-r from-blue-500 to-purple-600",
  inputField: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  iconInInput: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
  modalOverlay: "fixed inset-0 bg-black/30 backdrop-blur-xl flex items-center justify-center z-50 p-4",
  modalContent: "bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden",
};