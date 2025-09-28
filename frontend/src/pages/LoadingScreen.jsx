// src/components/LoadingScreen.jsx
import React from "react";

export default function LoadingScreen({ fadeOut = false }) {
  return (
    <div className={`fixed inset-0 bg-white flex items-center justify-center transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center">
        <h1
          className="text-8xl font-normal text-purple-600 tracking-wider"
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
      
      <style jsx>{`
        @keyframes drawText {
          0% {
            background: linear-gradient(90deg, #9333ea 0%, #9333ea 0%, transparent 0%);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            background-size: 0% 100%;
          }
          100% {
            background: linear-gradient(90deg, #9333ea 100%, #9333ea 100%, transparent 100%);
            background-clip: text;
            -webkit-background-clip: text;
            color: #9333ea;
            background-size: 100% 100%;
          }
        }

        @keyframes loadingBar {
          0%, 100% {
            transform: scaleX(0.3);
            opacity: 0.5;
          }
          50% {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        h1 {
          background: linear-gradient(90deg, #9333ea 0%, #9333ea 0%, transparent 0%);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          background-size: 0% 100%;
        }
      `}</style>
    </div>
  );
}