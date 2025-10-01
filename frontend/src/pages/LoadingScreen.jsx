// src/components/LoadingScreen.jsx
import React from "react";

export default function LoadingScreen({ fadeOut = false }) {
  return (
    <div className={`fixed inset-0 bg-white flex items-center justify-center transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center">
        <h1
          className="text-8xl font-normal text-purple-600 tracking-wider loading-h1"
          style={{ 
            fontFamily: '"Pacifico", cursive',
            animation: 'drawText 3s ease-out forwards'
          }}
        >
          Cleverly
        </h1>
        <div className="mt-8">
          <div className="w-16 h-1 bg-purple-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full animate-pulse" 
                 style={{ 
                   width: '100%',
                   animation: 'loadingBar 2s ease-in-out infinite'
                 }}>
            </div>
          </div>
          <p className="text-purple-500 text-sm mt-4 animate-pulse">Loading...</p>
        </div>
      </div>
    </div>
  );
}
