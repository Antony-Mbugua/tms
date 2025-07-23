import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, FileText, TrendingUp, TrendingDown, CreditCard,
  Receipt, PieChart, BarChart3, Download, Send, Eye, Plus,
  AlertTriangle, CheckCircle, Clock, XCircle, Filter,
  Calculator, Banknote, Calendar, Users, Truck, Building
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../../contexts/AuthContext';

const AccountantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const financialStats = [
    {
      title: 'Monthly Revenue',
      value: '$85,420',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'December 2024'
    },
    {
      title: 'Outstanding Invoices',
      value: '$12,350',
      change: '-5.3%',
      changeType: 'negative' as const,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: '8 pending invoices'
    },
    {
      title: 'Monthly Expenses',
      value: '$23,180',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: Receipt,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Operating costs'
    },
    {
      title: 'Net Profit',
      value: '$62,240',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'After expenses'
    },
    {
      title: 'Accounts Receivable',
      value: '$34,890',
      change: '-3.2%',
      changeType: 'negative' as const,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Total outstanding'
    },
    {
      title: 'Cash Flow',
      value: '$18,560',
      change: '+6.8%',
      changeType: 'positive' as const,
      icon: Banknote,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Available cash'
    }
  ];

  const recentInvoices = [
    {
      id: 'INV-2024-001',
      broker: 'Express Logistics',
      load: 'AOL-2024-004',
      amount: '$3,650',
      status: 'Paid',
      due_date: '2024-12-20',
      sent_date: '2024-12-18',
      payment_method: 'Quick Pay'
    },
    {
      id: 'INV-2024-002',
      broker: 'National Freight',
      load: 'AOL-2024-005',
      amount: '$4,125',
      status: 'Overdue',
      due_date: '2024-12-14',
      sent_date: '2024-12-13',
      payment_method: 'Net 30'
    },
    {
      id: 'INV-2024-003',
      broker: 'Sunrise Transport',
      load: 'AOL-2024-003',
      amount: '$2,925',
      status: 'Sent',
      due_date: '2024-12-29',
      sent_date: '2024-12-22',
      payment_method: 'Net 15'
    },
    {
      id: 'INV-2024-004',
      broker: 'Reliable Routes',
      load: 'AOL-2024-006',
      amount: '$3,280',
      status: 'Draft',
      due_date: '2024-12-30',
      sent_date: null,
      payment_method: 'Quick Pay'
    }
  ];

  const expenses = [
    {
      id: 'EXP-001',
      type: 'Fuel',
      driver: 'John Smith',
      load: 'AOL-2024-001',
      amount: '$185.50',
      date: '2024-12-20',
      status: 'Approved',
      receipt: true
    },
    {
      id: 'EXP-002',
      type: 'Maintenance',
      driver: 'Carlos Martinez',
      load: 'AOL-2024-003',
      amount: '$145.00',
      date: '2024-12-19',
      status: 'Pending',
      receipt: true
    },
    {
      id: 'EXP-003',
      type: 'Tolls',
      driver: 'David Williams',
      load: 'AOL-2024-002',
      amount: '$35.50',
      date: '2024-12-21',
      status: 'Approved',
      receipt: false
    },
    {
      id: 'EXP-004',
      type: 'Repairs',
      driver: 'Robert Davis',
      load: 'AOL-2024-005',
      amount: '$285.75',
      date: '2024-12-18',
      status: 'Requires Receipt',
      receipt: false
    }
  ];

  const brokers = [
    {
      name: 'Express Logistics',
      credit_status: 'Approved',
      payment_terms: 'Quick Pay',
      outstanding: '$0',
      total_invoiced: '$45,890',
      avg_payment_days: 2.5,
      rating: 'Excellent'
    },
    {
      name: 'National Freight',
      credit_status: 'Approved',
      payment_terms: 'Net 30',
      outstanding: '$8,375',
      total_invoiced: '$67,250',
      avg_payment_days: 28.3,
      rating: 'Good'
    },
    {
      name: 'Quick Cargo Services',
      credit_status: 'Denied',
      payment_terms: 'Zelle',
      outstanding: '$4,520',
      total_invoiced: '$15,890',
      avg_payment_days: 45.8,
      rating: 'Poor'
    },
    {
      name: 'Reliable Routes',
      credit_status: 'Approved',
      payment_terms: 'Quick Pay',
      outstanding: '$3,280',
      total_invoiced: '$89,650',
      avg_payment_days: 1.2,
      rating: 'Excellent'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Sent': return 'bg-blue-100 text-blue-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Requires Receipt': return 'bg-red-100 text-red-800';
      case 'Denied': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCreditColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Denied': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'brokers', label: 'Brokers', icon: Building }
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
              Financial Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.firstName}! Manage invoices, expenses, and financial reports.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Generate Invoice</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Financial Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {financialStats.map((stat, index) => (
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
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs ${
                          stat.changeType === 'positive'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {stat.change} from last month
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5" />
                  <span>Financial Actions</span>
                </CardTitle>
                <CardDescription>
                  Quick access to common accounting tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button className="h-20 flex flex-col items-center space-y-2">
                    <FileText className="w-6 h-6" />
                    <span>Create Invoice</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                    <Receipt className="w-6 h-6" />
                    <span>Add Expense</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                    <PieChart className="w-6 h-6" />
                    <span>Generate Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                    <CreditCard className="w-6 h-6" />
                    <span>Payment Tracking</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Invoice Management</span>
                  </CardTitle>
                  <CardDescription>
                    Create, send, and track invoice payments
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.map((invoice, index) => (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-foreground">{invoice.id}</span>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{invoice.broker}</p>
                          <p className="text-sm text-muted-foreground">Load: {invoice.load}</p>
                        </div>

                        <div>
                          <p className="text-lg font-bold text-green-600">{invoice.amount}</p>
                          <p className="text-sm text-muted-foreground">{invoice.payment_method}</p>
                        </div>

                        <div>
                          <p className="text-sm"><strong>Due:</strong> {invoice.due_date}</p>
                          {invoice.sent_date && (
                            <p className="text-sm"><strong>Sent:</strong> {invoice.sent_date}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {invoice.status === 'Draft' && (
                            <Button size="sm" className="flex items-center space-x-1">
                              <Send className="w-4 h-4" />
                              <span>Send</span>
                            </Button>
                          )}
                          {invoice.status === 'Overdue' && (
                            <Button size="sm" variant="destructive" className="flex items-center space-x-1">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Follow Up</span>
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="w-5 h-5" />
                <span>Expense Management</span>
              </CardTitle>
              <CardDescription>
                Review and approve driver expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-foreground">{expense.id}</span>
                            <Badge className={getStatusColor(expense.status)}>
                              {expense.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{expense.type}</p>
                        </div>

                        <div>
                          <p className="text-sm"><strong>Driver:</strong> {expense.driver}</p>
                          <p className="text-sm"><strong>Load:</strong> {expense.load}</p>
                        </div>

                        <div>
                          <p className="text-lg font-bold text-foreground">{expense.amount}</p>
                          <p className="text-sm text-muted-foreground">{expense.date}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          {expense.status === 'Pending' && (
                            <>
                              <Button size="sm" className="flex items-center space-x-1">
                                <CheckCircle className="w-4 h-4" />
                                <span>Approve</span>
                              </Button>
                              <Button size="sm" variant="destructive" className="flex items-center space-x-1">
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                              </Button>
                            </>
                          )}
                          {expense.receipt && (
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Brokers Tab */}
      {activeTab === 'brokers' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Broker Credit Management</span>
              </CardTitle>
              <CardDescription>
                Monitor broker payment performance and credit status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {brokers.map((broker, index) => (
                  <motion.div
                    key={broker.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{broker.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getCreditColor(broker.credit_status)}>
                            {broker.credit_status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{broker.payment_terms}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <p className="font-medium text-foreground">{broker.rating}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Outstanding</p>
                        <p className="text-lg font-bold text-orange-600">{broker.outstanding}</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Invoiced</p>
                        <p className="text-lg font-bold text-green-600">{broker.total_invoiced}</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Avg Payment Days</p>
                        <p className="text-lg font-bold text-blue-600">{broker.avg_payment_days}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 mt-4">
                      {broker.credit_status === 'Approved' && broker.outstanding !== '$0' && (
                        <Button size="sm" variant="destructive">
                          Mark Credit Denied
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Payment History
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AccountantDashboard;
