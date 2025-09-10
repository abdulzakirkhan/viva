import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
    const navigate =useNavigate()
  const handleGoHome = () => {
    // In a real app, you would use your routing method here
    navigate('/');
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white flex items-center justify-center relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxyYWRpYWxHcmFkaWVudCBpZD0iYSIgY3g9IjUwJSIgY3k9IjUwJSIgcj0iNTAlIiBmeD0iNTAlIiBmeT0iNTAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9Ii4xIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIiBvcGFjaXR5PSIwLjMiLz48L3N2Zz4=')] animate-pulse"></div>
      
      {/* Floating elements */}
      <div className="absolute w-72 h-72 bg-purple-500/10 rounded-full -left-36 -top-36 animate-float"></div>
      <div className="absolute w-56 h-56 bg-pink-500/10 rounded-full -right-28 -bottom-28 animate-float animation-delay-2000"></div>
      
      <div className="text-center z-10 max-w-2xl mx-4">
        {/* Astronaut illustration */}
        <div className="relative mb-8 mx-auto w-48 h-48">
          <div className="absolute w-full h-full bg-white/10 rounded-full animate-ping"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-32 h-32 mx-auto animate-bounce animation-delay-1000" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 464c-114.7 0-208-93.31-208-208S141.3 48 256 48s208 93.31 208 208S370.7 464 256 464zM256 304c-26.47 0-48 21.53-48 48s21.53 48 48 48s48-21.53 48-48S282.5 304 256 304zM256 128c-44.18 0-80 35.82-80 80c0 25.73 12.27 49.69 32 65.04v22.96c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-22.96c19.73-15.35 32-39.31 32-65.04C336 163.8 300.2 128 256 128z" fill="currentColor"/>
            </svg>
          </div>
        </div>
        
        {/* 404 text */}
        <h1 className="text-9xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse">404</h1>
        
        {/* Message */}
        <h2 className="text-3xl font-semibold mb-6">Lost in Space?</h2>
        <p className="text-xl text-gray-300 mb-10 max-w-md mx-auto">
          Oops! The page you're looking for seems to have drifted off into the cosmos.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handleGoBack}
            className="px-6 py-3 bg-transparent border-2 border-cyan-400 text-cyan-400 rounded-lg font-medium hover:bg-cyan-400/10 transition-all duration-300 transform hover:-translate-y-1"
          >
            Go Back
          </button>
          <button 
            onClick={handleGoHome}
            className="px-6 cursor-pointer py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/25"
          >
            Return to Home
          </button>
        </div>
      </div>
      
      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

export default NotFound;