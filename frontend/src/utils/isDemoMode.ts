// Simple demo mode detection that doesn't rely on complex environment config
export const isDemoMode = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    return window.location.hostname.includes('fly.dev') || 
           window.location.hostname.includes('demo') ||
           window.location.search.includes('demo=true');
  } catch (error) {
    console.warn('Error detecting demo mode:', error);
    return false;
  }
};

export const getDemoApiUrl = (): string => {
  if (isDemoMode()) {
    return 'https://aol-tms-backend.fly.dev/api';
  }
  return 'http://localhost:5000/api';
};
