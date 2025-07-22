import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Truck, Shield, Lock, Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';

import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

// Validation schema
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

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginPageProps {
  className?: string;
}

const EnterpriseLoginPage: React.FC<LoginPageProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error: authError } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);
  
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors,
    watch,
    setValue
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      mfaToken: ''
    }
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  // Confetti animation setup
  useEffect(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Confetti particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
      gravity: number;
    }> = [];

    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#FFB347', '#87CEEB', '#98FB98', '#F0E68C'
    ];

    // Create confetti particles
    const createConfetti = (x: number, y: number, count: number = 50) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 100,
          y: y + (Math.random() - 0.5) * 50,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8 - 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 6 + 2,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          gravity: 0.1 + Math.random() * 0.1
        });
      }
    };

    // Animate confetti
    const animateConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        // Update physics
        particle.vx *= 0.98;
        particle.vy += particle.gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;

        // Remove particles that are off screen
        if (
          particle.y > canvas.height + 10 ||
          particle.x < -10 ||
          particle.x > canvas.width + 10
        ) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.fillStyle = particle.color;
        
        // Draw as rectangle (confetti shape)
        ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
        
        ctx.restore();
      }

      if (particles.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animateConfetti);
      }
    };

    // Trigger confetti periodically
    const confettiInterval = setInterval(() => {
      // Create confetti from random positions on the left side
      const leftSide = canvas.width * 0.5; // Left half of screen
      const randomY = Math.random() * canvas.height * 0.8;
      createConfetti(Math.random() * leftSide, randomY, 15);
      
      if (particles.length > 0) {
        animateConfetti();
      }
    }, 2000);

    // Initial confetti burst
    setTimeout(() => {
      createConfetti(canvas.width * 0.25, canvas.height * 0.3, 30);
      createConfetti(canvas.width * 0.15, canvas.height * 0.6, 25);
      animateConfetti();
    }, 1000);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(confettiInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle lockout countdown
  useEffect(() => {
    if (accountLocked && lockoutTime) {
      const interval = setInterval(() => {
        const now = new Date();
        if (now >= lockoutTime) {
          setAccountLocked(false);
          setLockoutTime(null);
          setLoginAttempts(0);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [accountLocked, lockoutTime]);

  // Handle login submission
  const onSubmit = async (data: LoginFormData) => {
    if (accountLocked) {
      toast.error('Account is temporarily locked. Please wait before trying again.');
      return;
    }

    setIsSubmitting(true);
    clearErrors();

    try {
      const result = await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        ...(showMFA && data.mfaToken && { mfaToken: data.mfaToken })
      });

      if (result.success) {
        // Success confetti
        if (confettiCanvasRef.current) {
          const canvas = confettiCanvasRef.current;
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
          });
        }

        toast.success('Welcome back! Login successful.');
        
        // Redirect to intended page or dashboard
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else if (result.mfaRequired) {
        setShowMFA(true);
        toast.info('Please enter your MFA token to complete login.');
      } else {
        setLoginAttempts(prev => prev + 1);
        if (loginAttempts >= 4) {
          setAccountLocked(true);
          setLockoutTime(new Date(Date.now() + 30 * 60 * 1000)); // 30 minutes
          toast.error('Too many failed attempts. Account locked for 30 minutes.');
        } else {
          toast.error(result.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.status === 423) {
        setAccountLocked(true);
        const lockedUntil = error.response.data?.lockedUntil;
        if (lockedUntil) {
          setLockoutTime(new Date(lockedUntil));
        }
        toast.error('Account is temporarily locked due to security measures.');
      } else if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait before trying again.');
      } else {
        setError('root', {
          type: 'manual',
          message: error.response?.data?.error || 'An unexpected error occurred. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRemainingLockoutTime = (): string => {
    if (!lockoutTime) return '';
    
    const now = new Date();
    const diff = lockoutTime.getTime() - now.getTime();
    
    if (diff <= 0) return '';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden', className)}>
      {/* Confetti Canvas */}
      <canvas
        ref={confettiCanvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ position: 'fixed' }}
      />
      
      {/* Background Pattern */}
      <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"} />
      
      <div className="flex min-h-screen">
        {/* Left Side - Branding & Animation */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative">
          <div className="flex flex-col justify-center items-center w-full p-12 relative z-20">
            {/* Logo and Branding */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  animate={{ 
                    rotateY: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
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
              </div>
              
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
                  🎉 Welcome to AOL TMS — Revolutionizing Logistics.
                </p>
                
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    <Shield className="w-3 h-3 mr-1" />
                    Zero Trust Security
                  </Badge>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                    <Lock className="w-3 h-3 mr-1" />
                    Enterprise Grade
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    Real-time Tracking
                  </Badge>
                </div>
              </motion.div>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg"
            >
              {[
                { icon: Shield, title: 'Multi-Factor Auth', desc: 'Enhanced Security' },
                { icon: Truck, title: 'Fleet Management', desc: 'Real-time Tracking' },
                { icon: CheckCircle2, title: 'Document OCR', desc: 'AI-Powered Processing' },
                { icon: Lock, title: 'Role-Based Access', desc: 'Granular Permissions' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                  className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
                >
                  <feature.icon className="w-6 h-6 text-blue-400 mb-2" />
                  <h3 className="text-white font-medium text-sm">{feature.title}</h3>
                  <p className="text-gray-400 text-xs">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <CardHeader className="space-y-2 text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Sign in to your AOL TMS account to continue
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Account Locked Alert */}
                <AnimatePresence>
                  {accountLocked && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          Account temporarily locked. Time remaining: {getRemainingLockoutTime()}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Alert */}
                <AnimatePresence>
                  {errors.root && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          {errors.root.message}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        className={cn(
                          "pl-10 h-12",
                          errors.email && "border-red-300 focus:border-red-500"
                        )}
                        {...register('email')}
                        disabled={isSubmitting || accountLocked}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className={cn(
                          "pl-10 pr-10 h-12",
                          errors.password && "border-red-300 focus:border-red-500"
                        )}
                        {...register('password')}
                        disabled={isSubmitting || accountLocked}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                        disabled={isSubmitting || accountLocked}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  {/* MFA Token Field */}
                  <AnimatePresence>
                    {showMFA && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="mfaToken" className="text-sm font-medium text-gray-700">
                          MFA Token
                        </Label>
                        <Input
                          id="mfaToken"
                          type="text"
                          placeholder="Enter 6-digit MFA token"
                          maxLength={6}
                          className={cn(
                            "h-12 text-center text-lg tracking-widest",
                            errors.mfaToken && "border-red-300 focus:border-red-500"
                          )}
                          {...register('mfaToken')}
                          disabled={isSubmitting || accountLocked}
                        />
                        {errors.mfaToken && (
                          <p className="text-sm text-red-600">{errors.mfaToken.message}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Remember Me */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      {...register('rememberMe')}
                      disabled={isSubmitting || accountLocked}
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-sm text-gray-600 cursor-pointer"
                    >
                      Remember me for 7 days
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                    disabled={isSubmitting || accountLocked || !isValid}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  {/* Login Attempts Warning */}
                  {loginAttempts > 0 && loginAttempts < 5 && (
                    <div className="text-center text-sm text-amber-600">
                      {5 - loginAttempts} attempt{5 - loginAttempts !== 1 ? 's' : ''} remaining before account lock
                    </div>
                  )}
                </form>

                {/* Additional Links */}
                <div className="text-center space-y-2 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Having trouble signing in?
                  </p>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => toast.info('Please contact your system administrator for password reset.')}
                  >
                    Contact System Administrator
                  </button>
                </div>

                {/* Version Info */}
                <div className="text-center text-xs text-gray-400 pt-2">
                  AOL TMS Enterprise v2.0.0 • Zero Trust Security
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseLoginPage;
