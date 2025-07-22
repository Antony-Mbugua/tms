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
  } else if (window.location.hostname.includes('fly.dev')) {
    // Fly.dev deployment - check if backend is deployed separately
    const frontendUrl = window.location.hostname;
    if (frontendUrl.includes('83075a47d0554924a408b244f984bf97')) {
      // This is the frontend deployment, backend might be at different URL
      // Try the backend app or fallback to mock mode
      apiBaseUrl = 'https://aol-tms-backend.fly.dev/api';
    } else {
      // Same domain deployment
      apiBaseUrl = `${window.location.protocol}//${window.location.hostname}/api`;
    }
  } else if (window.location.hostname.includes('hostinger') ||
             window.location.hostname.includes('your-domain.com')) {
    // Hostinger cloud or custom domain
    apiBaseUrl = `https://${window.location.hostname}/api`;
  } else {
    // Default to current domain with https
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
