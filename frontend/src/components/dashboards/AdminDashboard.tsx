import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Truck, Users, FileText, DollarSign, Shield, Activity,
  UserPlus, Settings, Upload, Download, Database, Lock,
  TrendingUp, AlertTriangle, CheckCircle, Clock,
  BarChart3, PieChart, LineChart, MapPin, Bell, Edit, Trash2,
  Eye, EyeOff, Plus, RefreshCw, Search, Filter, MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({});
  const [mfaStatus, setMfaStatus] = useState({});
  const [securityEvents, setSecurityEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'driver',
    hasTrainingAccess: false
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [notifications, setNotifications] = useState([]);

  const kpis = [
    {
      title: 'Active Loads',
      value: '24',
      change: '+12%',
      changeType: 'positive' as const,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Currently in transit'
    },
    {
      title: 'Fleet Size',
      value: '15',
      change: '+2',
      changeType: 'positive' as const,
      icon: Truck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Total active trucks'
    },
    {
      title: 'Active Drivers',
      value: '12',
      change: '0',
      changeType: 'neutral' as const,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Drivers on duty'
    },
    {
      title: 'Monthly Revenue',
      value: '$85,420',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'This month\'s earnings'
    },
    {
      title: 'Trip Volume',
      value: '156',
      change: '+15%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Completed trips'
    },
    {
      title: 'Load Completion Rate',
      value: '94.2%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      description: 'On-time delivery rate'
    }
  ];

  const recentActivity = [
    { type: 'load', message: 'New load AOL-2024-001 created by Sarah Johnson', time: '5 minutes ago', priority: 'normal' },
    { type: 'user', message: 'New driver account created: Carlos Martinez', time: '15 minutes ago', priority: 'normal' },
    { type: 'truck', message: 'Truck AOL005 completed maintenance inspection', time: '1 hour ago', priority: 'low' },
    { type: 'training', message: 'Driver John Smith completed safety training module', time: '2 hours ago', priority: 'normal' },
    { type: 'security', message: 'MFA enabled for user Jennifer Wilson', time: '3 hours ago', priority: 'high' },
    { type: 'invoice', message: 'Invoice INV-2024-003 sent to Express Logistics', time: '4 hours ago', priority: 'normal' }
  ];

  const systemAlerts = [
    { type: 'warning', message: 'Truck AOL003 due for maintenance in 2 days', action: 'Schedule' },
    { type: 'info', message: '3 drivers need to complete monthly training', action: 'Notify' },
    { type: 'error', message: '2 failed login attempts from suspicious IP', action: 'Review' }
  ];

  const managementActions = [
    {
      title: 'User Management',
      description: 'Add, edit, or remove user accounts and assign roles',
      icon: UserPlus,
      color: 'blue',
      actions: ['Create User', 'Manage Roles', 'Bulk Import']
    },
    {
      title: 'Rate Confirmations',
      description: 'Upload and manage rate confirmation documents',
      icon: Upload,
      color: 'green',
      actions: ['Upload Documents', 'OCR Processing', 'Review Queue']
    },
    {
      title: 'Training Modules',
      description: 'Create and manage training content for drivers',
      icon: FileText,
      color: 'purple',
      actions: ['Upload Module', 'Assign Training', 'Progress Reports']
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      icon: Settings,
      color: 'orange',
      actions: ['Security Settings', 'Email Templates', 'Chat Config']
    },
    {
      title: 'MFA Management',
      description: 'Enable/disable multi-factor authentication globally',
      icon: Lock,
      color: 'red',
      actions: ['Global MFA', 'User MFA', 'Backup Codes']
    },
    {
      title: 'Data Management',
      description: 'Database backups and system maintenance',
      icon: Database,
      color: 'indigo',
      actions: ['Backup Database', 'Clean Logs', 'System Health']
    }
  ];

  // Load data when tabs change
  useEffect(() => {
    const loadTabData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case 'users':
            // Simulate API call
            setTimeout(() => {
              setUsers([
                { id: 1, firstName: 'John', lastName: 'Smith', email: 'john.smith@aoltms.com', role: 'driver', status: 'active', hasTrainingAccess: true, mfaEnabled: false },
                { id: 2, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@aoltms.com', role: 'dispatcher', status: 'active', hasTrainingAccess: true, mfaEnabled: true }
              ]);
              setLoading(false);
            }, 500);
            break;
          case 'system':
            // Load system settings
            setTimeout(() => {
              setSettings({ tokenExpiry: '24h', refreshTokenExpiry: '7d' });
              setLoading(false);
            }, 500);
            break;
          case 'security':
            // Load security data
            setTimeout(() => {
              setMfaStatus({ globalEnabled: false, usersWithMfa: 8 });
              setLoading(false);
            }, 500);
            break;
          default:
            setLoading(false);
        }
      } catch (error) {
        console.error('Error loading tab data:', error);
        setLoading(false);
      }
    };

    if (activeTab !== 'overview') {
      loadTabData();
    }
  }, [activeTab]);

  const handleCreateUser = async () => {
    try {
      // Simulate API call
      console.log('Creating user:', newUser);
      setShowCreateUserModal(false);
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'driver', hasTrainingAccess: false });
      addNotification('User created successfully', 'success');
      // Refresh users list
    } catch (error) {
      console.error('Error creating user:', error);
      addNotification('Failed to create user', 'error');
    }
  };

  const handleActionClick = (actionType: string, actionName: string) => {
    switch (actionType) {
      case 'User Management':
        if (actionName === 'Create User') {
          setShowCreateUserModal(true);
        } else if (actionName === 'Manage Roles') {
          addNotification('Role management opened', 'info');
        } else if (actionName === 'Bulk Import') {
          setUploadType('users');
          setShowUploadModal(true);
        }
        break;
      case 'Rate Confirmations':
        if (actionName === 'Upload Documents') {
          setUploadType('rate-confirmations');
          setShowUploadModal(true);
        } else if (actionName === 'OCR Processing') {
          addNotification('OCR processing started', 'info');
        } else if (actionName === 'Review Queue') {
          addNotification('Review queue opened', 'info');
        }
        break;
      case 'Training Modules':
        if (actionName === 'Upload Module') {
          setShowTrainingModal(true);
        } else if (actionName === 'Assign Training') {
          addNotification('Training assignment opened', 'info');
        } else if (actionName === 'Progress Reports') {
          addNotification('Progress reports opened', 'info');
        }
        break;
      case 'System Settings':
        setShowSettingsModal(true);
        break;
      case 'MFA Management':
        if (actionName === 'Global MFA') {
          addNotification('Global MFA settings opened', 'info');
        } else if (actionName === 'User MFA') {
          addNotification('User MFA settings opened', 'info');
        } else if (actionName === 'Backup Codes') {
          addNotification('Backup codes generated', 'success');
        }
        break;
      case 'Data Management':
        if (actionName === 'Backup Database') {
          handleDatabaseBackup();
        } else if (actionName === 'Clean Logs') {
          handleLogCleanup();
        } else if (actionName === 'System Health') {
          addNotification('System health check completed', 'success');
        }
        break;
      default:
        addNotification(`${actionName} clicked`, 'info');
    }
  };

  const handleDatabaseBackup = async () => {
    try {
      addNotification('Starting database backup...', 'info');
      // Simulate API call
      setTimeout(() => {
        addNotification('Database backup completed successfully', 'success');
      }, 2000);
    } catch (error) {
      addNotification('Database backup failed', 'error');
    }
  };

  const handleLogCleanup = async () => {
    try {
      addNotification('Starting log cleanup...', 'info');
      setTimeout(() => {
        addNotification('Log cleanup completed - 1,250 records removed', 'success');
      }, 1500);
    } catch (error) {
      addNotification('Log cleanup failed', 'error');
    }
  };

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100 hover:bg-blue-50',
      green: 'text-green-600 bg-green-100 hover:bg-green-50',
      purple: 'text-purple-600 bg-purple-100 hover:bg-purple-50',
      orange: 'text-orange-600 bg-orange-100 hover:bg-orange-50',
      red: 'text-red-600 bg-red-100 hover:bg-red-50',
      indigo: 'text-indigo-600 bg-indigo-100 hover:bg-indigo-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.firstName}! Manage your AOL TMS enterprise system.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Enterprise</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>System Online</span>
            </Badge>
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <Bell className="w-4 h-4" />
              <span>3</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {kpis.map((kpi, index) => (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </CardTitle>
                    <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                      <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs ${
                          kpi.changeType === 'positive'
                            ? 'text-green-600'
                            : kpi.changeType === 'negative'
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {kpi.change} from last month
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Management Actions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Administrative Actions</span>
                </CardTitle>
                <CardDescription>
                  Quick access to essential administrative functions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {managementActions.map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      className={`p-4 rounded-lg border border-border hover:shadow-md transition-all cursor-pointer ${getColorClasses(action.color)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${action.color === 'blue' ? 'bg-blue-200' : action.color === 'green' ? 'bg-green-200' : action.color === 'purple' ? 'bg-purple-200' : action.color === 'orange' ? 'bg-orange-200' : action.color === 'red' ? 'bg-red-200' : 'bg-indigo-200'}`}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                          <p className="text-xs text-muted-foreground mb-3">{action.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {action.actions.map((actionBtn) => (
                              <Button
                                key={actionBtn}
                                variant="outline"
                                size="sm"
                                className="text-xs h-6 px-2"
                                onClick={() => handleActionClick(action.title, actionBtn)}
                              >
                                {actionBtn}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>System Alerts</span>
                </CardTitle>
                <CardDescription>
                  Important notifications requiring your attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemAlerts.map((alert, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          alert.type === 'error' ? 'bg-red-500' :
                          alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-sm text-foreground">{alert.message}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (alert.action === 'Schedule') {
                            addNotification('Maintenance scheduled for Truck AOL003', 'success');
                          } else if (alert.action === 'Notify') {
                            addNotification('Training notifications sent to 3 drivers', 'success');
                          } else if (alert.action === 'Review') {
                            addNotification('Security review initiated for suspicious IP', 'info');
                          }
                        }}
                      >
                        {alert.action}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>
                  Latest system events and user activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        activity.priority === 'high' ? 'bg-red-500' :
                        activity.priority === 'normal' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* User Management Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>User Management</span>
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts, roles, and permissions
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setShowCreateUserModal(true)}
                    className="flex items-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create User</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Bulk Import</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </Button>
              </div>

              {/* Users Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-6 py-3 border-b">
                  <div className="grid grid-cols-7 gap-4 text-sm font-medium text-muted-foreground">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div>Status</div>
                    <div>Training Access</div>
                    <div>MFA</div>
                    <div>Actions</div>
                  </div>
                </div>
                <div className="divide-y">
                  {[
                    { id: 1, firstName: 'John', lastName: 'Smith', email: 'john.smith@aoltms.com', role: 'driver', status: 'active', hasTrainingAccess: true, mfaEnabled: false },
                    { id: 2, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@aoltms.com', role: 'dispatcher', status: 'active', hasTrainingAccess: true, mfaEnabled: true },
                    { id: 3, firstName: 'Mike', lastName: 'Davis', email: 'mike.davis@aoltms.com', role: 'accountant', status: 'active', hasTrainingAccess: false, mfaEnabled: true },
                    { id: 4, firstName: 'Carlos', lastName: 'Martinez', email: 'carlos.martinez@aoltms.com', role: 'driver', status: 'active', hasTrainingAccess: true, mfaEnabled: false }
                  ].map((userItem) => (
                    <div key={userItem.id} className="px-6 py-4 hover:bg-muted/20">
                      <div className="grid grid-cols-7 gap-4 items-center">
                        <div className="font-medium">{userItem.firstName} {userItem.lastName}</div>
                        <div className="text-sm text-muted-foreground">{userItem.email}</div>
                        <div>
                          <Badge variant={userItem.role === 'admin' ? 'destructive' : 'secondary'}>
                            {userItem.role}
                          </Badge>
                        </div>
                        <div>
                          <Badge variant={userItem.status === 'active' ? 'default' : 'secondary'}>
                            {userItem.status}
                          </Badge>
                        </div>
                        <div>
                          <Badge variant={userItem.hasTrainingAccess ? 'default' : 'secondary'}>
                            {userItem.hasTrainingAccess ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div>
                          <Badge variant={userItem.mfaEnabled ? 'default' : 'secondary'}>
                            {userItem.mfaEnabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">25</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">23</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">MFA Enabled</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <Shield className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Training Access</p>
                    <p className="text-2xl font-bold">15</p>
                  </div>
                  <FileText className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>System Settings</span>
              </CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Authentication Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Authentication Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="token-expiry">Token Expiry</Label>
                    <Input id="token-expiry" defaultValue="24h" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refresh-token-expiry">Refresh Token Expiry</Label>
                    <Input id="refresh-token-expiry" defaultValue="7d" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                    <Input id="max-login-attempts" type="number" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout</Label>
                    <Input id="session-timeout" defaultValue="2h" />
                  </div>
                </div>
              </div>

              {/* Email Templates */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Email Templates</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Welcome Email</p>
                      <p className="text-sm text-muted-foreground">Sent to new users upon account creation</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Password Reset</p>
                      <p className="text-sm text-muted-foreground">Sent when user requests password reset</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Invoice Notification</p>
                      <p className="text-sm text-muted-foreground">Sent when invoices are generated</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Chat Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Chat Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="chat-enabled" defaultChecked />
                      <Label htmlFor="chat-enabled">Enable Chat System</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-message-length">Max Message Length</Label>
                    <Input id="max-message-length" type="number" defaultValue="1000" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="file-upload" defaultChecked />
                      <Label htmlFor="file-upload">Allow File Uploads</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-file-size">Max File Size</Label>
                    <Input id="max-file-size" defaultValue="10MB" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Database Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Database Management</span>
              </CardTitle>
              <CardDescription>
                Database maintenance and backup operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="flex items-center space-x-2 p-6 h-auto">
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Backup Database</p>
                    <p className="text-sm text-muted-foreground">Create system backup</p>
                  </div>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2 p-6 h-auto">
                  <RefreshCw className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Clean Logs</p>
                    <p className="text-sm text-muted-foreground">Remove old log entries</p>
                  </div>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2 p-6 h-auto">
                  <Activity className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">System Health</p>
                    <p className="text-sm text-muted-foreground">Check system status</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* MFA Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Multi-Factor Authentication</span>
              </CardTitle>
              <CardDescription>
                Manage MFA settings for the entire system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Global MFA Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Global MFA Enforcement</h3>
                  <p className="text-sm text-muted-foreground">Require MFA for all user accounts</p>
                </div>
                <Button variant="outline">
                  Enable Global MFA
                </Button>
              </div>

              {/* MFA Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-sm text-muted-foreground">Users with MFA</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">17</p>
                      <p className="text-sm text-muted-foreground">Users without MFA</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">32%</p>
                      <p className="text-sm text-muted-foreground">MFA Adoption Rate</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* MFA Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="flex items-center space-x-2 p-6 h-auto">
                  <Lock className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Generate Backup Codes</p>
                    <p className="text-sm text-muted-foreground">Create recovery codes</p>
                  </div>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2 p-6 h-auto">
                  <RefreshCw className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Reset User MFA</p>
                    <p className="text-sm text-muted-foreground">Reset specific user</p>
                  </div>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2 p-6 h-auto">
                  <Eye className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">MFA Reports</p>
                    <p className="text-sm text-muted-foreground">View usage statistics</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Security Events</span>
              </CardTitle>
              <CardDescription>
                Monitor security events and system alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: 'warning', message: '3 failed login attempts from 192.168.1.50', time: '2 minutes ago', severity: 'high' },
                  { type: 'info', message: 'MFA enabled for user jennifer.wilson@aoltms.com', time: '15 minutes ago', severity: 'info' },
                  { type: 'warning', message: 'Unusual login pattern detected for carlos.martinez@aoltms.com', time: '1 hour ago', severity: 'medium' },
                  { type: 'error', message: 'Database connection timeout detected', time: '2 hours ago', severity: 'high' }
                ].map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        event.severity === 'high' ? 'bg-red-500' :
                        event.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium">{event.message}</p>
                        <p className="text-xs text-muted-foreground">{event.time}</p>
                      </div>
                    </div>
                    <Badge variant={event.severity === 'high' ? 'destructive' : 'secondary'}>
                      {event.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Access Control</span>
              </CardTitle>
              <CardDescription>
                Manage system access and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Role Permissions</h3>
                  <div className="space-y-2">
                    {['Admin', 'Dispatcher', 'Driver', 'Accountant', 'IT Support'].map((role) => (
                      <div key={role} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{role}</span>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Security Policies</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="password-policy" defaultChecked />
                      <Label htmlFor="password-policy">Enforce Strong Passwords</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="session-policy" defaultChecked />
                      <Label htmlFor="session-policy">Auto-logout Inactive Sessions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ip-restriction" />
                      <Label htmlFor="ip-restriction">IP Address Restrictions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="audit-logs" defaultChecked />
                      <Label htmlFor="audit-logs">Enable Audit Logging</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-semibold mb-4">Create New User</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="driver">Driver</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="accountant">Accountant</option>
                  <option value="it_support">IT Support</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trainingAccess"
                  checked={newUser.hasTrainingAccess}
                  onCheckedChange={(checked) => setNewUser({...newUser, hasTrainingAccess: checked as boolean})}
                />
                <Label htmlFor="trainingAccess">Grant Training Access</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateUserModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>
                Create User
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-semibold mb-4">
              Upload {uploadType === 'users' ? 'Users' : 'Rate Confirmations'}
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Drag and drop files here or click to browse</p>
                <Button variant="outline" size="sm">
                  Choose Files
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                {uploadType === 'users' ?
                  'Supported formats: CSV, Excel (.xlsx). Maximum 1000 users per upload.' :
                  'Supported formats: PDF, JPG, PNG. Maximum 10MB per file.'
                }
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </Button>
              <Button>
                Upload
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Training Module Modal */}
      {showTrainingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg p-6 w-full max-w-lg"
          >
            <h2 className="text-lg font-semibold mb-4">Create Training Module</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="moduleTitle">Module Title</Label>
                <Input id="moduleTitle" placeholder="e.g. Safety Training" />
              </div>
              <div>
                <Label htmlFor="moduleDescription">Description</Label>
                <textarea
                  id="moduleDescription"
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Describe the training module..."
                />
              </div>
              <div>
                <Label>Required for Roles</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Driver', 'Dispatcher', 'Accountant', 'IT Support'].map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox id={role.toLowerCase()} />
                      <Label htmlFor={role.toLowerCase()}>{role}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowTrainingModal(false)}
              >
                Cancel
              </Button>
              <Button>
                Create Module
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`p-3 rounded-lg shadow-lg max-w-sm ${
                notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              <p className="text-sm font-medium">{notification.message}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
