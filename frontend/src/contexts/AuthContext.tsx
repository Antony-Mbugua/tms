import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { User, AuthState, LoginCredentials, UserRole } from '@/types/user'
import { apiService } from '@/services/api'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'LOGOUT' }

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      }
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false
      }
    default:
      return state
  }
}

// Helper function to transform API user data to frontend User type
const transformApiUser = (apiUser: any): User => ({
  id: apiUser.id.toString(),
  email: apiUser.email,
  firstName: apiUser.firstName || apiUser.first_name,
  lastName: apiUser.lastName || apiUser.last_name,
  role: apiUser.role as UserRole,
  avatar: apiUser.avatar_url,
  isOnline: apiUser.isOnline || apiUser.is_online || false,
  hasTrainingAccess: apiUser.hasTrainingAccess || apiUser.has_training_access || false,
  mfaEnabled: apiUser.mfaEnabled || apiUser.mfa_enabled || false,
  createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : new Date(),
  lastLogin: apiUser.lastLogin ? new Date(apiUser.lastLogin) : undefined
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true
  })

  useEffect(() => {
    // Check for existing session via API
    const checkExistingSession = async () => {
      const token = localStorage.getItem('aol_token')
      if (token) {
        try {
          const response = await apiService.verifyToken()
          if (response.success && response.user) {
            const user = transformApiUser(response.user)
            dispatch({ type: 'SET_USER', payload: user })
          } else {
            // Invalid token, clear it
            localStorage.removeItem('aol_token')
            dispatch({ type: 'SET_LOADING', payload: false })
          }
        } catch (error) {
          console.error('Token verification failed:', error)
          localStorage.removeItem('aol_token')
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkExistingSession()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const response = await apiService.login(credentials)

      if (response.success && response.user) {
        const user = transformApiUser(response.user)
        dispatch({ type: 'SET_USER', payload: user })
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
        throw new Error(response.error || 'Login failed')
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch({ type: 'LOGOUT' })
    }
  }

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates })
    // Note: In a real app, you'd want to sync this with the backend
    // For now, just update the local state
  }

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
