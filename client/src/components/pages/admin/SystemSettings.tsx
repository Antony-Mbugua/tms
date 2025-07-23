import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, RefreshCw, Database, Shield, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    tokenExpiry: '24h',
    refreshTokenExpiry: '7d',
    maxLoginAttempts: 5,
    sessionTimeout: '2h',
    chatEnabled: true,
    maxMessageLength: 1000,
    fileUploadEnabled: true,
    maxFileSize: '10MB',
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false
  });

  const handleSave = () => {
    // Simulate saving settings
    console.log('Saving settings:', settings);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
            <p className="text-muted-foreground mt-2">Configure system-wide settings and preferences</p>
          </div>
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </motion.div>

      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Authentication Settings</span>
          </CardTitle>
          <CardDescription>Configure user authentication and security policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="token-expiry">Token Expiry</Label>
              <Input 
                id="token-expiry" 
                value={settings.tokenExpiry}
                onChange={(e) => setSettings({...settings, tokenExpiry: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refresh-token-expiry">Refresh Token Expiry</Label>
              <Input 
                id="refresh-token-expiry" 
                value={settings.refreshTokenExpiry}
                onChange={(e) => setSettings({...settings, refreshTokenExpiry: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
              <Input 
                id="max-login-attempts" 
                type="number" 
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout</Label>
              <Input 
                id="session-timeout" 
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Communication Settings</span>
          </CardTitle>
          <CardDescription>Configure chat system and messaging preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="chat-enabled" 
                  checked={settings.chatEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, chatEnabled: checked as boolean})}
                />
                <Label htmlFor="chat-enabled">Enable Chat System</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-message-length">Max Message Length</Label>
              <Input 
                id="max-message-length" 
                type="number" 
                value={settings.maxMessageLength}
                onChange={(e) => setSettings({...settings, maxMessageLength: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="file-upload" 
                  checked={settings.fileUploadEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, fileUploadEnabled: checked as boolean})}
                />
                <Label htmlFor="file-upload">Allow File Uploads</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-file-size">Max File Size</Label>
              <Input 
                id="max-file-size" 
                value={settings.maxFileSize}
                onChange={(e) => setSettings({...settings, maxFileSize: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>System Maintenance</span>
          </CardTitle>
          <CardDescription>System maintenance and operational settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Maintenance Mode</h3>
              <p className="text-sm text-muted-foreground">Enable maintenance mode to prevent user access during updates</p>
            </div>
            <Checkbox 
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked as boolean})}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center space-x-2 p-6 h-auto">
              <Database className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Backup Database</p>
                <p className="text-sm text-muted-foreground">Create system backup</p>
              </div>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 p-6 h-auto">
              <RefreshCw className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Clean Logs</p>
                <p className="text-sm text-muted-foreground">Remove old log entries</p>
              </div>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 p-6 h-auto">
              <Settings className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">System Health</p>
                <p className="text-sm text-muted-foreground">Check system status</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
