import React from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Truck,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatCurrency } from '@/lib/utils'

interface AnalyticsData {
  revenue: {
    current: number
    previous: number
    growth: number
  }
  loads: {
    total: number
    completed: number
    inProgress: number
    completion_rate: number
  }
  fleet: {
    active: number
    total: number
    utilization: number
  }
  performance: {
    onTimeDelivery: number
    customerSatisfaction: number
    fuelEfficiency: number
  }
}

const mockAnalytics: AnalyticsData = {
  revenue: {
    current: 284500,
    previous: 247300,
    growth: 15.04
  },
  loads: {
    total: 156,
    completed: 142,
    inProgress: 14,
    completion_rate: 91.03
  },
  fleet: {
    active: 11,
    total: 12,
    utilization: 91.67
  },
  performance: {
    onTimeDelivery: 94.2,
    customerSatisfaction: 4.7,
    fuelEfficiency: 6.8
  }
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<{ size?: number; className?: string }>
  format?: 'currency' | 'percentage' | 'number'
  trend?: 'up' | 'down' | 'neutral'
  description?: string
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  format = 'number',
  trend = 'neutral',
  description
}) => {
  const formatValue = (val: string | number) => {
    if (format === 'currency') {
      return formatCurrency(Number(val))
    } else if (format === 'percentage') {
      return `${val}%`
    }
    return val.toString()
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-500'
      case 'down': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }

  const getTrendIcon = () => {
    if (change === undefined) return null
    return change > 0 ? TrendingUp : TrendingDown
  }

  const TrendIcon = getTrendIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          
          {change !== undefined && (
            <div className={cn("flex items-center text-xs", getTrendColor())}>
              {TrendIcon && <TrendIcon size={12} className="mr-1" />}
              <span>{change > 0 ? '+' : ''}{change}%</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

const RevenueChart: React.FC = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const revenue = [180000, 220000, 195000, 247000, 285000, 284500]
  
  const maxRevenue = Math.max(...revenue)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 size={20} />
          Revenue Trend
        </CardTitle>
        <CardDescription>Monthly revenue over the last 6 months</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end justify-between h-40 space-x-2">
            {revenue.map((amount, index) => {
              const height = (amount / maxRevenue) * 100
              
              return (
                <motion.div
                  key={months[index]}
                  className="flex flex-col items-center flex-1"
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <motion.div
                    className="w-full bg-primary rounded-t-lg min-h-[4px]"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                  <span className="text-xs text-muted-foreground mt-2">
                    {months[index]}
                  </span>
                </motion.div>
              )
            })}
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(revenue[revenue.length - 1])}
              </p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold">
                {formatCurrency(revenue.reduce((a, b) => a + b, 0) / revenue.length)}
              </p>
              <p className="text-xs text-muted-foreground">Average</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {((revenue[revenue.length - 1] - revenue[revenue.length - 2]) / revenue[revenue.length - 2] * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Growth</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const FleetUtilization: React.FC = () => {
  const trucks = [
    { id: 'T-001', status: 'active', utilization: 95 },
    { id: 'T-002', status: 'active', utilization: 87 },
    { id: 'T-003', status: 'active', utilization: 92 },
    { id: 'T-004', status: 'maintenance', utilization: 0 },
    { id: 'T-005', status: 'active', utilization: 89 },
    { id: 'T-006', status: 'active', utilization: 94 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'maintenance': return 'bg-orange-500'
      case 'inactive': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck size={20} />
          Fleet Utilization
        </CardTitle>
        <CardDescription>Individual truck performance and status</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {trucks.map((truck, index) => (
            <motion.div
              key={truck.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div className={cn("w-3 h-3 rounded-full", getStatusColor(truck.status))} />
                <span className="font-medium">{truck.id}</span>
                <span className="text-sm text-muted-foreground capitalize">
                  {truck.status}
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${truck.utilization}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {truck.utilization}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export const AnalyticsDashboard: React.FC<{ data?: AnalyticsData }> = ({ 
  data = mockAnalytics 
}) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={data.revenue.current}
          change={data.revenue.growth}
          icon={DollarSign}
          format="currency"
          trend="up"
          description="Monthly recurring revenue"
        />
        
        <MetricCard
          title="Active Loads"
          value={data.loads.inProgress}
          icon={Package}
          description={`${data.loads.completed} completed this month`}
        />
        
        <MetricCard
          title="Fleet Utilization"
          value={data.fleet.utilization}
          icon={Truck}
          format="percentage"
          description={`${data.fleet.active}/${data.fleet.total} trucks active`}
        />
        
        <MetricCard
          title="On-Time Delivery"
          value={data.performance.onTimeDelivery}
          icon={Calendar}
          format="percentage"
          trend="up"
          description="Last 30 days performance"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <FleetUtilization />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Customer Satisfaction"
          value={`${data.performance.customerSatisfaction}/5.0`}
          icon={Users}
          description="Average customer rating"
        />
        
        <MetricCard
          title="Fuel Efficiency"
          value={`${data.performance.fuelEfficiency} MPG`}
          icon={TrendingUp}
          description="Fleet average"
        />
        
        <MetricCard
          title="Load Completion Rate"
          value={data.loads.completion_rate}
          format="percentage"
          icon={Package}
          trend="up"
          description="Successful deliveries"
        />
      </div>
    </div>
  )
}
