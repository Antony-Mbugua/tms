import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Route, 
  MapPin, 
  Upload, 
  FileText,
  Clock,
  CheckCircle,
  Camera,
  MessageSquare,
  Fuel,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

interface Trip {
  id: string
  loadNumber: string
  pickupLocation: string
  deliveryLocation: string
  commodity: string
  status: 'assigned' | 'en_route_pickup' | 'loaded' | 'en_route_delivery' | 'delivered'
  pickupDate: Date
  deliveryDate: Date
  rate: number
  miles: number
  estimatedFuel: number
}

const mockTrips: Trip[] = [
  {
    id: '1',
    loadNumber: 'RC-2024-001',
    pickupLocation: 'Los Angeles, CA',
    deliveryLocation: 'Phoenix, AZ',
    commodity: 'Electronics',
    status: 'loaded',
    pickupDate: new Date('2024-01-16'),
    deliveryDate: new Date('2024-01-18'),
    rate: 2500,
    miles: 387,
    estimatedFuel: 120
  },
  {
    id: '2',
    loadNumber: 'RC-2024-005',
    pickupLocation: 'Phoenix, AZ',
    deliveryLocation: 'Las Vegas, NV',
    commodity: 'Furniture',
    status: 'assigned',
    pickupDate: new Date('2024-01-19'),
    deliveryDate: new Date('2024-01-20'),
    rate: 1800,
    miles: 297,
    estimatedFuel: 95
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

const CurrentTripCard: React.FC<{ trip: Trip }> = ({ trip }) => {
  const [tripStatus, setTripStatus] = useState(trip.status)

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'en_route_pickup': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'loaded': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'en_route_delivery': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getNextStatus = (currentStatus: Trip['status']) => {
    switch (currentStatus) {
      case 'assigned': return { status: 'en_route_pickup', label: 'Start Pickup' }
      case 'en_route_pickup': return { status: 'loaded', label: 'Confirm Pickup' }
      case 'loaded': return { status: 'en_route_delivery', label: 'Start Delivery' }
      case 'en_route_delivery': return { status: 'delivered', label: 'Confirm Delivery' }
      default: return null
    }
  }

  const nextStatus = getNextStatus(tripStatus)

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Current Trip</CardTitle>
            <CardDescription>Load #{trip.loadNumber}</CardDescription>
          </div>
          <span className={cn(
            "px-3 py-1 rounded-full text-sm font-medium capitalize",
            getStatusColor(tripStatus)
          )}>
            {tripStatus.replace('_', ' ')}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Pickup</p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin size={14} className="text-green-500" />
              <span>{trip.pickupLocation}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(trip.pickupDate)}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Delivery</p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin size={14} className="text-red-500" />
              <span>{trip.deliveryLocation}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(trip.deliveryDate)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl">
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{formatCurrency(trip.rate)}</p>
            <p className="text-xs text-muted-foreground">Total Rate</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{trip.miles}</p>
            <p className="text-xs text-muted-foreground">Miles</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{trip.estimatedFuel}g</p>
            <p className="text-xs text-muted-foreground">Est. Fuel</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Commodity: {trip.commodity}</p>
          
          <div className="flex space-x-2">
            {nextStatus && (
              <Button 
                onClick={() => setTripStatus(nextStatus.status)}
                className="gap-2"
              >
                <CheckCircle size={16} />
                {nextStatus.label}
              </Button>
            )}
            
            <Button variant="outline" className="gap-2">
              <Camera size={16} />
              Upload Photo
            </Button>
            
            <Button variant="outline" className="gap-2">
              <MessageSquare size={16} />
              Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const DocumentUploadCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload size={20} />
          Document Upload
        </CardTitle>
        <CardDescription>
          Upload required documents for your trips
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <FileText size={24} />
            <span className="text-sm">Proof of Delivery</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Camera size={24} />
            <span className="text-sm">Load Photos</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Receipt size={24} />
            <span className="text-sm">Fuel Receipts</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <FileText size={24} />
            <span className="text-sm">BOL/POD</span>
          </Button>
        </div>
        
        <div className="mt-4 p-4 bg-muted/50 rounded-xl">
          <h4 className="font-medium mb-2">Recent Uploads</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>BOL_RC-2024-001.pdf</span>
              <span className="text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Load_photo_001.jpg</span>
              <span className="text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const Receipt: React.FC<React.ComponentProps<typeof FileText>> = (props) => {
  return <FileText {...props} />
}

export const DriverDashboard: React.FC = () => {
  const currentTrip = mockTrips.find(trip => trip.status !== 'delivered')

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Driver Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your trips, upload documents, and track progress
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Trips"
          value="2"
          description="Currently assigned"
          icon={Route}
          color="text-blue-500"
        />
        <StatsCard
          title="This Week's Miles"
          value="1,247"
          description="Miles driven"
          icon={MapPin}
          color="text-green-500"
        />
        <StatsCard
          title="This Week's Earnings"
          value={formatCurrency(3200)}
          description="Completed loads"
          icon={Route}
          color="text-purple-500"
        />
        <StatsCard
          title="Fuel Efficiency"
          value="6.8 MPG"
          description="Average this month"
          icon={Fuel}
          color="text-orange-500"
        />
      </div>

      {/* Current Trip & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentTrip ? (
          <CurrentTripCard trip={currentTrip} />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Route size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Trips</h3>
              <p className="text-muted-foreground">
                You don't have any active trips at the moment.
              </p>
            </CardContent>
          </Card>
        )}
        
        <DocumentUploadCard />
      </div>

      {/* Trip History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trips</CardTitle>
          <CardDescription>
            Your completed and upcoming trips
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {mockTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Route size={20} className="text-primary-foreground" />
                  </div>
                  
                  <div>
                    <p className="font-medium">{trip.loadNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.pickupLocation} → {trip.deliveryLocation}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-green-600">{formatCurrency(trip.rate)}</p>
                  <p className="text-sm text-muted-foreground">{trip.miles} miles</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
