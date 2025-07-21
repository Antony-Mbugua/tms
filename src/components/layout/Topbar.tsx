import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Menu,
  User,
  LogOut,
  Settings,
  Moon,
  Sun,
  Circle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { User as UserType } from '@/types/user'
import { Button } from '@/components/ui/button'

interface TopbarProps {
  user: UserType | null
  onMenuClick: () => void
}

const NotificationDropdown: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ 
  isOpen, 
  onClose 
}) => {
  const notifications = [
    { id: 1, title: 'New Trip Assigned', message: 'Route #1234 assigned to Driver Mike', time: '5m ago', unread: true },
    { id: 2, title: 'Payment Received', message: '$2,500 payment processed', time: '1h ago', unread: true },
    { id: 3, title: 'Maintenance Due', message: 'Truck #456 requires service', time: '2h ago', unread: false },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50"
        >
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-primary' : 'bg-muted'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-muted-foreground text-xs mt-1">{notification.message}</p>
                    <p className="text-muted-foreground text-xs mt-1">{notification.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="p-4 border-t border-border">
            <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
              View All Notifications
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const UserDropdown: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onLogout: () => void;
}> = ({ isOpen, onClose, user, onLogout }) => {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl z-50"
        >
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <User size={20} className="text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-muted-foreground text-sm capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-accent transition-colors"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span className="text-sm">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-accent transition-colors">
              <Settings size={16} />
              <span className="text-sm">Settings</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
            >
              <LogOut size={16} />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const Topbar: React.FC<TopbarProps> = ({ user, onMenuClick }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { logout } = useAuth()

  const unreadCount = 2 // Mock unread count

  return (
    <motion.header 
      className="h-16 bg-card border-b border-border px-6 flex items-center justify-between"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu size={20} />
        </Button>
        
        <div>
          <h2 className="font-semibold text-lg capitalize">
            {user?.role?.replace('_', ' ')} Dashboard
          </h2>
          <p className="text-muted-foreground text-sm">
            Welcome back, {user?.firstName}!
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Status indicator */}
        <div className="flex items-center space-x-2">
          <Circle 
            size={8} 
            className={`fill-current ${user?.isOnline ? 'text-green-500' : 'text-gray-400'}`} 
          />
          <span className="text-sm text-muted-foreground">
            {user?.isOnline ? 'Online' : 'Away'}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {unreadCount}
              </motion.span>
            )}
          </Button>

          <NotificationDropdown 
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        </div>

        {/* User menu */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 px-3"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User size={16} className="text-primary-foreground" />
            </div>
            <span className="hidden md:block font-medium">
              {user?.firstName}
            </span>
          </Button>

          <UserDropdown
            isOpen={userMenuOpen}
            onClose={() => setUserMenuOpen(false)}
            user={user}
            onLogout={logout}
          />
        </div>
      </div>
    </motion.header>
  )
}
