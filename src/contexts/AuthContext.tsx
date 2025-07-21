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

// Mock user data for demo
const mockUsers: Record<string, User> = {
  'admin@aol.com': {
    id: '1',
    email: 'admin@aol.com',
    firstName: 'John',
    lastName: 'Admin',
    role: 'admin',
    isOnline: true,
    hasTrainingAccess: true,
    mfaEnabled: false,
    createdAt: new Date(),
    lastLogin: new Date()
  },
  'dispatcher@aol.com': {
    id: '2',
    email: 'dispatcher@aol.com',
    firstName: 'Sarah',
    lastName: 'Dispatcher',
    role: 'dispatcher',
    isOnline: true,
    hasTrainingAccess: true,
    mfaEnabled: false,
    createdAt: new Date()
  },
  'driver@aol.com': {
    id: '3',
    email: 'driver@aol.com',
    firstName: 'Mike',
    lastName: 'Driver',
    role: 'driver',
    isOnline: false,
    hasTrainingAccess: false,
    mfaEnabled: false,
    createdAt: new Date()
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true
  })

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('aol_user')
    if (savedUser) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) })
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user = mockUsers[credentials.email]
    if (user && credentials.password === 'password123') {
      const updatedUser = { ...user, lastLogin: new Date() }
      localStorage.setItem('aol_user', JSON.stringify(updatedUser))
      dispatch({ type: 'SET_USER', payload: updatedUser })
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
      throw new Error('Invalid credentials')
    }
  }

  const logout = () => {
    localStorage.removeItem('aol_user')
    dispatch({ type: 'LOGOUT' })
  }

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates })
    if (state.user) {
      const updatedUser = { ...state.user, ...updates }
      localStorage.setItem('aol_user', JSON.stringify(updatedUser))
    }
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
