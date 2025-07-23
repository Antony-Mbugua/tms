import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Search, Filter, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    { id: 1, firstName: 'John', lastName: 'Smith', email: 'john.smith@aoltms.com', role: 'driver', status: 'active', hasTrainingAccess: true, mfaEnabled: false },
    { id: 2, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@aoltms.com', role: 'dispatcher', status: 'active', hasTrainingAccess: true, mfaEnabled: true },
    { id: 3, firstName: 'Mike', lastName: 'Davis', email: 'mike.davis@aoltms.com', role: 'accountant', status: 'active', hasTrainingAccess: false, mfaEnabled: true },
    { id: 4, firstName: 'Carlos', lastName: 'Martinez', email: 'carlos.martinez@aoltms.com', role: 'driver', status: 'active', hasTrainingAccess: true, mfaEnabled: false }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-2">Manage user accounts, roles, and permissions</p>
          </div>
          <Button className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Create User</span>
          </Button>
        </div>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>All Users</span>
          </CardTitle>
          <CardDescription>Complete list of system users with their roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
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

          {/* Users Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-6 py-3 border-b">
              <div className="grid grid-cols-7 gap-4 text-sm font-medium text-muted-foreground">
                <div>Name</div>
                <div>Email</div>
                <div>Role</div>
                <div>Status</div>
                <div>Training Access</div>
                <div>MFA</div>
                <div>Actions</div>
              </div>
            </div>
            <div className="divide-y">
              {users.map((user) => (
                <div key={user.id} className="px-6 py-4 hover:bg-muted/20">
                  <div className="grid grid-cols-7 gap-4 items-center">
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant={user.hasTrainingAccess ? 'default' : 'secondary'}>
                        {user.hasTrainingAccess ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant={user.mfaEnabled ? 'default' : 'secondary'}>
                        {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
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

export default UserManagement;
