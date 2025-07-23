import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Eye, 
  EyeOff, 
  Truck, 
  Shield, 
  Lock, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ArrowLeft,
  Key,
  Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// Validation schemas
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
  rememberMe: z.boolean().default(false),
  mfaToken: z
    .string()
    .optional()
    .refine((val) => !val || (val.length === 6 && /^\d+$/.test(val)), {
      message: 'MFA token must be 6 digits'
    })
});

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

type AuthFlow = 'login' | 'forgot-password' | 'reset-password' | 'mfa-required' | 'contact-admin';

interface LoginPageProps {
  className?: string;
}

const EnterpriseLogin: React.FC<LoginPageProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error: authError } = useAuth();
  
  const [authFlow, setAuthFlow] = useState<AuthFlow>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Initialize form for each flow
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      mfaToken: ''
    }
  });

  const forgotForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const resetForm = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: '', newPassword: '', confirmPassword: '' }
  });

  // Check for reset token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const flow = urlParams.get('flow');
    
    if (token && flow === 'reset') {
      setResetToken(token);
      setAuthFlow('reset-password');
      resetForm.setValue('token', token);
    }
  }, [location.search, resetForm]);

  // Confetti effect on successful actions
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Handle login submission
  const handleLogin = async (data: LoginFormData) => {
    try {
      const result = await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        mfaToken: data.mfaToken
      });

      if (result.requiresMfa) {
        setShowMfaInput(true);
        setAuthFlow('mfa-required');
        return;
      }

      if (result.success) {
        triggerConfetti();
        toast.success('Welcome back!');
        
        // Redirect based on role
        const redirectTo = location.state?.from?.pathname || `/dashboard/${result.user.role}`;
        navigate(redirectTo, { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (data: ForgotPasswordData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmailSent(true);
      toast.success('Reset instructions sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    }
  };

  // Handle password reset
  const handleResetPassword = async (data: ResetPasswordData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      triggerConfetti();
      toast.success('Password reset successfully!');
      setAuthFlow('login');
      navigate('/login', { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    }
  };

  // Handle contact admin
  const handleContactAdmin = () => {
    // Open contact form or support modal
    toast.info('Contact form opened');
  };

  const renderAuthFlow = () => {
    switch (authFlow) {
      case 'forgot-password':
        return (
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Key className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Forgot Password?
              </CardTitle>
              <CardDescription className="text-gray-600">
                Enter your email address and we'll send you a reset link
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!emailSent ? (
                <form onSubmit={forgotForm.handleSubmit(handleForgotPassword)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="Enter your email address"
                        className="pl-10"
                        {...forgotForm.register('email')}
                      />
                    </div>
                    {forgotForm.formState.errors.email && (
                      <p className="text-sm text-red-600">
                        {forgotForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Reset Link
                        </>
                      )}
                    </Button>

                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => setAuthFlow('login')}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
                    <p className="text-gray-600 mt-2">
                      We've sent password reset instructions to your email address.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setAuthFlow('login')}
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'reset-password':
        return (
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Reset Password
              </CardTitle>
              <CardDescription className="text-gray-600">
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      className="pl-10 pr-10"
                      {...resetForm.register('newPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {resetForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-600">
                      {resetForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      className="pl-10"
                      {...resetForm.register('confirmPassword')}
                    />
                  </div>
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case 'mfa-required':
        return (
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-gray-600">
                Please enter the 6-digit code from your authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="mfa-token">Authentication Code</Label>
                  <Input
                    id="mfa-token"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    {...loginForm.register('mfaToken')}
                    autoComplete="one-time-code"
                  />
                  {loginForm.formState.errors.mfaToken && (
                    <p className="text-sm text-red-600">
                      {loginForm.formState.errors.mfaToken.message}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </Button>

                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => {
                      setAuthFlow('login');
                      setShowMfaInput(false);
                      loginForm.reset();
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );

      default: // login
        return (
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Welcome
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your AOL TMS account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authError && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {authError}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      {...loginForm.register('email')}
                      autoComplete="email"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-600">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      {...loginForm.register('password')}
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-600">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember-me" 
                      {...loginForm.register('rememberMe')}
                    />
                    <Label htmlFor="remember-me" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-blue-600 hover:text-blue-800 p-0"
                    onClick={() => setAuthFlow('forgot-password')}
                  >
                    Forgot Password?
                  </Button>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-gray-600 hover:text-gray-800"
                    onClick={handleContactAdmin}
                  >
                    Need help? Contact System Admin
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className={cn("min-h-screen flex", className)}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-12 w-full">
          {/* Logo and Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut"
            }}
            className="mb-8"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotateY: [0, 180, 360]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <Truck className="w-16 h-16 text-blue-400 drop-shadow-lg" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
              >
                <Shield className="w-3 h-3 text-white" />
              </motion.div>
            </motion.div>
          </motion.div>
          
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 tracking-tight">
            AOL Transport
          </h1>
          <h2 className="text-2xl xl:text-3xl font-semibold text-blue-300 mb-6">
            Management System
          </h2>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="space-y-4"
          >
            <p className="text-xl text-gray-300 font-medium flex items-center justify-center gap-2">
              🎉 Welcome to AOL TMS
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={authFlow}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderAuthFlow()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default EnterpriseLogin;
