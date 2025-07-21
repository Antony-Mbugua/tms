import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Sparkles, 
  Lock, 
  Mail, 
  Zap, 
  Palette,
  Sun,
  Moon,
  Monitor,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react'

// Theme color options
const themeColors = [
  { name: 'blue', label: 'AOL Blue', class: 'bg-blue-500' },
  { name: 'green', label: 'Success Green', class: 'bg-green-500' },
  { name: 'orange', label: 'Energy Orange', class: 'bg-orange-500' },
  { name: 'purple', label: 'Premium Purple', class: 'bg-purple-500' },
  { name: 'red', label: 'Alert Red', class: 'bg-red-500' },
  { name: 'teal', label: 'Professional Teal', class: 'bg-teal-500' },
  { name: 'indigo', label: 'Corporate Indigo', class: 'bg-indigo-500' },
  { name: 'pink', label: 'Creative Pink', class: 'bg-pink-500' }
] as const

const CelebrationAnimation = () => {
  const { themeColor } = useTheme()
  
  const getGradients = () => {
    switch (themeColor) {
      case 'green':
        return [
          "linear-gradient(135deg, #10b981 0%, #065f46 100%)",
          "linear-gradient(135deg, #34d399 0%, #047857 100%)",
          "linear-gradient(135deg, #6ee7b7 0%, #059669 100%)",
        ]
      case 'orange':
        return [
          "linear-gradient(135deg, #f97316 0%, #9a3412 100%)",
          "linear-gradient(135deg, #fb923c 0%, #c2410c 100%)",
          "linear-gradient(135deg, #fdba74 0%, #ea580c 100%)",
        ]
      case 'purple':
        return [
          "linear-gradient(135deg, #8b5cf6 0%, #581c87 100%)",
          "linear-gradient(135deg, #a78bfa 0%, #6b21a8 100%)",
          "linear-gradient(135deg, #c4b5fd 0%, #7c3aed 100%)",
        ]
      default:
        return [
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        ]
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: getGradients()
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      
      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
            y: (typeof window !== 'undefined' ? window.innerHeight : 600) + 50,
            scale: 0,
            rotate: 0
          }}
          animate={{
            y: -50,
            scale: [0, 1, 0],
            rotate: 360,
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800)
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        >
          <Sparkles className="text-white/70" size={Math.random() * 20 + 10} />
        </motion.div>
      ))}
      
      {/* Welcome content */}
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-8"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
              className="text-6xl mb-4"
            >
              🚚
            </motion.div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Welcome to
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                AOL TMS
              </span>
            </h1>
            <p className="text-xl lg:text-2xl opacity-90 font-medium">
              Efficient Transportation Management
            </p>
          </motion.div>
          
          {/* Animated icons */}
          <motion.div 
            className="flex justify-center space-x-8 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {[Zap, Lock, Sparkles].map((Icon, index) => (
              <motion.div
                key={index}
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: index * 0.3 
                }}
              >
                <Icon size={32} className="text-white/80" />
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
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="absolute top-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="glassmorphism border-white/20 text-white hover:bg-white/10"
        >
          <Palette size={16} />
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-12 w-64 glassmorphism rounded-2xl p-4 border border-white/20"
            >
              <h3 className="text-white font-semibold mb-3">Customize Theme</h3>
              
              {/* Theme Mode */}
              <div className="mb-4">
                <Label className="text-white/80 text-xs mb-2 block">Mode</Label>
                <div className="flex space-x-2">
                  {[
                    { value: 'light', icon: Sun, label: 'Light' },
                    { value: 'dark', icon: Moon, label: 'Dark' },
                    { value: 'system', icon: Monitor, label: 'System' }
                  ].map(({ value, icon: Icon, label }) => (
                    <Button
                      key={value}
                      variant={theme === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme(value as any)}
                      className="flex-1 text-xs"
                    >
                      <Icon size={12} className="mr-1" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <Label className="text-white/80 text-xs mb-2 block">Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {themeColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setThemeColor(color.name as any)}
                      className={`w-8 h-8 rounded-lg ${color.class} ${
                        themeColor === color.name 
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' 
                          : 'hover:scale-110'
                      } transition-all duration-200`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
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
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError('')

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
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription className="text-base">
          Enter your email address to receive a password reset link
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="flex items-center gap-2">
              <Mail size={16} />
              Email Address
            </Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              required
            />
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-600 text-sm text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl"
            >
              {message}
            </motion.div>
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-lg font-semibold"
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
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </form>
      </CardContent>
    </motion.div>
  )
}

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError('')
    
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

  // Load remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('aol_remember_email')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  return (
    <div className="min-h-screen flex relative">
      {/* Theme Customizer */}
      <ThemeCustomizer />

      {/* Left side - Celebration Animation */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <CelebrationAnimation />
      </motion.div>

      {/* Right side - Login Form */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background"
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
          <Card className="glassmorphism shadow-2xl border-2">
            <AnimatePresence mode="wait">
              {!showForgotPassword ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CardHeader className="text-center pb-8">
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Sign In
                      </CardTitle>
                      <CardDescription className="text-lg mt-2">
                        Access your TMS dashboard
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
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail size={16} />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12"
                          autoComplete="email"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="password" className="flex items-center gap-2">
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
                            className="h-12 pr-12"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                            className="rounded border-input"
                          />
                          <Label htmlFor="remember" className="text-sm cursor-pointer">
                            Remember me
                          </Label>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      </motion.div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-xl"
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
                          className="w-full h-12 text-lg font-semibold"
                        >
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                            />
                          ) : (
                            'Sign In'
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </motion.div>
              ) : (
                <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
