import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, Clock, CheckCircle, Navigation } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

const MyLoads: React.FC = () => {
  const loads = [
    { id: 'AOL-2024-001', pickup: 'Los Angeles, CA', delivery: 'Phoenix, AZ', status: 'In Transit', weight: '45,000 lbs', distance: '372 miles', eta: '4:30 PM' },
    { id: 'AOL-2024-005', pickup: 'San Diego, CA', delivery: 'Las Vegas, NV', status: 'Assigned', weight: '38,500 lbs', distance: '332 miles', eta: 'Tomorrow 2:00 PM' },
    { id: 'AOL-2024-003', pickup: 'Phoenix, AZ', delivery: 'Albuquerque, NM', status: 'Pending', weight: '42,300 lbs', distance: '450 miles', eta: 'Jan 25, 10:00 AM' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit': return 'bg-blue-100 text-blue-800';
      case 'Assigned': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Loads</h1>
          <p className="text-muted-foreground mt-2">View and manage your assigned freight loads</p>
        </div>
      </motion.div>

      <div className="grid gap-4">
        {loads.map((load) => (
          <motion.div
            key={load.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{load.id}</CardTitle>
                    <CardDescription className="flex items-center space-x-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{load.pickup} → {load.delivery}</span>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(load.status)}>
                    {load.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-medium">{load.weight}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="font-medium">{load.distance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ETA</p>
                    <p className="font-medium flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{load.eta}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{load.status}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {load.status === 'In Transit' && (
                    <>
                      <Button size="sm" className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Complete Delivery</span>
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center space-x-1">
                        <Navigation className="w-4 h-4" />
                        <span>Navigate</span>
                      </Button>
                    </>
                  )}
                  {load.status === 'Assigned' && (
                    <Button size="sm" className="flex items-center space-x-1">
                      <Truck className="w-4 h-4" />
                      <span>Start Trip</span>
                    </Button>
                  )}
                  {load.status === 'Pending' && (
                    <Button size="sm" variant="outline" disabled>
                      Waiting for Assignment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyLoads;
