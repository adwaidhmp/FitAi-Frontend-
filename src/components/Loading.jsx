import React from 'react';

const Loading = ({ small = false, text = true, className = "" }) => {
  if (small) {
    return (
      <div className={`relative inline-block ${className}`}>
        <div className="w-5 h-5 border-2 border-purple-900/40 rounded-full"></div>
        <div className="absolute inset-0 w-5 h-5 border-2 border-t-purple-500 border-r-pink-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] w-full bg-transparent ${className}`}>
      <div className="relative w-16 h-16">
        {/* Background ring */}
        <div className="absolute inset-0 border-4 border-purple-900/40 rounded-full"></div>
        {/* Spinning ring with gradient colors */}
        <div className="absolute inset-0 border-4 border-t-purple-500 border-r-pink-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
      {text && (
        <div className="mt-4 text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400 font-semibold animate-pulse">
          Loading...
        </div>
      )}
    </div>
  );
};

export default Loading;
