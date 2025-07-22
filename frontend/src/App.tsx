import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LoginPage } from '@/components/auth/LoginPage'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdminDashboard } from '@/components/dashboards/AdminDashboard'
import { DispatcherDashboard } from '@/components/dashboards/DispatcherDashboard'
import { DriverDashboard } from '@/components/dashboards/DriverDashboard'
import { AccountantDashboard } from '@/components/dashboards/AccountantDashboard'
import { ITSupportDashboard } from '@/components/dashboards/ITSupportDashboard'
import { TrainingDashboard } from '@/components/dashboards/TrainingDashboard'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  
  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route 
          path="/" 
          element={<Navigate to={`/${user?.role}`} replace />} 
        />
        <Route 
          path="/admin" 
          element={
            user?.role === 'admin' ? <AdminDashboard /> : <Navigate to={`/${user?.role}`} />
          } 
        />
        <Route 
          path="/dispatcher" 
          element={
            user?.role === 'dispatcher' ? <DispatcherDashboard /> : <Navigate to={`/${user?.role}`} />
          } 
        />
        <Route 
          path="/driver" 
          element={
            user?.role === 'driver' ? <DriverDashboard /> : <Navigate to={`/${user?.role}`} />
          } 
        />
        <Route 
          path="/accountant" 
          element={
            user?.role === 'accountant' ? <AccountantDashboard /> : <Navigate to={`/${user?.role}`} />
          } 
        />
        <Route 
          path="/it_support" 
          element={
            user?.role === 'it_support' ? <ITSupportDashboard /> : <Navigate to={`/${user?.role}`} />
          } 
        />
        <Route 
          path="/training" 
          element={
            user?.hasTrainingAccess ? <TrainingDashboard /> : <Navigate to={`/${user?.role}`} />
          } 
        />
      </Routes>
    </DashboardLayout>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppRoutes />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
