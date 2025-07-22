import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Video, 
  FileText, 
  Image,
  Plus,
  Upload,
  Play,
  Download,
  CheckCircle,
  Clock,
  Users,
  Youtube
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface TrainingModule {
  id: string
  title: string
  description: string
  type: 'video' | 'pdf' | 'youtube' | 'image'
  url: string
  duration?: number // in minutes
  uploadedBy: string
  uploadedAt: Date
  category: string
  completed: boolean
  completedBy?: string[]
}

const mockTrainingModules: TrainingModule[] = [
  {
    id: '1',
    title: 'DOT Safety Regulations',
    description: 'Complete overview of Department of Transportation safety requirements',
    type: 'pdf',
    url: '/training/dot-safety.pdf',
    uploadedBy: 'admin@aol.com',
    uploadedAt: new Date('2024-01-10'),
    category: 'Safety',
    completed: true,
    completedBy: ['driver@aol.com', 'dispatcher@aol.com']
  },
  {
    id: '2',
    title: 'Vehicle Inspection Training',
    description: 'Step-by-step guide for daily vehicle inspections',
    type: 'video',
    url: '/training/vehicle-inspection.mp4',
    duration: 45,
    uploadedBy: 'admin@aol.com',
    uploadedAt: new Date('2024-01-12'),
    category: 'Operations',
    completed: false
  },
  {
    id: '3',
    title: 'Hours of Service Rules',
    description: 'Understanding HOS regulations and ELD requirements',
    type: 'youtube',
    url: 'https://youtube.com/watch?v=example',
    duration: 30,
    uploadedBy: 'admin@aol.com',
    uploadedAt: new Date('2024-01-14'),
    category: 'Compliance',
    completed: false
  },
  {
    id: '4',
    title: 'Load Securement Guide',
    description: 'Proper techniques for securing different types of cargo',
    type: 'image',
    url: '/training/load-securement.jpg',
    uploadedBy: 'dispatcher@aol.com',
    uploadedAt: new Date('2024-01-15'),
    category: 'Operations',
    completed: true
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

const TrainingModuleCard: React.FC<{ 
  module: TrainingModule; 
  onComplete: (id: string) => void;
  canEdit: boolean;
}> = ({ module, onComplete, canEdit }) => {
  const getTypeIcon = () => {
    switch (module.type) {
      case 'video': return Video
      case 'pdf': return FileText
      case 'youtube': return Youtube
      case 'image': return Image
      default: return FileText
    }
  }

  const getTypeColor = () => {
    switch (module.type) {
      case 'video': return 'text-purple-500'
      case 'pdf': return 'text-red-500'
      case 'youtube': return 'text-red-600'
      case 'image': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Safety': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'Operations': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Compliance': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const IconComponent = getTypeIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn(
        "hover:shadow-lg transition-all duration-300 cursor-pointer",
        module.completed && "border-green-200 bg-green-50/50 dark:bg-green-900/10"
      )}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={cn(
                "p-2 rounded-lg bg-muted",
                module.completed && "bg-green-100 dark:bg-green-900"
              )}>
                <IconComponent size={20} className={getTypeColor()} />
              </div>
              
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {module.title}
                  {module.completed && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  {module.description}
                </CardDescription>
              </div>
            </div>
            
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              getCategoryColor(module.category)
            )}>
              {module.category}
            </span>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center space-x-4">
              <span>By {module.uploadedBy}</span>
              <span>{formatDate(module.uploadedAt)}</span>
              {module.duration && (
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{module.duration}m</span>
                </div>
              )}
            </div>
          </div>

          {module.completedBy && module.completedBy.length > 0 && (
            <div className="mb-4 p-3 bg-muted/50 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Users size={14} />
                <span className="text-sm font-medium">
                  Completed by {module.completedBy.length} user(s)
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {module.completedBy.join(', ')}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {!module.completed ? (
              <>
                <Button 
                  onClick={() => onComplete(module.id)}
                  className="gap-2"
                >
                  <Play size={16} />
                  Start Training
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download size={16} />
                  Download
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="gap-2">
                  <CheckCircle size={16} />
                  Completed
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download size={16} />
                  Download
                </Button>
              </>
            )}
            
            {canEdit && (
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const UploadTrainingCard: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload size={20} />
          Upload Training Content
        </CardTitle>
        <CardDescription>
          Add new training materials for your team
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <FileText size={24} />
            <span className="text-sm">PDF Document</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Video size={24} />
            <span className="text-sm">Video File</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Youtube size={24} />
            <span className="text-sm">YouTube Link</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Image size={24} />
            <span className="text-sm">Image/Diagram</span>
          </Button>
        </div>

        <div className="space-y-3">
          <Input placeholder="Training module title..." />
          <Input placeholder="Description..." />
          <Input placeholder="Category (Safety, Operations, Compliance)..." />
          <Input placeholder="YouTube URL (if applicable)..." />
        </div>

        <Button className="w-full gap-2">
          <Upload size={16} />
          Upload Training Material
        </Button>
      </CardContent>
    </Card>
  )
}

export const TrainingDashboard: React.FC = () => {
  const [modules, setModules] = useState(mockTrainingModules)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { user } = useAuth()

  const canEdit = user?.role === 'admin'

  const handleCompleteModule = (moduleId: string) => {
    setModules(prev => 
      prev.map(module => 
        module.id === moduleId 
          ? { ...module, completed: true }
          : module
      )
    )
  }

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const completedCount = modules.filter(m => m.completed).length
  const totalModules = modules.length
  const completionRate = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0

  const categories = ['all', ...Array.from(new Set(modules.map(m => m.category)))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Training Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Access training materials and track your progress
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Modules"
          value={totalModules}
          description="Available training modules"
          icon={BookOpen}
          color="text-blue-500"
        />
        <StatsCard
          title="Completed"
          value={completedCount}
          description="Modules completed"
          icon={CheckCircle}
          color="text-green-500"
        />
        <StatsCard
          title="Completion Rate"
          value={`${completionRate}%`}
          description="Training progress"
          icon={Users}
          color="text-purple-500"
        />
        <StatsCard
          title="This Month"
          value="3"
          description="New modules added"
          icon={Plus}
          color="text-orange-500"
        />
      </div>

      {/* Upload Section (Admin Only) */}
      {canEdit && <UploadTrainingCard />}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search training modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredModules.map((module) => (
          <TrainingModuleCard
            key={module.id}
            module={module}
            onComplete={handleCompleteModule}
            canEdit={canEdit}
          />
        ))}
      </div>

      {filteredModules.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Training Modules Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No training modules are available at this time.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
