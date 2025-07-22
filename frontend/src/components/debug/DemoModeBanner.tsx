import React, { useState } from 'react';
import { ENV_CONFIG } from '@/config/environment';

const DemoModeBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Only show on fly.dev deployment
  if (!ENV_CONFIG.apiBaseUrl.includes('fly.dev') || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-bold">
            DEMO
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="font-semibold">
              🚛 AOL TMS Live Demo
            </span>
            <span className="text-blue-100 text-sm">
              Experience the enterprise transportation management system
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-sm bg-white/10 rounded-lg px-3 py-1">
            Login: <strong>admin@alloverlogistics.com</strong> / <strong>admin123</strong>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/80 hover:text-white transition-colors p-1"
            aria-label="Close demo banner"
          >
            ✕
          </button>
        </div>
      </div>
      
      {/* Mobile credentials */}
      <div className="sm:hidden mt-2 text-center text-sm bg-white/10 rounded-lg p-2">
        Login: <strong>admin@alloverlogistics.com</strong> / <strong>admin123</strong>
      </div>
    </div>
  );
};

export default DemoModeBanner;
