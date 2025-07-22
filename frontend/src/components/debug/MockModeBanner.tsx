import React, { useState, useEffect } from 'react';
import { ENV_CONFIG } from '@/config/environment';

const MockModeBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const healthUrl = ENV_CONFIG.apiBaseUrl.replace('/api', '/health');
        const response = await fetch(healthUrl, { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsBackendAvailable(data.status === 'OK');
        } else {
          setIsBackendAvailable(false);
        }
      } catch (error) {
        setIsBackendAvailable(false);
      }
    };

    checkBackend();
  }, []);

  useEffect(() => {
    if (isBackendAvailable === false) {
      setShowBanner(true);
    }
  }, [isBackendAvailable]);

  if (!showBanner || isBackendAvailable === true) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>⚠️</span>
          <span>
            <strong>Mock Mode:</strong> Backend server not available. Using demo data. 
            Login with: <code className="bg-yellow-600 px-1 rounded">admin@alloverlogistics.com</code> / 
            <code className="bg-yellow-600 px-1 rounded">admin123</code>
          </span>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="text-yellow-900 hover:text-yellow-700 text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default MockModeBanner;
