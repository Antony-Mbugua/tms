import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import DatabaseStatusNotice from '@/components/debug/DatabaseStatusNotice'
import confetti from 'canvas-confetti'
import {
  Lock,
  Mail,
  Palette,
  Sun,
  Moon,
  Monitor,
  Eye,
  EyeOff,
  AlertCircle,
  Truck,
  Building2,
  Shield,
  Users,
  Globe,
  Package
} from 'lucide-react'

// Theme color options
const themeColors = [
  { name: 'blue', label: 'Professional Blue', class: 'bg-blue-600' },
  { name: 'slate', label: 'Corporate Slate', class: 'bg-slate-600' },
  { name: 'emerald', label: 'Success Green', class: 'bg-emerald-600' },
  { name: 'orange', label: 'Energy Orange', class: 'bg-orange-600' },
  { name: 'purple', label: 'Premium Purple', class: 'bg-purple-600' },
  { name: 'red', label: 'Alert Red', class: 'bg-red-600' },
  { name: 'teal', label: 'Professional Teal', class: 'bg-teal-600' },
  { name: 'indigo', label: 'Corporate Indigo', class: 'bg-indigo-600' }
] as const

const WelcomeAnimation = () => {
  const { themeColor } = useTheme()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const colors = {
      blue: ['#3b82f6', '#1d4ed8', '#1e40af'],
      slate: ['#475569', '#334155', '#1e293b'],
      emerald: ['#10b981', '#059669', '#047857'],
      orange: ['#f97316', '#ea580c', '#c2410c'],
      purple: ['#8b5cf6', '#7c3aed', '#6d28d9'],
      red: ['#ef4444', '#dc2626', '#b91c1c'],
      teal: ['#14b8a6', '#0d9488', '#0f766e'],
      indigo: ['#6366f1', '#4f46e5', '#4338ca']
    }

    const themeColors = colors[themeColor] || colors.blue

    const runConfetti = () => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: themeColors,
        shapes: ['square', 'circle'],
        scalar: 1.2
      })
    }

    // Initial confetti burst with welcome message
    const timer1 = setTimeout(() => {
      runConfetti()
      setShowWelcome(true)
    }, 1000)

    // Periodic gentle confetti
    const interval = setInterval(() => {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
        colors: themeColors,
        scalar: 0.8
      })
    }, 12000)

    return () => {
      clearTimeout(timer1)
      clearInterval(interval)
    }
  }, [themeColor])

  const getGradient = () => {
    switch (themeColor) {
      case 'emerald':
        return 'from-emerald-600 via-emerald-700 to-emerald-800'
      case 'orange':
        return 'from-orange-600 via-orange-700 to-orange-800'
      case 'purple':
        return 'from-purple-600 via-purple-700 to-purple-800'
      case 'slate':
        return 'from-slate-600 via-slate-700 to-slate-800'
      case 'red':
        return 'from-red-600 via-red-700 to-red-800'
      case 'teal':
        return 'from-teal-600 via-teal-700 to-teal-800'
      case 'indigo':
        return 'from-indigo-600 via-indigo-700 to-indigo-800'
      default:
        return 'from-blue-600 via-blue-700 to-blue-800'
    }
  }

  return (
    <div className={`relative h-full w-full bg-gradient-to-br ${getGradient()} overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className={"absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" width=\"32\" height=\"32\" fill=\"none\" stroke=\"%23ffffff\"%3e%3cpath d=\"m0 2 30 0\" stroke-width=\"1\"/%3e%3cpath d=\"m0 16 30 0\" stroke-width=\"1\"/%3e%3cpath d=\"m0 30 30 0\" stroke-width=\"1\"/%3e%3cpath d=\"m2 0 0 30\" stroke-width=\"1\"/%3e%3cpath d=\"m16 0 0 30\" stroke-width=\"1\"/%3e%3cpath d=\"m30 0 0 30\" stroke-width=\"1\"/%3e%3c/svg%3e')]"} />
      </div>

      {/* Content */}
      <div className="relative flex items-center justify-center h-full px-8">
        <div className="text-center text-white max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-12"
          >
            {/* Company Logo and Truck Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.5 
              }}
              className="flex items-center justify-center mb-8"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30">
                <Truck size={64} className="text-white" />
              </div>
            </motion.div>

            {/* Welcome Message */}
            <motion.h1 
              className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Welcome to
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-4xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                All Over Logistics
              </h2>
              <div className="text-2xl lg:text-3xl font-semibold text-white/90">
                Transportation Management System
              </div>
            </motion.div>

            <motion.p 
              className="text-xl lg:text-2xl text-white/80 mb-12 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Enterprise-Grade Logistics Management Platform
              <br />
              <span className="text-lg text-white/70">Streamline Operations • Optimize Routes • Maximize Efficiency</span>
            </motion.p>
          </motion.div>
          
          {/* Feature Icons */}
          <motion.div 
            className="flex justify-center space-x-12 mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            {[
              { icon: Globe, label: 'Global Reach' },
              { icon: Shield, label: 'Secure Platform' },
              { icon: Users, label: 'Team Collaboration' },
              { icon: Package, label: 'Smart Logistics' }
            ].map(({ icon: Icon, label }, index) => (
              <motion.div
                key={label}
                animate={{ 
                  y: [0, -15, 0],
                  rotateY: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  delay: index * 0.5,
                  ease: "easeInOut"
                }}
                className="flex flex-col items-center space-y-3"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/30">
                  <Icon size={28} className="text-white" />
                </div>
                <span className="text-sm text-white/80 font-medium">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

const ThemeCustomizer = () => {
  const { theme, setTheme, themeColor, setThemeColor } = useTheme()
  const [showPanel, setShowPanel] = useState(false)

  return (
    <div className="absolute top-6 right-6 z-50">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPanel(!showPanel)}
          className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 shadow-lg"
        >
          <Palette size={16} />
        </Button>
      </motion.div>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-80 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl"
          >
            <h3 className="text-white font-semibold mb-4">Customize Theme</h3>
            
            {/* Theme Mode */}
            <div className="mb-6">
              <p className="text-white/80 text-sm mb-3">Display Mode</p>
              <div className="flex space-x-2">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'Auto' }
                ].map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    variant={theme === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme(value as any)}
                    className={`flex-1 text-xs ${
                      theme === value 
                        ? 'bg-white text-gray-900' 
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <Icon size={12} className="mr-1" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <p className="text-white/80 text-sm mb-3">Brand Color</p>
              <div className="grid grid-cols-4 gap-3">
                {themeColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setThemeColor(color.name as any)}
                    className={`w-12 h-12 rounded-xl ${color.class} ${
                      themeColor === color.name 
                        ? 'ring-4 ring-white ring-offset-2 ring-offset-transparent scale-110' 
                        : 'hover:scale-105 shadow-lg'
                    } transition-all duration-200`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ForgotPasswordForm = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    if (!email) {
      setError('Please enter your email address')
      setIsLoading(false)
      return
    }

    try {
      // Use the API service to request password reset
      const { apiService } = await import('@/services/api')
      const response = await apiService.forgotPassword(email)
      
      if (response.success) {
        setMessage(response.message || 'Password reset link sent to your email address')
      } else {
        setError(response.error || 'Failed to send password reset email')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Reset Password
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email to receive reset instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="flex items-center gap-2 text-gray-700 font-medium">
                <Mail size={16} />
                Email Address
              </Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                autoComplete="email"
              />
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-600 text-sm text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200"
              >
                {message}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-600 text-sm text-center p-4 bg-red-50 rounded-xl border border-red-200"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                />
              ) : (
                'Send Reset Link'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full text-gray-600 hover:text-gray-900"
            >
              ← Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const EnterpriseLoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      await login({ email, password })
      // Remember user preference
      if (rememberMe) {
        localStorage.setItem('aol_remember_email', email)
      } else {
        localStorage.removeItem('aol_remember_email')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  // Pre-fill email if remembered
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('aol_remember_email')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  return (
    <div className="min-h-screen flex relative">
      {/* Database Status Notice */}
      <DatabaseStatusNotice />
      
      {/* Theme Customizer */}
      <ThemeCustomizer />

      {/* Left side - Welcome Animation */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <WelcomeAnimation />
      </motion.div>

      {/* Right side - Login Form */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.div
          className="w-full max-w-md"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {!showForgotPassword ? (
              <motion.div
                key="login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="w-full bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                  <CardHeader className="text-center pb-6">
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-blue-600 rounded-2xl p-3 shadow-lg">
                          <Building2 size={32} className="text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Enterprise Portal
                      </CardTitle>
                      <CardDescription className="text-lg mt-2 text-gray-600">
                        Secure access to your TMS dashboard
                      </CardDescription>
                    </motion.div>
                  </CardHeader>
                  
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 font-medium">
                          <Mail size={16} />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your corporate email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          autoComplete="email"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="password" className="flex items-center gap-2 text-gray-700 font-medium">
                          <Lock size={16} />
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.0 }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            id="remember"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                            Remember me
                          </Label>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          Forgot password?
                        </button>
                      </motion.div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-red-600 text-sm p-4 bg-red-50 rounded-xl border border-red-200"
                        >
                          <AlertCircle size={16} />
                          {error}
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.1 }}
                      >
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg"
                        >
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                            />
                          ) : (
                            'Sign In to Dashboard'
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default EnterpriseLoginPage
