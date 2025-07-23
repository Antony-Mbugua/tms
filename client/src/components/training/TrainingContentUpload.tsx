import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, Video, Image, FileText, File, X, Check, AlertTriangle,
  PlayCircle, Eye, Download, Trash2, Plus, Search, Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';

interface TrainingContentUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  type: 'video' | 'image' | 'pdf' | 'doc';
  size: string;
  url: string;
  uploadedAt: string;
  status: 'uploading' | 'completed' | 'failed';
  progress?: number;
}

const TrainingContentUpload: React.FC<TrainingContentUploadProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'Safety Training Video.mp4',
      type: 'video',
      size: '25.3 MB',
      url: '/videos/safety-training.mp4',
      uploadedAt: '2025-01-15T10:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      name: 'DOT Regulations.pdf',
      type: 'pdf',
      size: '2.1 MB',
      url: '/docs/dot-regulations.pdf',
      uploadedAt: '2025-01-14T15:45:00Z',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Vehicle Inspection Guide.docx',
      type: 'doc',
      size: '1.5 MB',
      url: '/docs/inspection-guide.docx',
      uploadedAt: '2025-01-13T09:20:00Z',
      status: 'completed'
    }
  ]);

  const [moduleData, setModuleData] = useState({
    title: '',
    description: '',
    requiredRoles: [],
    category: 'safety',
    duration: '',
    difficulty: 'beginner'
  });

  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'upload', label: 'Upload Content', icon: Upload },
    { id: 'library', label: 'Content Library', icon: FileText },
    { id: 'modules', label: 'Training Modules', icon: Video }
  ];

  const fileTypes = [
    { type: 'video', label: 'Videos', icon: Video, accept: '.mp4,.mov,.avi,.mkv', color: 'text-red-600 bg-red-100' },
    { type: 'image', label: 'Images', icon: Image, accept: '.jpg,.jpeg,.png,.gif', color: 'text-blue-600 bg-blue-100' },
    { type: 'pdf', label: 'PDFs', icon: FileText, accept: '.pdf', color: 'text-green-600 bg-green-100' },
    { type: 'doc', label: 'Documents', icon: File, accept: '.doc,.docx,.txt', color: 'text-purple-600 bg-purple-100' }
  ];

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileUpload = (files: File[]) => {
    files.forEach((file) => {
      const fileType = getFileType(file.name);
      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: fileType,
        size: formatFileSize(file.size),
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        status: 'uploading',
        progress: 0
      };

      setUploadedFiles(prev => [newFile, ...prev]);

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => {
          if (f.id === newFile.id && f.status === 'uploading') {
            const newProgress = (f.progress || 0) + 10;
            if (newProgress >= 100) {
              clearInterval(uploadInterval);
              addNotification(`${file.name} uploaded successfully`, 'success');
              return { ...f, progress: 100, status: 'completed' };
            }
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 200);
    });
  };

  const getFileType = (fileName: string): 'video' | 'image' | 'pdf' | 'doc' => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext || '')) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    return 'doc';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'image': return Image;
      case 'pdf': return FileText;
      default: return File;
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    addNotification('File deleted successfully', 'success');
  };

  const handleCreateModule = () => {
    addNotification('Training module created successfully', 'success');
    setModuleData({
      title: '',
      description: '',
      requiredRoles: [],
      category: 'safety',
      duration: '',
      difficulty: 'beginner'
    });
  };

  const filteredFiles = uploadedFiles.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-background rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Training Content Management</h2>
            <p className="text-muted-foreground">Upload and manage training materials</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 h-[calc(90vh-200px)] overflow-y-auto">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* File Type Selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {fileTypes.map((fileType) => (
                  <Card key={fileType.type} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className={`w-12 h-12 rounded-lg ${fileType.color} flex items-center justify-center mb-3`}>
                        <fileType.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-sm">{fileType.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {fileType.accept.replace(/\./g, '').toUpperCase()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Drag and Drop Upload */}
              <Card>
                <CardContent className="p-8">
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                      dragActive ? 'border-primary bg-primary/5' : 'border-muted'
                    }`}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Upload Training Content</h3>
                    <p className="text-muted-foreground mb-4">
                      Drag and drop files here or click to browse
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      Support for videos, images, PDFs, and documents up to 100MB
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Uploads */}
              {uploadedFiles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Uploads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {uploadedFiles.slice(0, 3).map((file) => {
                        const Icon = getFileIcon(file.type);
                        return (
                          <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <div className={`p-2 rounded ${
                              file.type === 'video' ? 'bg-red-100 text-red-600' :
                              file.type === 'image' ? 'bg-blue-100 text-blue-600' :
                              file.type === 'pdf' ? 'bg-green-100 text-green-600' :
                              'bg-purple-100 text-purple-600'
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{file.size}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {file.status === 'uploading' && (
                                <div className="w-16 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${file.progress}%` }}
                                  />
                                </div>
                              )}
                              {file.status === 'completed' && (
                                <Badge variant="default" className="text-xs">
                                  <Check className="h-3 w-3 mr-1" />
                                  Complete
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Content Library Tab */}
          {activeTab === 'library' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
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

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map((file) => {
                  const Icon = getFileIcon(file.type);
                  return (
                    <Card key={file.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded ${
                            file.type === 'video' ? 'bg-red-100 text-red-600' :
                            file.type === 'image' ? 'bg-blue-100 text-blue-600' :
                            file.type === 'pdf' ? 'bg-green-100 text-green-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteFile(file.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-medium text-sm mb-1 truncate">{file.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{file.size}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Training Modules Tab */}
          {activeTab === 'modules' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Training Module</CardTitle>
                  <CardDescription>Combine content into structured training modules</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="moduleTitle">Module Title</Label>
                      <Input
                        id="moduleTitle"
                        value={moduleData.title}
                        onChange={(e) => setModuleData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Driver Safety Training"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={moduleData.category}
                        onChange={(e) => setModuleData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md bg-input"
                      >
                        <option value="safety">Safety</option>
                        <option value="compliance">Compliance</option>
                        <option value="operations">Operations</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={moduleData.description}
                      onChange={(e) => setModuleData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md bg-input"
                      rows={3}
                      placeholder="Describe the training module..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={moduleData.duration}
                        onChange={(e) => setModuleData(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <select
                        id="difficulty"
                        value={moduleData.difficulty}
                        onChange={(e) => setModuleData(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md bg-input"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>Required for Roles</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['Driver', 'Dispatcher', 'Accountant', 'IT Support'].map((role) => (
                        <div key={role} className="flex items-center space-x-2">
                          <Checkbox id={role.toLowerCase()} />
                          <Label htmlFor={role.toLowerCase()}>{role}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleCreateModule}>
                      Create Module
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Modules */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Modules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { title: 'Safety Training', category: 'Safety', duration: '45 min', completions: 15 },
                      { title: 'DOT Regulations', category: 'Compliance', duration: '30 min', completions: 12 },
                      { title: 'Vehicle Maintenance', category: 'Maintenance', duration: '60 min', completions: 8 }
                    ].map((module, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded">
                            <Video className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{module.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {module.category} • {module.duration} • {module.completions} completions
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 space-y-2 z-50">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className={`p-3 rounded-lg shadow-lg max-w-sm ${
                  notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                  notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                  'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                <p className="text-sm font-medium">{notification.message}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TrainingContentUpload;
