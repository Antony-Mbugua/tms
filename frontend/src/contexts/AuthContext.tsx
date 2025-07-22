import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

// Types
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  timezone: string;
  language: string;
  themePreference: 'light' | 'dark' | 'system';
  hasTrainingAccess: boolean;
  trainingLevel: 'basic' | 'intermediate' | 'advanced';
  mfaEnabled: boolean;
  roles: Array<{ name: string }>;
  permissions: Array<{ name: string }>;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  mfaToken?: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: string;
  sessionId?: string;
  mfaRequired?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: string }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        accessToken: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Storage helpers
const setStorageItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const getStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return null;
  }
};

const removeStorageItem = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
};

// Mock API calls (replace with actual API integration)
const mockLogin = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock successful login for admin user
  if (credentials.email === 'admin@alloverlogistics.com' && credentials.password === 'admin123') {
    const mockUser: User = {
      id: 1,
      email: 'admin@alloverlogistics.com',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1-555-0101',
      timezone: 'America/New_York',
      language: 'en',
      themePreference: 'dark',
      hasTrainingAccess: true,
      trainingLevel: 'advanced',
      mfaEnabled: false,
      roles: [{ name: 'admin' }],
      permissions: [
        { name: 'user.view' },
        { name: 'user.create' },
        { name: 'user.update' },
        { name: 'user.delete' },
        { name: 'load.view' },
        { name: 'load.create' },
        { name: 'system.logs' },
      ],
      lastLoginAt: new Date().toISOString(),
      emailVerifiedAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Login successful',
      user: mockUser,
      accessToken: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresIn: '15m',
      sessionId: 'mock-session-' + Date.now(),
    };
  }
  
  // Mock other test users
  const testUsers: Record<string, User> = {
    'dispatcher@alloverlogistics.com': {
      id: 2,
      email: 'dispatcher@alloverlogistics.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1-555-0102',
      timezone: 'America/New_York',
      language: 'en',
      themePreference: 'dark',
      hasTrainingAccess: true,
      trainingLevel: 'intermediate',
      mfaEnabled: false,
      roles: [{ name: 'dispatcher' }],
      permissions: [
        { name: 'load.view' },
        { name: 'load.create' },
        { name: 'load.update' },
        { name: 'truck.view' },
      ],
    },
    'driver@alloverlogistics.com': {
      id: 3,
      email: 'driver@alloverlogistics.com',
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1-555-0201',
      timezone: 'America/New_York',
      language: 'en',
      themePreference: 'dark',
      hasTrainingAccess: true,
      trainingLevel: 'basic',
      mfaEnabled: false,
      roles: [{ name: 'driver' }],
      permissions: [
        { name: 'load.view' },
        { name: 'load.status_update' },
        { name: 'document.upload' },
      ],
    },
  };

  const user = testUsers[credentials.email];
  if (user && credentials.password === 'admin123') {
    return {
      success: true,
      message: 'Login successful',
      user,
      accessToken: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresIn: '15m',
      sessionId: 'mock-session-' + Date.now(),
    };
  }

  throw new Error('Invalid credentials');
};

const mockLogout = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
};

const mockRefreshToken = async (): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return 'mock-new-jwt-token-' + Date.now();
};

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = getStorageItem('accessToken');
        const savedUser = getStorageItem('user');

        if (savedToken && savedUser) {
          const user = JSON.parse(savedUser);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, accessToken: savedToken },
          });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear corrupted data
        removeStorageItem('accessToken');
        removeStorageItem('user');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await mockLogin(credentials);

      if (response.success && response.user && response.accessToken) {
        // Save to localStorage
        setStorageItem('accessToken', response.accessToken);
        setStorageItem('user', JSON.stringify(response.user));
        
        if (credentials.rememberMe && response.refreshToken) {
          setStorageItem('refreshToken', response.refreshToken);
        }

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.user,
            accessToken: response.accessToken,
          },
        });

        toast.success(`Welcome back, ${response.user.firstName}!`);
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await mockLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage
      removeStorageItem('accessToken');
      removeStorageItem('refreshToken');
      removeStorageItem('user');

      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const newToken = await mockRefreshToken();
      setStorageItem('accessToken', newToken);
      dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: newToken });
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  };

  // Update user function
  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
    
    if (state.user) {
      const updatedUser = { ...state.user, ...updates };
      setStorageItem('user', JSON.stringify(updatedUser));
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Role checking function
  const hasRole = (role: string): boolean => {
    return state.user?.roles.some(r => r.name === role) || false;
  };

  // Permission checking function
  const hasPermission = (permission: string): boolean => {
    return state.user?.permissions.some(p => p.name === permission) || false;
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    updateUser,
    clearError,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
