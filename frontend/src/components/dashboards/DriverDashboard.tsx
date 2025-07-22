import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, MapPin, Camera, MessageCircle, DollarSign, Clock,
  Navigation, Play, Square, CheckCircle, Upload, Phone,
  FileText, AlertCircle, Star, Route, Fuel, Receipt,
  Book, Settings, Bell, RefreshCw, Eye, Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('loads');

  const driverStats = [
    {
      title: 'Assigned Loads',
      value: '3',
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Active assignments'
    },
    {
      title: 'Miles This Month',
      value: '2,847',
      icon: Route,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Total distance'
    },
    {
      title: 'Earnings',
      value: '$8,240',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'This month'
    },
    {
      title: 'Rating',
      value: '4.9',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Driver rating'
    }
  ];

  const assignedLoads = [
    {
      id: 'AOL-2024-001',
      broker: 'Express Logistics',
      pickup: 'San Jose, CA',
      delivery: 'Dallas, TX',
      status: 'In Transit',
      priority: 'Normal',
      rate: '$3,875',
      pickup_date: '2024-12-20',
      delivery_date: '2024-12-22',
      progress: 65,
      distance: '1,287 miles',
      eta: '18 hours',
      commodity: 'Electronics'
    },
    {
      id: 'AOL-2024-005',
      broker: 'Reliable Routes',
      pickup: 'Dallas, TX',
      delivery: 'Memphis, TN',
      status: 'Pending',
      priority: 'High',
      rate: '$2,150',
      pickup_date: '2024-12-23',
      delivery_date: '2024-12-24',
      progress: 0,
      distance: '456 miles',
      eta: 'Not started',
      commodity: 'Auto Parts'
    }
  ];

  const recentDocuments = [
    {
      type: 'BOL',
      load: 'AOL-2024-001',
      status: 'Uploaded',
      date: '2024-12-20',
      time: '14:30'
    },
    {
      type: 'Load Image',
      load: 'AOL-2024-001',
      status: 'Pending',
      date: '2024-12-20',
      time: '08:15'
    },
    {
      type: 'Fuel Receipt',
      load: 'AOL-2024-001',
      status: 'Uploaded',
      date: '2024-12-19',
      time: '16:45'
    }
  ];

  const paymentHistory = [
    {
      load: 'AOL-2024-004',
      amount: '$3,650',
      status: 'Paid',
      date: '2024-12-20',
      method: 'Direct Deposit'
    },
    {
      load: 'AOL-2024-003',
      amount: '$2,925',
      status: 'Paid',
      date: '2024-12-18',
      method: 'Direct Deposit'
    },
    {
      load: 'AOL-2024-002',
      amount: '$4,250',
      status: 'Pending',
      date: '2024-12-17',
      method: 'Direct Deposit'
    }
  ];

  const trainingModules = [
    {
      title: 'DOT Safety Regulations',
      progress: 100,
      status: 'Completed',
      score: 92
    },
    {
      title: 'Hours of Service Rules',
      progress: 100,
      status: 'Completed',
      score: 88
    },
    {
      title: 'Defensive Driving',
      progress: 65,
      status: 'In Progress',
      score: null
    },
    {
      title: 'Load Securement',
      progress: 0,
      status: 'Not Started',
      score: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Loaded': return 'bg-purple-100 text-purple-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Uploaded': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'loads', label: 'My Loads', icon: Truck },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'training', label: 'Training', icon: Book }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Driver Portal
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.firstName}! Manage your loads and stay connected.
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Driver Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {driverStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
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
        <div className="flex flex-wrap gap-1 bg-muted rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center sm:flex-none ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Assigned Loads */}
      {activeTab === 'loads' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          {assignedLoads.map((load, index) => (
            <Card key={load.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>{load.id}</span>
                      <Badge className={getStatusColor(load.status)}>
                        {load.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{load.broker}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{load.rate}</p>
                    <p className="text-sm text-muted-foreground">{load.distance}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Route Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Route</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm"><strong>From:</strong> {load.pickup}</p>
                      <p className="text-sm"><strong>To:</strong> {load.delivery}</p>
                      <p className="text-sm"><strong>Commodity:</strong> {load.commodity}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium">Schedule</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm"><strong>Pickup:</strong> {load.pickup_date}</p>
                      <p className="text-sm"><strong>Delivery:</strong> {load.delivery_date}</p>
                      <p className="text-sm"><strong>ETA:</strong> {load.eta}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{load.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${load.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {load.status === 'Pending' && (
                    <Button size="sm" className="flex items-center space-x-1">
                      <Play className="w-4 h-4" />
                      <span>Start Trip</span>
                    </Button>
                  )}
                  {load.status === 'In Transit' && (
                    <>
                      <Button size="sm" className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Delivered</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <Camera className="w-4 h-4" />
                        <span>Upload POD</span>
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <Navigation className="w-4 h-4" />
                    <span>Get Directions</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
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
                    <FileText className="w-5 h-5" />
                    <span>Document Management</span>
                  </CardTitle>
                  <CardDescription>
                    Upload and manage your trip documents
                  </CardDescription>
                </div>
                <Button className="flex items-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>Upload Document</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDocuments.map((doc, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-foreground">{doc.type}</p>
                        <p className="text-sm text-muted-foreground">{doc.load}</p>
                        <p className="text-xs text-muted-foreground">{doc.date} at {doc.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Payment History</span>
              </CardTitle>
              <CardDescription>
                Track your earnings and payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{payment.load}</p>
                      <p className="text-sm text-muted-foreground">{payment.method}</p>
                      <p className="text-xs text-muted-foreground">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{payment.amount}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Training Tab */}
      {activeTab === 'training' && user?.hasTrainingAccess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Book className="w-5 h-5" />
                <span>Training Modules</span>
              </CardTitle>
              <CardDescription>
                Complete required training and improve your skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingModules.map((module, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">{module.title}</h3>
                        <Badge className={getStatusColor(module.status)}>
                          {module.status}
                        </Badge>
                      </div>
                      {module.score && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className="font-bold text-green-600">{module.score}%</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">{module.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {module.status === 'Not Started' && (
                        <Button size="sm">Start Module</Button>
                      )}
                      {module.status === 'In Progress' && (
                        <Button size="sm">Continue</Button>
                      )}
                      {module.status === 'Completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Certificate
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Training Access Denied */}
      {activeTab === 'training' && !user?.hasTrainingAccess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <Book className="w-12 h-12 text-muted-foreground mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Training Access Required
                </h3>
                <p className="text-muted-foreground">
                  Contact your administrator to enable training access
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DriverDashboard;
