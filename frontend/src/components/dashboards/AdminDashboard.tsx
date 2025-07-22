import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, Users, FileText, DollarSign, Shield, Activity, 
  UserPlus, Settings, Upload, Download, Database, Lock,
  TrendingUp, AlertTriangle, CheckCircle, Clock,
  BarChart3, PieChart, LineChart, MapPin, Bell
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

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
                      <Button variant="outline" size="sm">
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

      {/* Other tabs content would go here */}
      {activeTab !== 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {tabs.find(tab => tab.id === activeTab)?.label} Module
                </h3>
                <p className="text-muted-foreground">
                  Coming soon - Advanced {activeTab} management features
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
