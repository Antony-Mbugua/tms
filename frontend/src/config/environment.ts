// Environment configuration for frontend-backend connection
interface EnvironmentConfig {
  apiBaseUrl: string;
  environment: 'development' | 'production';
  isLocal: boolean;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
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
    // Local development (XAMPP or local server)
    apiBaseUrl = 'http://localhost:5000/api';
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
