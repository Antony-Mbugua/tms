import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, Filter, Eye, Download, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';

const Invoices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const invoices = [
    { id: 'INV-2024-001', client: 'Express Logistics', amount: '$2,450.00', status: 'Paid', date: '2024-01-20', dueDate: '2024-02-19' },
    { id: 'INV-2024-002', client: 'Global Freight Co.', amount: '$3,250.00', status: 'Pending', date: '2024-01-19', dueDate: '2024-02-18' },
    { id: 'INV-2024-003', client: 'Swift Transport', amount: '$1,850.00', status: 'Overdue', date: '2024-01-15', dueDate: '2024-02-14' },
    { id: 'INV-2024-004', client: 'Metro Shipping', amount: '$4,100.00', status: 'Draft', date: '2024-01-21', dueDate: '2024-02-20' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = invoices.reduce((sum, invoice) => {
    return sum + parseFloat(invoice.amount.replace('$', '').replace(',', ''));
  }, 0);

  const paidAmount = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, invoice) => {
      return sum + parseFloat(invoice.amount.replace('$', '').replace(',', ''));
    }, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
            <p className="text-muted-foreground mt-2">Manage client invoices and billing</p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Invoiced</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">${paidAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Paid</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">${(totalAmount - paidAmount).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Outstanding</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{invoices.length}</p>
              <p className="text-sm text-muted-foreground">Total Invoices</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>All Invoices</span>
          </CardTitle>
          <CardDescription>Manage and track all client invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
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

          {/* Invoices Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-6 py-3 border-b">
              <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground">
                <div>Invoice ID</div>
                <div>Client</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Due Date</div>
                <div>Actions</div>
              </div>
            </div>
            <div className="divide-y">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="px-6 py-4 hover:bg-muted/20">
                  <div className="grid grid-cols-6 gap-4 items-center">
                    <div className="font-medium">{invoice.id}</div>
                    <div className="text-sm">{invoice.client}</div>
                    <div className="font-medium">{invoice.amount}</div>
                    <div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{invoice.dueDate}</div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      {invoice.status !== 'Paid' && (
                        <Button variant="ghost" size="sm">
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
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

export default Invoices;
