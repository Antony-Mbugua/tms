import React, { useState, useEffect } from 'react';
import { ENV_CONFIG } from '@/config/environment';

interface ConnectionStatus {
  api: 'connected' | 'disconnected' | 'checking';
  database: 'connected' | 'disconnected' | 'unknown';
  latency: number | null;
  error: string | null;
}

const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    api: 'checking',
    database: 'unknown',
    latency: null,
    error: null
  });
  const [isMinimized, setIsMinimized] = useState(false);

  const checkConnection = async () => {
    setStatus(prev => ({ ...prev, api: 'checking', error: null }));
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${ENV_CONFIG.apiBaseUrl}/../health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        setStatus({
          api: 'connected',
          database: data.database === 'connected' ? 'connected' : 'disconnected',
          latency,
          error: null
        });
      } else {
        setStatus(prev => ({
          ...prev,
          api: 'disconnected',
          error: `HTTP ${response.status}: ${response.statusText}`
        }));
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setStatus(prev => ({
        ...prev,
        api: 'disconnected',
        latency: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      case 'checking': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅';
      case 'disconnected': return '❌';
      case 'checking': return '🔄';
      default: return '❓';
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <div className={`w-2 h-2 rounded-full ${status.api === 'connected' ? 'bg-green-500' : status.api === 'checking' ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-600 dark:text-gray-400">Status</span>
          <span className="text-xs">▼</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-200 dark:border-gray-700 min-w-[300px]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Connection Status
        </h3>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs p-1"
        >
          ▲
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span>Environment:</span>
          <span className="font-mono text-blue-600">
            {ENV_CONFIG.environment}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>API Server:</span>
          <span className={`flex items-center gap-1 ${getStatusColor(status.api)}`}>
            {getStatusIcon(status.api)}
            {status.api}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>Database:</span>
          <span className={`flex items-center gap-1 ${getStatusColor(status.database)}`}>
            {getStatusIcon(status.database)}
            {status.database}
          </span>
        </div>

        {status.latency && (
          <div className="flex justify-between items-center">
            <span>Latency:</span>
            <span className="text-gray-600 dark:text-gray-400">
              {status.latency}ms
            </span>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 break-all">
          API: {ENV_CONFIG.apiBaseUrl}
        </div>

        {status.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 mt-2">
            <div className="text-xs text-red-600 dark:text-red-400 break-all">
              Error: {status.error}
            </div>
          </div>
        )}

        <button
          onClick={checkConnection}
          className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded transition-colors"
          disabled={status.api === 'checking'}
        >
          {status.api === 'checking' ? 'Checking...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatus;
