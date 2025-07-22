import React, { useState, useEffect } from 'react';
import { ENV_CONFIG } from '@/config/environment';

const DatabaseStatusNotice: React.FC = () => {
  const [isDatabaseConnected, setIsDatabaseConnected] = useState<boolean | null>(null);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        const healthUrl = ENV_CONFIG.apiBaseUrl.replace('/api', '/health');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(healthUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setIsDatabaseConnected(data.database === 'connected');
          if (data.database !== 'connected') {
            setShowNotice(true);
          }
        } else {
          setIsDatabaseConnected(false);
          setShowNotice(true);
        }
      } catch (error) {
        // Silently handle fetch errors for demo mode
        console.log('Backend not available, running in demo mode');
        setIsDatabaseConnected(false);
        setShowNotice(true);
      }
    };

    // Always check in development, and also for fly.dev demo
    if (ENV_CONFIG?.environment === 'development' || ENV_CONFIG?.apiBaseUrl?.includes('fly.dev')) {
      checkDatabaseStatus();
      // Only set interval for local development, not for fly.dev demo
      if (ENV_CONFIG.environment === 'development' && !ENV_CONFIG.apiBaseUrl.includes('fly.dev')) {
        const interval = setInterval(checkDatabaseStatus, 15000);
        return () => clearInterval(interval);
      }
    }
  }, []);

  // Always show notice for fly.dev demo, or when database disconnected in dev
  if (!showNotice && !ENV_CONFIG?.apiBaseUrl?.includes('fly.dev')) {
    return null;
  }

  // Don't show if database is connected and not on fly.dev
  if (isDatabaseConnected === true && !ENV_CONFIG?.apiBaseUrl?.includes('fly.dev')) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-900 px-4 py-2 text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>⚠️</span>
          <span>
            <strong>{ENV_CONFIG?.apiBaseUrl?.includes('fly.dev') ? 'Demo Mode:' : 'Development Mode:'}</strong>
            {' '}{ENV_CONFIG?.apiBaseUrl?.includes('fly.dev') ? 'Backend not deployed. Using demo data.' : 'MySQL database not connected. Using mock data.'}
            {' '}{!ENV_CONFIG?.apiBaseUrl?.includes('fly.dev') && 'To connect to real database: Start XAMPP → MySQL service.'}
            {' '}Login: <code className="bg-amber-600 px-1 rounded">admin@alloverlogistics.com</code> /
            <code className="bg-amber-600 px-1 rounded">admin123</code>
          </span>
        </div>
        <button
          onClick={() => setShowNotice(false)}
          className="text-amber-900 hover:text-amber-700 text-lg ml-4"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default DatabaseStatusNotice;
