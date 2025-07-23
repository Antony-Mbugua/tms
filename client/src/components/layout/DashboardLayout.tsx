import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Users, FileText, DollarSign, Settings, Shield,
  Book, MessageCircle, BarChart3, LogOut, Menu, X,
  Bell, User, ChevronDown, Home, Database, Receipt,
  Building, Navigation, Activity, Lock, Monitor
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import ThemeToggle from '../ui/theme-toggle';
import UserProfileSettings from '../settings/UserProfileSettings';

const DashboardLayout: React.FC = () => {
  const { user, logout, hasRole, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New load assignment available', type: 'info', time: '2 min ago' },
    { id: 2, message: 'Truck AOL003 maintenance due', type: 'warning', time: '1 hour ago' },
    { id: 3, message: 'Invoice payment received', type: 'success', time: '3 hours ago' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Role-based navigation items
  const getNavigationItems = () => {
    const items = [];

    // Common dashboard
    items.push({
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: location.pathname === '/dashboard' || location.pathname.includes('/dashboard')
    });

    // Admin-specific items
    if (hasRole('admin')) {
      items.push(
        {
          name: 'User Management',
          href: '/dashboard/admin/users',
          icon: Users,
          current: location.pathname.includes('/users'),
          permission: 'user.view'
        },
        {
          name: 'System Settings',
          href: '/dashboard/admin/settings',
          icon: Settings,
          current: location.pathname.includes('/settings'),
          permission: 'system.settings'
        },
        {
          name: 'Security Center',
          href: '/dashboard/admin/security',
          icon: Shield,
          current: location.pathname.includes('/security'),
          permission: 'system.security'
        }
      );
    }

    // Dispatcher-specific items
    if (hasRole('dispatcher') || hasRole('admin')) {
      items.push(
        {
          name: 'Load Management',
          href: '/dashboard/dispatcher/loads',
          icon: Truck,
          current: location.pathname.includes('/loads'),
          permission: 'load.view'
        },
        {
          name: 'Brokers',
          href: '/dashboard/dispatcher/brokers',
          icon: Building,
          current: location.pathname.includes('/brokers'),
          permission: 'broker.view'
        },
        {
          name: 'Drivers',
          href: '/dashboard/dispatcher/drivers',
          icon: Navigation,
          current: location.pathname.includes('/drivers'),
          permission: 'user.view'
        }
      );
    }

    // Driver-specific items
    if (hasRole('driver') || hasRole('admin')) {
      items.push(
        {
          name: 'My Loads',
          href: '/dashboard/driver/loads',
          icon: Truck,
          current: location.pathname.includes('/driver/loads'),
          permission: 'load.view'
        },
        {
          name: 'Documents',
          href: '/dashboard/driver/documents',
          icon: FileText,
          current: location.pathname.includes('/documents'),
          permission: 'document.view'
        },
        {
          name: 'Payments',
          href: '/dashboard/driver/payments',
          icon: DollarSign,
          current: location.pathname.includes('/payments'),
          permission: 'expense.view'
        }
      );
    }

    // Accountant-specific items
    if (hasRole('accountant') || hasRole('admin')) {
      items.push(
        {
          name: 'Invoices',
          href: '/dashboard/accountant/invoices',
          icon: FileText,
          current: location.pathname.includes('/invoices'),
          permission: 'invoice.view'
        },
        {
          name: 'Expenses',
          href: '/dashboard/accountant/expenses',
          icon: Receipt,
          current: location.pathname.includes('/expenses'),
          permission: 'expense.view'
        },
        {
          name: 'Financial Reports',
          href: '/dashboard/accountant/reports',
          icon: BarChart3,
          current: location.pathname.includes('/reports'),
          permission: 'invoice.view'
        }
      );
    }

    // IT Support-specific items
    if (hasRole('it_support') || hasRole('admin')) {
      items.push(
        {
          name: 'System Monitor',
          href: '/dashboard/it-support/monitor',
          icon: Monitor,
          current: location.pathname.includes('/monitor'),
          permission: 'system.logs'
        },
        {
          name: 'Security Events',
          href: '/dashboard/it-support/security',
          icon: Shield,
          current: location.pathname.includes('/it-support/security'),
          permission: 'system.security'
        },
        {
          name: 'Audit Logs',
          href: '/dashboard/it-support/logs',
          icon: Activity,
          current: location.pathname.includes('/logs'),
          permission: 'system.logs'
        }
      );
    }

    // Training Dashboard Logic - only show if user has training access
    if (user?.hasTrainingAccess) {
      items.push({
        name: 'Training',
        href: '/dashboard/training',
        icon: Book,
        current: location.pathname.includes('/training'),
        permission: 'training.view'
      });
    }

    // Communication (available to all roles)
    items.push({
      name: 'Chat',
      href: '/dashboard/chat',
      icon: MessageCircle,
      current: location.pathname.includes('/chat'),
      permission: 'chat.view'
    });

    // Filter items based on permissions
    return items.filter(item => 
      !item.permission || hasPermission(item.permission)
    );
  };

  const navigationItems = getNavigationItems();

  const getUserRoleBadge = () => {
    if (!user?.roles || user.roles.length === 0) return null;
    
    const primaryRole = user.roles[0].name;
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      dispatcher: 'bg-blue-100 text-blue-800',
      driver: 'bg-green-100 text-green-800',
      accountant: 'bg-purple-100 text-purple-800',
      it_support: 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge className={roleColors[primaryRole as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
        {primaryRole.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 lg:hidden"
            >
              <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border shadow-lg"
              >
                <SidebarContent 
                  navigationItems={navigationItems}
                  user={user}
                  getUserRoleBadge={getUserRoleBadge}
                  handleLogout={handleLogout}
                  onClose={() => setIsSidebarOpen(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-card border-r border-border">
          <SidebarContent 
            navigationItems={navigationItems}
            user={user}
            getUserRoleBadge={getUserRoleBadge}
            handleLogout={handleLogout}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Top bar */}
          <header className="bg-background border-b border-border px-4 py-3 flex items-center justify-between lg:justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-md shadow-lg z-50"
                    >
                      <div className="p-3 border-b border-border">
                        <h3 className="font-medium text-foreground">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            No new notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div key={notification.id} className="p-3 border-b border-border hover:bg-muted/50">
                              <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.type === 'success' ? 'bg-green-500' :
                                  notification.type === 'warning' ? 'bg-yellow-500' :
                                  notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                }`} />
                                <div className="flex-1">
                                  <p className="text-sm text-foreground">{notification.message}</p>
                                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setNotifications([]);
                            setShowNotifications(false);
                          }}
                        >
                          Clear all
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">{user?.firstName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50"
                    >
                      <div className="p-3 border-b border-border">
                        <p className="font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <div className="mt-2">{getUserRoleBadge()}</div>
                      </div>
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowProfileSettings(true);
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile Settings
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogout();
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* User Profile Settings Modal */}
      <UserProfileSettings
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
      />
    </div>
  );
};

// Sidebar content component
interface SidebarContentProps {
  navigationItems: any[];
  user: any;
  getUserRoleBadge: () => React.ReactNode;
  handleLogout: () => void;
  onClose?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  navigationItems,
  user,
  getUserRoleBadge,
  handleLogout,
  onClose
}) => {
  const navigate = useNavigate();

  const handleNavigation = (href: string) => {
    navigate(href);
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo and user info */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">AOL TMS</h2>
            <p className="text-xs text-muted-foreground">Enterprise Edition</p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Welcome, {user?.firstName}!
          </p>
          {getUserRoleBadge()}
          {user?.mfaEnabled && (
            <div className="flex items-center space-x-1">
              <Lock className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">MFA Enabled</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => (
          <motion.button
            key={item.name}
            onClick={() => handleNavigation(item.href)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              item.current
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </motion.button>
        ))}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-border">
        <Card className="p-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">System Status</p>
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600">Online</span>
            </div>
          </div>
        </Card>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default DashboardLayout;
