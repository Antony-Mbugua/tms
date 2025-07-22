import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Server, Database, Users, Lock, Activity,
  AlertTriangle, CheckCircle, XCircle, RefreshCw, Eye,
  Settings, Key, Download, Trash2, Filter, Search,
  Monitor, Cpu, HardDrive, Network, Clock, Bell,
  FileText, Terminal, Bug, Zap, UserCheck, UserX
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../../contexts/AuthContext';

const ITSupportDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const systemStats = [
    {
      title: 'System Uptime',
      value: '99.9%',
      icon: Server,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: '45 days, 12 hours'
    },
    {
      title: 'Active Users',
      value: '28',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Currently online'
    },
    {
      title: 'Security Events',
      value: '12',
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Last 24 hours'
    },
    {
      title: 'Database Health',
      value: 'Healthy',
      icon: Database,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: '98.5% performance'
    },
    {
      title: 'Failed Logins',
      value: '3',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Last hour'
    },
    {
      title: 'MFA Enabled',
      value: '85%',
      icon: Lock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: '17 of 20 users'
    }
  ];

  const securityEvents = [
    {
      id: 'SEC-001',
      type: 'Failed Login',
      user: 'unknown@suspicious.com',
      severity: 'High',
      description: 'Multiple failed login attempts from suspicious IP',
      ip: '203.0.113.1',
      timestamp: '2024-12-22 19:45:23',
      status: 'Under Review'
    },
    {
      id: 'SEC-002',
      type: 'MFA Enabled',
      user: 'jennifer.wilson@aol.com',
      severity: 'Low',
      description: 'User enabled multi-factor authentication',
      ip: '192.168.1.102',
      timestamp: '2024-12-22 16:30:15',
      status: 'Completed'
    },
    {
      id: 'SEC-003',
      type: 'Password Change',
      user: 'john.smith@aol.com',
      severity: 'Medium',
      description: 'User changed password after 90 days',
      ip: '192.168.1.105',
      timestamp: '2024-12-22 14:22:10',
      status: 'Completed'
    },
    {
      id: 'SEC-004',
      type: 'Unauthorized Access',
      user: 'carlos.martinez@aol.com',
      severity: 'High',
      description: 'Attempted access to admin panel without permission',
      ip: '192.168.1.108',
      timestamp: '2024-12-22 12:15:45',
      status: 'Resolved'
    }
  ];

  const systemLogs = [
    {
      id: 'LOG-001',
      level: 'ERROR',
      component: 'Database',
      message: 'Connection timeout exceeded for user query',
      timestamp: '2024-12-22 19:50:12',
      count: 3
    },
    {
      id: 'LOG-002',
      level: 'WARN',
      component: 'Auth Service',
      message: 'Rate limit exceeded for IP 203.0.113.1',
      timestamp: '2024-12-22 19:45:23',
      count: 15
    },
    {
      id: 'LOG-003',
      level: 'INFO',
      component: 'File Upload',
      message: 'Document uploaded successfully by driver',
      timestamp: '2024-12-22 19:40:33',
      count: 1
    },
    {
      id: 'LOG-004',
      level: 'ERROR',
      component: 'Socket.IO',
      message: 'WebSocket connection failed for user session',
      timestamp: '2024-12-22 19:35:18',
      count: 2
    }
  ];

  const userManagement = [
    {
      id: 1,
      name: 'System Administrator',
      email: 'admin@alloverlogistics.com',
      role: 'Admin',
      status: 'Active',
      mfa: true,
      last_login: '2024-12-22 19:30:00',
      failed_attempts: 0
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'dispatcher@alloverlogistics.com',
      role: 'Dispatcher',
      status: 'Active',
      mfa: false,
      last_login: '2024-12-22 18:45:00',
      failed_attempts: 0
    },
    {
      id: 3,
      name: 'John Smith',
      email: 'driver@alloverlogistics.com',
      role: 'Driver',
      status: 'Active',
      mfa: true,
      last_login: '2024-12-22 17:30:00',
      failed_attempts: 1
    },
    {
      id: 4,
      name: 'Jennifer Wilson',
      email: 'accountant2@alloverlogistics.com',
      role: 'Accountant',
      status: 'Locked',
      mfa: false,
      last_login: '2024-12-21 16:20:00',
      failed_attempts: 5
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Locked': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Under Review': return 'bg-orange-100 text-orange-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Resolved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'WARN': return 'bg-orange-100 text-orange-800';
      case 'INFO': return 'bg-blue-100 text-blue-800';
      case 'DEBUG': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Monitor },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'logs', label: 'System Logs', icon: FileText },
    { id: 'users', label: 'User Management', icon: Users }
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
              IT Support Center
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.firstName}! Monitor system health and security events.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button className="flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>Key Rotation</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Backup SIEM</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* System Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {systemStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="w-5 h-5" />
                <span>System Overview</span>
              </CardTitle>
              <CardDescription>
                Real-time system performance and health monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Cpu className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-foreground">45%</p>
                  <p className="text-sm text-muted-foreground">CPU Usage</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <HardDrive className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-foreground">62%</p>
                  <p className="text-sm text-muted-foreground">Memory Usage</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-foreground">78%</p>
                  <p className="text-sm text-muted-foreground">Disk Usage</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Network className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-foreground">125 MB/s</p>
                  <p className="text-sm text-muted-foreground">Network I/O</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium text-foreground mb-3">System Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restart Services
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="w-4 h-4 mr-2" />
                      Backup Database
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clean SIEM Tables
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium text-foreground mb-3">Quick Settings</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Lock className="w-4 h-4 mr-2" />
                      Global MFA Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Key className="w-4 h-4 mr-2" />
                      Trigger Key Rotation
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      System Configuration
                    </Button>
                  </div>
                </div>
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
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Security Events</span>
                  </CardTitle>
                  <CardDescription>
                    Monitor and respond to security incidents
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-semibold text-foreground">{event.id}</span>
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">{event.type}</p>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <strong>User:</strong> {event.user}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              <strong>IP:</strong> {event.ip}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>Time:</strong> {event.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {event.status === 'Under Review' && (
                          <Button size="sm">
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* System Logs Tab */}
      {activeTab === 'logs' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>System Logs</span>
              </CardTitle>
              <CardDescription>
                Application logs and error monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={getLogLevelColor(log.level)}>
                            {log.level}
                          </Badge>
                          <span className="font-medium text-foreground">{log.component}</span>
                          <span className="text-sm text-muted-foreground">Count: {log.count}</span>
                        </div>
                        <p className="text-sm text-foreground font-mono bg-muted p-2 rounded">
                          {log.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">{log.timestamp}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Terminal className="w-4 h-4" />
                        </Button>
                        {log.level === 'ERROR' && (
                          <Button size="sm" variant="destructive">
                            <Bug className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>
                Manage user accounts, MFA settings, and security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userManagement.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-semibold text-foreground">{user.name}</span>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-sm text-muted-foreground">{user.role}</p>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">MFA Status:</span>
                            {user.mfa ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Failed attempts: {user.failed_attempts}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm">
                            <strong>Last login:</strong>
                          </p>
                          <p className="text-sm text-muted-foreground">{user.last_login}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {user.status === 'Locked' && (
                          <Button size="sm" className="flex items-center space-x-1">
                            <UserCheck className="w-4 h-4" />
                            <span>Unlock</span>
                          </Button>
                        )}
                        {user.status === 'Active' && (
                          <Button size="sm" variant="destructive" className="flex items-center space-x-1">
                            <UserX className="w-4 h-4" />
                            <span>Lock</span>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="flex items-center space-x-1">
                          <Lock className="w-4 h-4" />
                          <span>{user.mfa ? 'Disable' : 'Enable'} MFA</span>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ITSupportDashboard;
