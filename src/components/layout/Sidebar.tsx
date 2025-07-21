import React from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Users, 
  Truck, 
  FileText, 
  DollarSign, 
  Settings, 
  BookOpen,
  Shield,
  Package,
  Route,
  Receipt,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types/user'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  userRole?: UserRole
  hasTrainingAccess?: boolean
}

interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  href: string
  roles: UserRole[]
  requiresTraining?: boolean
}

const navItems: NavItem[] = [
  {
    icon: Home,
    label: 'Dashboard',
    href: '/admin',
    roles: ['admin']
  },
  {
    icon: Users,
    label: 'User Management',
    href: '/admin/users',
    roles: ['admin']
  },
  {
    icon: Truck,
    label: 'Fleet Management',
    href: '/admin/fleet',
    roles: ['admin']
  },
  {
    icon: Home,
    label: 'Dispatch',
    href: '/dispatcher',
    roles: ['dispatcher']
  },
  {
    icon: Package,
    label: 'Load Management',
    href: '/dispatcher/loads',
    roles: ['dispatcher']
  },
  {
    icon: Route,
    label: 'Trip Planning',
    href: '/dispatcher/trips',
    roles: ['dispatcher']
  },
  {
    icon: Home,
    label: 'My Trips',
    href: '/driver',
    roles: ['driver']
  },
  {
    icon: FileText,
    label: 'Documents',
    href: '/driver/documents',
    roles: ['driver']
  },
  {
    icon: Home,
    label: 'Accounting',
    href: '/accountant',
    roles: ['accountant']
  },
  {
    icon: DollarSign,
    label: 'Invoicing',
    href: '/accountant/invoicing',
    roles: ['accountant']
  },
  {
    icon: Receipt,
    label: 'Expenses',
    href: '/accountant/expenses',
    roles: ['accountant']
  },
  {
    icon: Home,
    label: 'System Monitor',
    href: '/it_support',
    roles: ['it_support']
  },
  {
    icon: Shield,
    label: 'Security Logs',
    href: '/it_support/security',
    roles: ['it_support']
  },
  {
    icon: BookOpen,
    label: 'Training',
    href: '/training',
    roles: ['admin', 'dispatcher', 'driver', 'accountant', 'it_support'],
    requiresTraining: true
  }
]

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  onToggle, 
  userRole,
  hasTrainingAccess 
}) => {
  const location = useLocation()

  const filteredNavItems = navItems.filter(item => {
    if (!userRole || !item.roles.includes(userRole)) return false
    if (item.requiresTraining && !hasTrainingAccess) return false
    return true
  })

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ 
        x: 0,
        width: collapsed ? 80 : 280 
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-card border-r border-border shadow-lg flex flex-col"
    >
      {/* Logo & Toggle */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <motion.div
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-3"
          >
            {!collapsed && (
              <>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Truck size={20} className="text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">AOL TMS</h1>
                  <p className="text-xs text-muted-foreground">Transport Management</p>
                </div>
              </>
            )}
          </motion.div>
          
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            {collapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavItems.map((item, index) => {
          const isActive = location.pathname === item.href || 
                          location.pathname.startsWith(item.href + '/')
          
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-3 rounded-2xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "hover:bg-accent text-muted-foreground hover:text-accent-foreground"
                )}
              >
                <item.icon 
                  size={20} 
                  className={cn(
                    "transition-colors",
                    isActive ? "text-primary-foreground" : "group-hover:text-accent-foreground"
                  )} 
                />
                
                <motion.span
                  animate={{ 
                    opacity: collapsed ? 0 : 1,
                    width: collapsed ? 0 : "auto"
                  }}
                  transition={{ duration: 0.2 }}
                  className="font-medium whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-border">
        <Link
          to="/settings"
          className="flex items-center space-x-3 px-3 py-3 rounded-2xl text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
        >
          <Settings size={20} />
          <motion.span
            animate={{ 
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : "auto"
            }}
            transition={{ duration: 0.2 }}
            className="font-medium whitespace-nowrap overflow-hidden"
          >
            Settings
          </motion.span>
        </Link>
      </div>
    </motion.aside>
  )
}
