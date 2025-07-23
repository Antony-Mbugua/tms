import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Plus, Search, Filter, Eye, Edit, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';

const LoadManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const loads = [
    { id: 'AOL-2024-001', pickup: 'Los Angeles, CA', delivery: 'Phoenix, AZ', driver: 'John Smith', status: 'In Transit', weight: '45,000 lbs', date: '2024-01-20' },
    { id: 'AOL-2024-002', pickup: 'Houston, TX', delivery: 'Dallas, TX', driver: 'Sarah Johnson', status: 'Delivered', weight: '38,500 lbs', date: '2024-01-19' },
    { id: 'AOL-2024-003', pickup: 'Miami, FL', delivery: 'Atlanta, GA', driver: 'Carlos Martinez', status: 'Pending', weight: '42,300 lbs', date: '2024-01-21' },
    { id: 'AOL-2024-004', pickup: 'Chicago, IL', delivery: 'Detroit, MI', driver: 'Mike Davis', status: 'Loading', weight: '47,800 lbs', date: '2024-01-20' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'In Transit': return 'bg-blue-100 text-blue-800';
      case 'Loading': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Load Management</h1>
            <p className="text-muted-foreground mt-2">Monitor and manage all freight loads</p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Load</span>
          </Button>
        </div>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5" />
            <span>Active Loads</span>
          </CardTitle>
          <CardDescription>All freight loads in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search loads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
          </div>

          {/* Loads Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-6 py-3 border-b">
              <div className="grid grid-cols-7 gap-4 text-sm font-medium text-muted-foreground">
                <div>Load ID</div>
                <div>Route</div>
                <div>Driver</div>
                <div>Weight</div>
                <div>Status</div>
                <div>Date</div>
                <div>Actions</div>
              </div>
            </div>
            <div className="divide-y">
              {loads.map((load) => (
                <div key={load.id} className="px-6 py-4 hover:bg-muted/20">
                  <div className="grid grid-cols-7 gap-4 items-center">
                    <div className="font-medium">{load.id}</div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{load.pickup}</span>
                        </div>
                        <div className="text-muted-foreground">→ {load.delivery}</div>
                      </div>
                    </div>
                    <div className="text-sm">{load.driver}</div>
                    <div className="text-sm">{load.weight}</div>
                    <div>
                      <Badge className={getStatusColor(load.status)}>
                        {load.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{load.date}</div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadManagement;
