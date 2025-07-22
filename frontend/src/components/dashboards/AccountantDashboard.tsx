import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  CreditCard,
  Plus,
  Download,
  Send,
  Filter,
  Calendar,
  Receipt
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

interface Invoice {
  id: string
  loadNumber: string
  customerName: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: Date
  sentDate?: Date
  paidDate?: Date
  paymentMethod?: 'quick_pay' | 'zelle' | 'ach' | 'check'
}

interface Expense {
  id: string
  category: 'fuel' | 'maintenance' | 'tolls' | 'permits' | 'other'
  description: string
  amount: number
  date: Date
  receipt?: string
  truckNumber?: string
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    loadNumber: 'RC-2024-001',
    customerName: 'ABC Logistics',
    amount: 2500,
    status: 'paid',
    dueDate: new Date('2024-01-20'),
    sentDate: new Date('2024-01-16'),
    paidDate: new Date('2024-01-18'),
    paymentMethod: 'quick_pay'
  },
  {
    id: '2',
    loadNumber: 'RC-2024-002',
    customerName: 'XYZ Freight',
    amount: 3200,
    status: 'sent',
    dueDate: new Date('2024-01-25'),
    sentDate: new Date('2024-01-18')
  },
  {
    id: '3',
    loadNumber: 'RC-2024-003',
    customerName: 'DEF Transport',
    amount: 1800,
    status: 'draft',
    dueDate: new Date('2024-01-22')
  }
]

const mockExpenses: Expense[] = [
  {
    id: '1',
    category: 'fuel',
    description: 'Diesel fuel - Phoenix, AZ',
    amount: 420.50,
    date: new Date('2024-01-15'),
    truckNumber: 'T-456'
  },
  {
    id: '2',
    category: 'maintenance',
    description: 'Oil change and inspection',
    amount: 180.00,
    date: new Date('2024-01-14'),
    truckNumber: 'T-123'
  },
  {
    id: '3',
    category: 'tolls',
    description: 'Highway tolls - CA to AZ',
    amount: 45.75,
    date: new Date('2024-01-13'),
    truckNumber: 'T-456'
  }
]

interface StatsCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  trend?: number
  color?: string
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
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
          <p className="text-xs text-muted-foreground flex items-center">
            {trend !== undefined && (
              <span className={cn("mr-1", trend > 0 ? "text-green-500" : "text-red-500")}>
                {trend > 0 ? "+" : ""}{trend}%
              </span>
            )}
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const InvoiceTable: React.FC = () => {
  const [invoices, setInvoices] = useState(mockInvoices)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredInvoices = invoices.filter(invoice =>
    invoice.loadNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Invoice Management</CardTitle>
            <CardDescription>
              Create, send, and track customer invoices
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="gap-2">
              <Download size={16} />
              Export
            </Button>
            <Button className="gap-2">
              <Plus size={16} />
              New Invoice
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Input
              placeholder="Search invoices..."
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
                <th className="text-left py-3 px-4 font-medium">Invoice</th>
                <th className="text-left py-3 px-4 font-medium">Customer</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Due Date</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice, index) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium">INV-{invoice.id.padStart(4, '0')}</p>
                      <p className="text-sm text-muted-foreground">{invoice.loadNumber}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium">{invoice.customerName}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-green-600">
                      {formatCurrency(invoice.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium capitalize",
                      getStatusColor(invoice.status)
                    )}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      {invoice.status === 'draft' && (
                        <Button size="sm" className="gap-1">
                          <Send size={12} />
                          Send
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <FileText size={12} />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download size={12} />
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

const ExpenseTable: React.FC = () => {
  const [expenses, setExpenses] = useState(mockExpenses)

  const getCategoryColor = (category: Expense['category']) => {
    switch (category) {
      case 'fuel': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'maintenance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'tolls': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'permits': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Expense Tracking</CardTitle>
            <CardDescription>
              Track fuel, maintenance, and operational expenses
            </CardDescription>
          </div>
          <Button className="gap-2">
            <Plus size={16} />
            Add Expense
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Category</th>
                <th className="text-left py-3 px-4 font-medium">Description</th>
                <th className="text-left py-3 px-4 font-medium">Truck</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="py-4 px-4 text-sm">
                    {formatDate(expense.date)}
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium capitalize",
                      getCategoryColor(expense.category)
                    )}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm">{expense.description}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium">{expense.truckNumber || '-'}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-red-600">
                      -{formatCurrency(expense.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Button variant="ghost" size="sm">
                      <Receipt size={14} />
                    </Button>
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

export const AccountantDashboard: React.FC = () => {
  const totalRevenue = mockInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalExpenses = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const netProfit = totalRevenue - totalExpenses

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Accounting Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage invoices, track expenses, and monitor financial performance
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          description="This month"
          icon={DollarSign}
          trend={15}
          color="text-green-500"
        />
        <StatsCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          description="This month"
          icon={CreditCard}
          trend={-5}
          color="text-red-500"
        />
        <StatsCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          description="This month"
          icon={TrendingUp}
          trend={22}
          color="text-blue-500"
        />
        <StatsCard
          title="Outstanding"
          value={formatCurrency(5000)}
          description="Pending payments"
          icon={FileText}
          color="text-orange-500"
        />
      </div>

      {/* Invoice Management */}
      <InvoiceTable />

      {/* Expense Tracking */}
      <ExpenseTable />
    </div>
  )
}
