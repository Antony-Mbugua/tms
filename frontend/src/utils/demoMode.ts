import { ENV_CONFIG } from '@/config/environment';

export const isDemoMode = (): boolean => {
  return ENV_CONFIG.apiBaseUrl.includes('fly.dev') || ENV_CONFIG.apiBaseUrl.includes('demo');
};

export const getDemoCredentials = () => {
  return {
    email: 'admin@alloverlogistics.com',
    password: 'admin123'
  };
};

export const getDemoMessage = (): string => {
  if (isDemoMode()) {
    const { email, password } = getDemoCredentials();
    return `Demo Mode: Use ${email} / ${password}`;
  }
  return '';
};
