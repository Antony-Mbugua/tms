import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Image, 
  Download, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Paperclip
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatDate } from '@/lib/utils'

interface Document {
  id: string
  name: string
  type: 'pdf' | 'image' | 'other'
  size: number
  uploadedBy: string
  uploadedAt: Date
  category: string
  url: string
}

interface DocumentManagerProps {
  title: string
  description: string
  allowedTypes?: string[]
  category?: string
  documents?: Document[]
  onUpload?: (files: FileList) => void
  onDelete?: (documentId: string) => void
  onView?: (document: Document) => void
  showUpload?: boolean
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'BOL_RC-2024-001.pdf',
    type: 'pdf',
    size: 2048000,
    uploadedBy: 'driver@aol.com',
    uploadedAt: new Date('2024-01-15'),
    category: 'BOL',
    url: '/documents/bol_1.pdf'
  },
  {
    id: '2',
    name: 'Load_Photo_001.jpg',
    type: 'image',
    size: 1536000,
    uploadedBy: 'driver@aol.com',
    uploadedAt: new Date('2024-01-15'),
    category: 'Load Photos',
    url: '/documents/load_1.jpg'
  },
  {
    id: '3',
    name: 'Fuel_Receipt_Phoenix.pdf',
    type: 'pdf',
    size: 512000,
    uploadedBy: 'driver@aol.com',
    uploadedAt: new Date('2024-01-14'),
    category: 'Receipts',
    url: '/documents/fuel_1.pdf'
  }
]

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (type: Document['type']) => {
  switch (type) {
    case 'pdf': return FileText
    case 'image': return Image
    default: return Paperclip
  }
}

const getFileTypeColor = (type: Document['type']) => {
  switch (type) {
    case 'pdf': return 'text-red-500'
    case 'image': return 'text-green-500'
    default: return 'text-blue-500'
  }
}

const DropZone: React.FC<{ 
  onDrop: (files: FileList) => void
  allowedTypes?: string[]
}> = ({ onDrop, allowedTypes }) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      onDrop(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onDrop(e.target.files)
    }
  }

  return (
    <motion.div
      className={cn(
        "border-2 border-dashed rounded-2xl p-8 text-center transition-colors",
        isDragging 
          ? "border-primary bg-primary/10" 
          : "border-muted-foreground/25 hover:border-primary/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Upload size={48} className="mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Drop files here</h3>
      <p className="text-muted-foreground mb-4">
        or click to browse files
      </p>
      
      <input
        type="file"
        multiple
        accept={allowedTypes?.join(',') || '*'}
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      
      <Button asChild>
        <label htmlFor="file-upload" className="cursor-pointer">
          Select Files
        </label>
      </Button>
      
      {allowedTypes && (
        <p className="text-xs text-muted-foreground mt-2">
          Accepted formats: {allowedTypes.join(', ')}
        </p>
      )}
    </motion.div>
  )
}

const DocumentCard: React.FC<{
  document: Document
  onView?: (document: Document) => void
  onDelete?: (documentId: string) => void
}> = ({ document, onView, onDelete }) => {
  const IconComponent = getFileIcon(document.type)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="bg-card border border-border rounded-2xl p-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-muted rounded-xl">
            <IconComponent size={20} className={getFileTypeColor(document.type)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{document.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(document.size)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground mb-4">
        <div className="flex items-center space-x-2">
          <User size={12} />
          <span>{document.uploadedBy}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar size={12} />
          <span>{formatDate(document.uploadedAt)}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-muted rounded-full text-xs">
            {document.category}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onView?.(document)}
          className="flex-1 gap-2"
        >
          <Eye size={14} />
          View
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Download size={14} />
        </Button>
        
        {onDelete && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(document.id)}
            className="text-destructive hover:text-destructive gap-2"
          >
            <Trash2 size={14} />
          </Button>
        )}
      </div>
    </motion.div>
  )
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  title,
  description,
  allowedTypes,
  category,
  documents = mockDocuments,
  onUpload,
  onDelete,
  onView,
  showUpload = true
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(documents.map(doc => doc.category)))]

  const handleUpload = (files: FileList) => {
    onUpload?.(files)
    // Here you would typically upload files to your backend
    console.log('Uploading files:', Array.from(files).map(f => f.name))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText size={20} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Upload Zone */}
        {showUpload && (
          <DropZone 
            onDrop={handleUpload} 
            allowedTypes={allowedTypes}
          />
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onView={onView}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Documents Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No documents have been uploaded yet.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
