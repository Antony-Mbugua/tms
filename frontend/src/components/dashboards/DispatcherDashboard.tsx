import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, MapPin, FileText, Clock, Users, MessageCircle,
  Plus, Upload, Search, Filter, AlertCircle, CheckCircle,
  XCircle, Navigation, Phone, Mail, Calendar, DollarSign,
  Flag, Zap, Eye, Edit, Trash2, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../../contexts/AuthContext';

const DispatcherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('loads');
  const [searchTerm, setSearchTerm] = useState('');

  const loadStats = [
    {
      title: 'Active Loads',
      value: '18',
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Currently dispatched'
    },
    {
      title: 'Pending Assignment',
      value: '6',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Awaiting driver assignment'
    },
    {
      title: 'In Transit',
      value: '12',
      icon: Navigation,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'En route to destination'
    },
    {
      title: 'Available Drivers',
      value: '8',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Ready for assignment'
    }
  ];

  const loads = [
    {
      id: 'AOL-2024-001',
      broker: 'Express Logistics',
      pickup: 'San Jose, CA',
      delivery: 'Dallas, TX',
      driver: 'John Smith',
      truck: 'AOL001',
      status: 'In Transit',
      priority: 'Normal',
      rate: '$3,875',
      pickup_date: '2024-12-20',
      delivery_date: '2024-12-22',
      progress: 65
    },
    {
      id: 'AOL-2024-002',
      broker: 'National Freight',
      pickup: 'Detroit, MI',
      delivery: 'Phoenix, AZ',
      driver: 'David Williams',
      truck: 'AOL002',
      status: 'Loaded',
      priority: 'High',
      rate: '$4,250',
      pickup_date: '2024-12-21',
      delivery_date: '2024-12-23',
      progress: 30
    },
    {
      id: 'AOL-2024-003',
      broker: 'Sunrise Transport',
      pickup: 'Charlotte, NC',
      delivery: 'Miami, FL',
      driver: 'Unassigned',
      truck: 'Unassigned',
      status: 'Pending',
      priority: 'Normal',
      rate: '$2,925',
      pickup_date: '2024-12-22',
      delivery_date: '2024-12-24',
      progress: 0
    },
    {
      id: 'AOL-2024-004',
      broker: 'Quick Cargo',
      pickup: 'Houston, TX',
      delivery: 'Atlanta, GA',
      driver: 'Carlos Martinez',
      truck: 'AOL003',
      status: 'Delivered',
      priority: 'Urgent',
      rate: '$3,650',
      pickup_date: '2024-12-18',
      delivery_date: '2024-12-20',
      progress: 100
    }
  ];

  const brokers = [
    {
      name: 'Express Logistics',
      contact: 'Tom Anderson',
      phone: '+1-555-1001',
      email: 'tom@expresslogistics.com',
      payment: 'Quick Pay',
      credit: 'Approved',
      rating: 4.5,
      loads: 12
    },
    {
      name: 'National Freight',
      contact: 'Rebecca Miller',
      phone: '+1-555-1002',
      email: 'rebecca@nationalfreight.com',
      payment: 'Net 30',
      credit: 'Approved',
      rating: 4.2,
      loads: 8
    },
    {
      name: 'Quick Cargo Services',
      contact: 'James Brown',
      phone: '+1-555-1005',
      email: 'jbrown@quickcargo.com',
      payment: 'Zelle',
      credit: 'Denied',
      rating: 2.1,
      loads: 2
    }
  ];

  const availableDrivers = [
    {
      name: 'Robert Davis',
      truck: 'AOL004',
      location: 'Memphis, TN',
      status: 'Available',
      phone: '+1-555-0204',
      rating: 4.8,
      last_delivery: '2 hours ago'
    },
    {
      name: 'Mike Rodriguez',
      truck: 'AOL005',
      location: 'Atlanta, GA',
      status: 'Available',
      phone: '+1-555-0205',
      rating: 4.6,
      last_delivery: '4 hours ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'In Transit': return 'bg-blue-100 text-blue-800';
      case 'Loaded': return 'bg-purple-100 text-purple-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Normal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'loads', label: 'Load Management', icon: Truck },
    { id: 'brokers', label: 'Brokers', icon: Users },
    { id: 'drivers', label: 'Drivers', icon: Navigation },
    { id: 'chat', label: 'Chat', icon: MessageCircle }
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
              Dispatch Center
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.firstName}! Coordinate loads and manage your fleet operations.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Load</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload Documents</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Load Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {loadStats.map((stat, index) => (
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

      {/* Content based on active tab */}
      {activeTab === 'loads' && (
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
                    <Truck className="w-5 h-5" />
                    <span>Load Management</span>
                  </CardTitle>
                  <CardDescription>
                    Create, assign, and track loads in real-time
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search loads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loads.map((load, index) => (
                  <motion.div
                    key={load.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {/* Load Info */}
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-foreground">{load.id}</span>
                            <Badge className={getPriorityColor(load.priority)}>
                              {load.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{load.broker}</p>
                          <p className="text-sm font-medium text-green-600">{load.rate}</p>
                        </div>

                        {/* Route */}
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">Route</span>
                          </div>
                          <p className="text-sm text-foreground">{load.pickup}</p>
                          <p className="text-sm text-muted-foreground">↓</p>
                          <p className="text-sm text-foreground">{load.delivery}</p>
                        </div>

                        {/* Assignment */}
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Users className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">Assignment</span>
                          </div>
                          <p className="text-sm text-foreground">{load.driver}</p>
                          <p className="text-sm text-muted-foreground">{load.truck}</p>
                        </div>

                        {/* Schedule */}
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium">Schedule</span>
                          </div>
                          <p className="text-sm text-foreground">Pickup: {load.pickup_date}</p>
                          <p className="text-sm text-foreground">Delivery: {load.delivery_date}</p>
                        </div>

                        {/* Status & Progress */}
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Activity className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">Status</span>
                          </div>
                          <Badge className={getStatusColor(load.status)}>
                            {load.status}
                          </Badge>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${load.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{load.progress}% Complete</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4" />
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

      {activeTab === 'brokers' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Broker Management</span>
              </CardTitle>
              <CardDescription>
                Manage broker relationships and credit status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brokers.map((broker, index) => (
                  <motion.div
                    key={broker.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{broker.name}</h3>
                        <p className="text-sm text-muted-foreground">{broker.contact}</p>
                      </div>
                      <Badge className={broker.credit === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {broker.credit}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{broker.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{broker.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>{broker.payment}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Loads: </span>
                        <span className="font-medium">{broker.loads}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Rating: </span>
                        <span className="font-medium">{broker.rating}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'drivers' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Navigation className="w-5 h-5" />
                <span>Available Drivers</span>
              </CardTitle>
              <CardDescription>
                Monitor driver availability and assign loads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableDrivers.map((driver, index) => (
                  <motion.div
                    key={driver.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{driver.name}</h3>
                        <p className="text-sm text-muted-foreground">{driver.truck}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {driver.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{driver.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{driver.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Last delivery: {driver.last_delivery}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Rating: </span>
                        <span className="font-medium">{driver.rating}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm">
                          Assign Load
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4" />
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

      {activeTab === 'chat' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Real-time Chat System
                </h3>
                <p className="text-muted-foreground">
                  Chat with drivers and coordinate loads in real-time
                </p>
                <Button className="mt-4">
                  Open Chat Interface
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DispatcherDashboard;
