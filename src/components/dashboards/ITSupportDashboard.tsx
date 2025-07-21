import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Server, 
  Activity, 
  AlertTriangle,
  Key,
  Eye,
  Users,
  Database,
  Wifi,
  HardDrive,
  Cpu,
  Lock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatDate } from '@/lib/utils'

interface SystemMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  lastUpdate: Date
}

interface SecurityLog {
  id: string
  event: string
  user: string
  ip: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  details: string
}

const mockSystemMetrics: SystemMetric[] = [
  {
    id: '1',
    name: 'CPU Usage',
    value: 45,
    unit: '%',
    status: 'healthy',
    lastUpdate: new Date()
  },
  {
    id: '2',
    name: 'Memory Usage',
    value: 72,
    unit: '%',
    status: 'warning',
    lastUpdate: new Date()
  },
  {
    id: '3',
    name: 'Disk Usage',
    value: 38,
    unit: '%',
    status: 'healthy',
    lastUpdate: new Date()
  },
  {
    id: '4',
    name: 'Network Latency',
    value: 45,
    unit: 'ms',
    status: 'healthy',
    lastUpdate: new Date()
  }
]

const mockSecurityLogs: SecurityLog[] = [
  {
    id: '1',
    event: 'Failed Login Attempt',
    user: 'unknown',
    ip: '192.168.1.100',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    severity: 'medium',
    details: 'Multiple failed attempts from same IP'
  },
  {
    id: '2',
    event: 'Successful Admin Login',
    user: 'admin@aol.com',
    ip: '192.168.1.15',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    severity: 'low',
    details: 'Admin login from trusted location'
  },
  {
    id: '3',
    event: 'MFA Setup',
    user: 'driver@aol.com',
    ip: '192.168.1.22',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    severity: 'low',
    details: 'User enabled two-factor authentication'
  },
  {
    id: '4',
    event: 'Encryption Key Rotation',
    user: 'system',
    ip: 'localhost',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    severity: 'low',
    details: 'AES-256 encryption keys rotated successfully'
  }
]

interface StatsCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  status?: 'healthy' | 'warning' | 'critical'
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  status = 'healthy'
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      default: return 'text-primary'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={cn("h-4 w-4", getStatusColor())} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const SystemHealthCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity size={20} />
          System Health
        </CardTitle>
        <CardDescription>
          Real-time system performance metrics
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {mockSystemMetrics.map((metric, index) => {
            const getProgressColor = () => {
              switch (metric.status) {
                case 'healthy': return 'bg-green-500'
                case 'warning': return 'bg-yellow-500'
                case 'critical': return 'bg-red-500'
                default: return 'bg-primary'
              }
            }

            const getIcon = () => {
              switch (metric.name) {
                case 'CPU Usage': return Cpu
                case 'Memory Usage': return HardDrive
                case 'Disk Usage': return Database
                case 'Network Latency': return Wifi
                default: return Server
              }
            }

            const IconComponent = getIcon()

            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <IconComponent size={20} className={cn(getProgressColor().replace('bg-', 'text-'))} />
                  <div>
                    <p className="font-medium">{metric.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {formatDate(metric.lastUpdate)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {metric.value}{metric.unit}
                  </p>
                  <div className="w-24 h-2 bg-muted rounded-full mt-1">
                    <div 
                      className={cn("h-full rounded-full transition-all", getProgressColor())}
                      style={{ width: `${Math.min(metric.value, 100)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

const SecurityLogsCard: React.FC = () => {
  const getSeverityColor = (severity: SecurityLog['severity']) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getEventIcon = (event: string) => {
    if (event.includes('Login')) return Users
    if (event.includes('MFA')) return Shield
    if (event.includes('Encryption')) return Key
    return Eye
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Security Event Logs
            </CardTitle>
            <CardDescription>
              Monitor authentication and security events
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View All Logs
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {mockSecurityLogs.map((log, index) => {
            const IconComponent = getEventIcon(log.event)
            
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start space-x-3 p-4 bg-muted/50 rounded-xl"
              >
                <IconComponent size={20} className="text-muted-foreground mt-0.5" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{log.event}</p>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getSeverityColor(log.severity)
                    )}>
                      {log.severity}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {log.details}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>User: {log.user}</span>
                    <span>IP: {log.ip}</span>
                    <span>{formatDate(log.timestamp)}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

const EncryptionStatusCard: React.FC = () => {
  const [lastRotation] = useState(new Date(Date.now() - 1000 * 60 * 60 * 24 * 15)) // 15 days ago
  const [nextRotation] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24 * 15)) // 15 days from now

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock size={20} />
          Encryption Status
        </CardTitle>
        <CardDescription>
          AES-256 encryption key management
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Encryption Active
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  All data encrypted with AES-256
                </p>
              </div>
            </div>
            <Shield size={24} className="text-green-600" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-sm font-medium mb-1">Last Key Rotation</p>
              <p className="text-lg font-bold">{formatDate(lastRotation)}</p>
              <p className="text-xs text-muted-foreground">15 days ago</p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-sm font-medium mb-1">Next Rotation</p>
              <p className="text-lg font-bold">{formatDate(nextRotation)}</p>
              <p className="text-xs text-muted-foreground">In 15 days</p>
            </div>
          </div>

          <Button className="w-full gap-2">
            <Key size={16} />
            Rotate Keys Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export const ITSupportDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">IT Support Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor system health, security logs, and encryption status
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="System Uptime"
          value="99.8%"
          description="Last 30 days"
          icon={Server}
          status="healthy"
        />
        <StatsCard
          title="Active Users"
          value="24"
          description="Currently online"
          icon={Users}
          status="healthy"
        />
        <StatsCard
          title="Security Alerts"
          value="3"
          description="In last 24 hours"
          icon={Shield}
          status="warning"
        />
        <StatsCard
          title="Failed Logins"
          value="12"
          description="This week"
          icon={AlertTriangle}
          status="warning"
        />
      </div>

      {/* System Health & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealthCard />
        <EncryptionStatusCard />
      </div>

      {/* Security Logs */}
      <SecurityLogsCard />
    </div>
  )
}
