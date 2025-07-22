// Environment configuration for frontend-backend connection
interface EnvironmentConfig {
  apiBaseUrl: string;
  environment: 'development' | 'production';
  isLocal: boolean;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  // Safety check for window object (SSR compatibility)
  if (typeof window === 'undefined') {
    return {
      apiBaseUrl: 'http://localhost:5000/api',
      environment: 'development',
      isLocal: true
    };
  }

  // Check if we're running locally (common local development patterns)
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('192.168.') ||
    window.location.hostname.includes('172.') ||
    window.location.hostname.includes('10.');

  // Determine API base URL based on environment
  let apiBaseUrl: string;

  if (isLocal) {
    // Local development (Backend server)
    apiBaseUrl = 'http://localhost:5000/api';
  } else if (window.location.hostname.includes('fly.dev')) {
    // Fly.dev deployment - try backend subdomain first, fallback to demo mode
    if (window.location.hostname.includes('83075a47d0554924a408b244f984bf97')) {
      // Frontend deployment, check if backend is available
      apiBaseUrl = 'https://aol-tms-backend.fly.dev/api';
      // Note: Will fallback to mock mode if backend unavailable
    } else {
      // Same domain deployment
      apiBaseUrl = `${window.location.protocol}//${window.location.hostname}/api`;
    }
  } else {
    // Production deployment - use same domain with HTTPS
    apiBaseUrl = `${window.location.protocol}//${window.location.hostname}/api`;
  }

  const environment = isLocal ? 'development' : 'production';

  console.log('🌍 Environment Config:', {
    hostname: window.location.hostname,
    apiBaseUrl,
    environment,
    isLocal
  });

  return {
    apiBaseUrl,
    environment,
    isLocal
  };
};

export const ENV_CONFIG = getEnvironmentConfig();
export default ENV_CONFIG;
