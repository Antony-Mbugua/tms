import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock,
  Plus,
  Upload,
  Filter,
  Eye,
  Edit
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

interface Load {
  id: string
  rateConNumber: string
  pickupLocation: string
  deliveryLocation: string
  commodity: string
  weight: number
  rate: number
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered'
  assignedDriver?: string
  assignedTruck?: string
  pickupDate: Date
  deliveryDate: Date
}

const mockLoads: Load[] = [
  {
    id: '1',
    rateConNumber: 'RC-2024-001',
    pickupLocation: 'Los Angeles, CA',
    deliveryLocation: 'Phoenix, AZ',
    commodity: 'Electronics',
    weight: 25000,
    rate: 2500,
    status: 'assigned',
    assignedDriver: 'Mike Johnson',
    assignedTruck: 'T-456',
    pickupDate: new Date('2024-01-16'),
    deliveryDate: new Date('2024-01-18')
  },
  {
    id: '2',
    rateConNumber: 'RC-2024-002',
    pickupLocation: 'Dallas, TX',
    deliveryLocation: 'Chicago, IL',
    commodity: 'Automotive Parts',
    weight: 35000,
    rate: 3200,
    status: 'in_transit',
    assignedDriver: 'Sarah Williams',
    assignedTruck: 'T-123',
    pickupDate: new Date('2024-01-15'),
    deliveryDate: new Date('2024-01-17')
  },
  {
    id: '3',
    rateConNumber: 'RC-2024-003',
    pickupLocation: 'Miami, FL',
    deliveryLocation: 'Atlanta, GA',
    commodity: 'Food Products',
    weight: 18000,
    rate: 1800,
    status: 'pending',
    pickupDate: new Date('2024-01-17'),
    deliveryDate: new Date('2024-01-19')
  }
]

interface StatsCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  color?: string
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
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
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const LoadManagementTable: React.FC = () => {
  const [loads, setLoads] = useState(mockLoads)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLoads = loads.filter(load =>
    load.rateConNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    load.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    load.deliveryLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    load.commodity.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: Load['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'assigned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'in_transit': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Load Management</CardTitle>
            <CardDescription>
              Manage loads, assign drivers, and track shipments
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="gap-2">
              <Upload size={16} />
              Upload Rate Con
            </Button>
            <Button className="gap-2">
              <Plus size={16} />
              Create Load
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Input
              placeholder="Search loads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                <th className="text-left py-3 px-4 font-medium">Load ID</th>
                <th className="text-left py-3 px-4 font-medium">Route</th>
                <th className="text-left py-3 px-4 font-medium">Commodity</th>
                <th className="text-left py-3 px-4 font-medium">Weight</th>
                <th className="text-left py-3 px-4 font-medium">Rate</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Assigned</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoads.map((load, index) => (
                <motion.tr
                  key={load.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium">{load.rateConNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(load.pickupDate)}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm">
                        <MapPin size={12} className="text-green-500" />
                        <span>{load.pickupLocation}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <MapPin size={12} className="text-red-500" />
                        <span>{load.deliveryLocation}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm">{load.commodity}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium">
                      {load.weight.toLocaleString()} lbs
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(load.rate)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium capitalize",
                      getStatusColor(load.status)
                    )}>
                      {load.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {load.assignedDriver ? (
                      <div className="text-sm">
                        <p className="font-medium">{load.assignedDriver}</p>
                        <p className="text-muted-foreground">{load.assignedTruck}</p>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline">
                        Assign
                      </Button>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye size={14} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit size={14} />
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

export const DispatcherDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Dispatcher Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage loads, assign drivers, and track shipments
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Loads"
          value="12"
          description="Currently in progress"
          icon={Package}
          color="text-blue-500"
        />
        <StatsCard
          title="Available Trucks"
          value="8"
          description="Ready for assignment"
          icon={Truck}
          color="text-green-500"
        />
        <StatsCard
          title="Pending Assignments"
          value="3"
          description="Awaiting dispatch"
          icon={Clock}
          color="text-orange-500"
        />
        <StatsCard
          title="Today's Revenue"
          value={formatCurrency(15400)}
          description="From completed loads"
          icon={Package}
          color="text-purple-500"
        />
      </div>

      {/* Load Management */}
      <LoadManagementTable />
    </div>
  )
}
