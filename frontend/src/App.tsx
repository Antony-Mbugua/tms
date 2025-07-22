import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/ui/LoadingScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy load pages for better performance
const EnterpriseLoginPage = React.lazy(() => import('./components/auth/EnterpriseLoginPage'));
const DashboardLayout = React.lazy(() => import('./components/layout/DashboardLayout'));
const AdminDashboard = React.lazy(() => import('./components/dashboards/AdminDashboard'));
const DispatcherDashboard = React.lazy(() => import('./components/dashboards/DispatcherDashboard'));
const DriverDashboard = React.lazy(() => import('./components/dashboards/DriverDashboard'));
const AccountantDashboard = React.lazy(() => import('./components/dashboards/AccountantDashboard'));
const ITSupportDashboard = React.lazy(() => import('./components/dashboards/ITSupportDashboard'));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="aol-tms-theme">
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            <AnimatePresence mode="wait">
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Public Routes */}
                  <Route 
                    path="/login" 
                    element={
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <EnterpriseLoginPage />
                      </motion.div>
                    } 
                  />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                    {/* Role-based dashboard routes */}
                    <Route 
                      path="admin" 
                      element={
                        <ProtectedRoute requiredRoles={['admin']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="dispatcher" 
                      element={
                        <ProtectedRoute requiredRoles={['dispatcher', 'admin']}>
                          <DispatcherDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="driver" 
                      element={
                        <ProtectedRoute requiredRoles={['driver', 'admin']}>
                          <DriverDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="accountant" 
                      element={
                        <ProtectedRoute requiredRoles={['accountant', 'admin']}>
                          <AccountantDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="it-support" 
                      element={
                        <ProtectedRoute requiredRoles={['it_support', 'admin']}>
                          <ITSupportDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Default dashboard redirect based on role */}
                    <Route 
                      index 
                      element={<Navigate to="/dashboard/admin" replace />} 
                    />
                  </Route>
                  
                  {/* Default redirect */}
                  <Route 
                    path="/" 
                    element={<Navigate to="/login" replace />} 
                  />
                  
                  {/* Catch all route */}
                  <Route 
                    path="*" 
                    element={
                      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                        <div className="text-center">
                          <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
                          <p className="text-gray-300 mb-8">The page you're looking for doesn't exist.</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.href = '/login'}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                          >
                            Go to Login
                          </motion.button>
                        </div>
                      </div>
                    } 
                  />
                </Routes>
              </Suspense>
            </AnimatePresence>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
