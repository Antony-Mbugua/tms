import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Truck, 
  DollarSign, 
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatCurrency } from '@/lib/utils'
import { UserRole } from '@/types/user'

interface StatsCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  trend?: number
  color?: string
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  color = "text-primary" 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={cn("h-4 w-4", color)} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {trend !== undefined && (
              <span className={cn("mr-1", trend > 0 ? "text-green-500" : "text-red-500")}>
                {trend > 0 ? "+" : ""}{trend}%
              </span>
            )}
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  status: 'active' | 'inactive'
  lastLogin?: string
  hasTrainingAccess: boolean
}

const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Admin',
    email: 'admin@aol.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-15',
    hasTrainingAccess: true
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Dispatcher',
    email: 'sarah@aol.com',
    role: 'dispatcher',
    status: 'active',
    lastLogin: '2024-01-15',
    hasTrainingAccess: true
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike@aol.com',
    role: 'driver',
    status: 'active',
    lastLogin: '2024-01-14',
    hasTrainingAccess: false
  },
  {
    id: '4',
    firstName: 'Lisa',
    lastName: 'Williams',
    email: 'lisa@aol.com',
    role: 'accountant',
    status: 'active',
    lastLogin: '2024-01-15',
    hasTrainingAccess: true
  }
]

const UserManagementTable: React.FC = () => {
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleTrainingAccess = (userId: string) => {
    setUsers(users.map(user =>
      user.id === userId 
        ? { ...user, hasTrainingAccess: !user.hasTrainingAccess }
        : user
    ))
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'dispatcher': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'driver': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'accountant': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'it_support': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage users, roles, and permissions
            </CardDescription>
          </div>
          <Button className="gap-2">
            <Plus size={16} />
            Add User
          </Button>
        </div>
        
        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter size={16} />
            Filter
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">User</th>
                <th className="text-left py-3 px-4 font-medium">Role</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Training Access</th>
                <th className="text-left py-3 px-4 font-medium">Last Login</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium capitalize",
                      getRoleColor(user.role)
                    )}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      user.status === 'active' 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Button
                      variant={user.hasTrainingAccess ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTrainingAccess(user.id)}
                      className="gap-2"
                    >
                      <Shield size={14} />
                      {user.hasTrainingAccess ? 'Granted' : 'Grant Access'}
                    </Button>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">
                    {user.lastLogin || 'Never'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 size={14} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal size={14} />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, fleet, and system analytics
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value="24"
          description="Active users"
          icon={Users}
          trend={8}
          color="text-blue-500"
        />
        <StatsCard
          title="Fleet Size"
          value="12"
          description="Trucks in operation"
          icon={Truck}
          trend={0}
          color="text-green-500"
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(125000)}
          description="This month"
          icon={DollarSign}
          trend={12}
          color="text-purple-500"
        />
        <StatsCard
          title="System Performance"
          value="99.8%"
          description="Uptime"
          icon={TrendingUp}
          trend={0.2}
          color="text-orange-500"
        />
      </div>

      {/* User Management */}
      <UserManagementTable />
    </div>
  )
}
