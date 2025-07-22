import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Lock, 
  Shield, 
  Bell, 
  Palette, 
  Phone, 
  Mail,
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  QrCode,
  Smartphone
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  emergencyContact: string
  emergencyPhone: string
}

interface SecuritySettings {
  mfaEnabled: boolean
  passwordChangeRequired: boolean
  sessionTimeout: number
  loginNotifications: boolean
}

interface PrivacySettings {
  dataSharing: boolean
  analyticsTracking: boolean
  marketingEmails: boolean
  profileVisibility: 'public' | 'private' | 'team'
}

const themeColors = [
  { name: 'blue', label: 'AOL Blue', class: 'bg-blue-500' },
  { name: 'green', label: 'Success Green', class: 'bg-green-500' },
  { name: 'orange', label: 'Energy Orange', class: 'bg-orange-500' },
  { name: 'purple', label: 'Premium Purple', class: 'bg-purple-500' },
  { name: 'red', label: 'Alert Red', class: 'bg-red-500' },
  { name: 'teal', label: 'Professional Teal', class: 'bg-teal-500' },
  { name: 'indigo', label: 'Corporate Indigo', class: 'bg-indigo-500' },
  { name: 'pink', label: 'Creative Pink', class: 'bg-pink-500' }
] as const

const ProfileSection: React.FC<{
  profileData: ProfileData
  setProfileData: (data: ProfileData) => void
  onSave: () => void
}> = ({ profileData, setProfileData, onSave }) => {
  const { user } = useAuth()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={20} />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and contact details
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={profileData.firstName}
              onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
              placeholder="Enter first name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={profileData.lastName}
              onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail size={16} />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            placeholder="Enter email address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone size={16} />
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            placeholder="Enter phone number"
          />
          <p className="text-xs text-muted-foreground">
            Used for account recovery and security notifications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
            <Input
              id="emergencyContact"
              value={profileData.emergencyContact}
              onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
              placeholder="Emergency contact name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
            <Input
              id="emergencyPhone"
              type="tel"
              value={profileData.emergencyPhone}
              onChange={(e) => setProfileData({ ...profileData, emergencyPhone: e.target.value })}
              placeholder="Emergency contact phone"
            />
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={16} />
            <span className="font-medium">Account Number</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Account: ****{user?.id?.slice(-4) || '1234'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Used for payroll and expense reimbursements
          </p>
        </div>

        <Button onClick={onSave} className="w-full">
          <Save size={16} className="mr-2" />
          Save Profile Changes
        </Button>
      </CardContent>
    </Card>
  )
}

const SecuritySection: React.FC<{
  securitySettings: SecuritySettings
  setSecuritySettings: (settings: SecuritySettings) => void
  onSave: () => void
}> = ({ securitySettings, setSecuritySettings, onSave }) => {
  const [showMFASetup, setShowMFASetup] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const toggleMFA = () => {
    if (!securitySettings.mfaEnabled) {
      setShowMFASetup(true)
    } else {
      setSecuritySettings({ ...securitySettings, mfaEnabled: false })
    }
  }

  const setupMFA = () => {
    // Simulate MFA setup
    setSecuritySettings({ ...securitySettings, mfaEnabled: true })
    setShowMFASetup(false)
    setMfaCode('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield size={20} />
          Security & Authentication
        </CardTitle>
        <CardDescription>
          Manage your account security settings and authentication methods
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* MFA Section */}
        <div className="border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <Smartphone size={16} />
                Two-Factor Authentication (MFA)
              </h4>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="flex items-center gap-2">
              {securitySettings.mfaEnabled ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <XCircle size={16} className="text-red-500" />
              )}
              <Button
                variant={securitySettings.mfaEnabled ? "destructive" : "default"}
                size="sm"
                onClick={toggleMFA}
              >
                {securitySettings.mfaEnabled ? 'Disable' : 'Enable'} MFA
              </Button>
            </div>
          </div>

          {showMFASetup && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 border-t pt-4"
            >
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg">
                    <QrCode size={64} />
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Scan this QR code with your Google Authenticator app
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mfaCode">Enter verification code from your app</Label>
                <Input
                  id="mfaCode"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={setupMFA} disabled={mfaCode.length !== 6}>
                  Complete Setup
                </Button>
                <Button variant="outline" onClick={() => setShowMFASetup(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Password Change Section */}
        <div className="border rounded-xl p-4">
          <h4 className="font-semibold flex items-center gap-2 mb-4">
            <Lock size={16} />
            Change Password
          </h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            
            <Button 
              size="sm" 
              disabled={!newPassword || newPassword !== confirmPassword}
            >
              Update Password
            </Button>
          </div>
        </div>

        {/* Session Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Login Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified of new login attempts
              </p>
            </div>
            <input
              type="checkbox"
              checked={securitySettings.loginNotifications}
              onChange={(e) => setSecuritySettings({ 
                ...securitySettings, 
                loginNotifications: e.target.checked 
              })}
              className="rounded"
            />
          </div>

          <div className="space-y-2">
            <Label>Session Timeout (minutes)</Label>
            <Input
              type="number"
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings({ 
                ...securitySettings, 
                sessionTimeout: parseInt(e.target.value) || 480 
              })}
              min={30}
              max={1440}
            />
          </div>
        </div>

        <Button onClick={onSave} className="w-full">
          <Save size={16} className="mr-2" />
          Save Security Settings
        </Button>
      </CardContent>
    </Card>
  )
}

const AppearanceSection: React.FC = () => {
  const { theme, setTheme, themeColor, setThemeColor, resetToDefault } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette size={20} />
          Appearance & Theme
        </CardTitle>
        <CardDescription>
          Customize the look and feel of your dashboard
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Theme Mode */}
        <div className="space-y-3">
          <Label>Theme Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'light', label: 'Light', icon: '☀️' },
              { value: 'dark', label: 'Dark', icon: '🌙' },
              { value: 'system', label: 'System', icon: '💻' }
            ].map((mode) => (
              <Button
                key={mode.value}
                variant={theme === mode.value ? "default" : "outline"}
                onClick={() => setTheme(mode.value as any)}
                className="justify-start"
              >
                <span className="mr-2">{mode.icon}</span>
                {mode.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Color Theme */}
        <div className="space-y-3">
          <Label>Color Theme</Label>
          <div className="grid grid-cols-4 gap-3">
            {themeColors.map((color) => (
              <button
                key={color.name}
                onClick={() => setThemeColor(color.name as any)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:scale-105",
                  themeColor === color.name 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg mb-2", color.class)} />
                <span className="text-xs font-medium">{color.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={resetToDefault} variant="outline">
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const PrivacySection: React.FC<{
  privacySettings: PrivacySettings
  setPrivacySettings: (settings: PrivacySettings) => void
  onSave: () => void
}> = ({ privacySettings, setPrivacySettings, onSave }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye size={20} />
          Privacy & Data
        </CardTitle>
        <CardDescription>
          Control how your data is used and shared
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Data Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Allow anonymized data sharing for service improvement
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.dataSharing}
              onChange={(e) => setPrivacySettings({ 
                ...privacySettings, 
                dataSharing: e.target.checked 
              })}
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Analytics Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Help us improve by tracking usage patterns
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.analyticsTracking}
              onChange={(e) => setPrivacySettings({ 
                ...privacySettings, 
                analyticsTracking: e.target.checked 
              })}
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features and services
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.marketingEmails}
              onChange={(e) => setPrivacySettings({ 
                ...privacySettings, 
                marketingEmails: e.target.checked 
              })}
              className="rounded"
            />
          </div>

          <div className="space-y-2">
            <Label>Profile Visibility</Label>
            <select
              value={privacySettings.profileVisibility}
              onChange={(e) => setPrivacySettings({ 
                ...privacySettings, 
                profileVisibility: e.target.value as any 
              })}
              className="w-full p-2 border border-input rounded-xl bg-background"
            >
              <option value="private">Private (Only you)</option>
              <option value="team">Team (Your organization)</option>
              <option value="public">Public (Everyone)</option>
            </select>
          </div>
        </div>

        <Button onClick={onSave} className="w-full">
          <Save size={16} className="mr-2" />
          Save Privacy Settings
        </Button>
      </CardContent>
    </Card>
  )
}

export const UserProfileSettings: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: ''
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    mfaEnabled: user?.mfaEnabled || false,
    passwordChangeRequired: false,
    sessionTimeout: 480,
    loginNotifications: true
  })

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataSharing: false,
    analyticsTracking: true,
    marketingEmails: false,
    profileVisibility: 'team'
  })

  const handleSaveProfile = () => {
    console.log('Saving profile:', profileData)
    // API call to save profile
  }

  const handleSaveSecurity = () => {
    console.log('Saving security settings:', securitySettings)
    // API call to save security settings
  }

  const handleSavePrivacy = () => {
    console.log('Saving privacy settings:', privacySettings)
    // API call to save privacy settings
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Eye }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile, security, and privacy preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'profile' && (
          <ProfileSection
            profileData={profileData}
            setProfileData={setProfileData}
            onSave={handleSaveProfile}
          />
        )}
        
        {activeTab === 'security' && (
          <SecuritySection
            securitySettings={securitySettings}
            setSecuritySettings={setSecuritySettings}
            onSave={handleSaveSecurity}
          />
        )}
        
        {activeTab === 'appearance' && <AppearanceSection />}
        
        {activeTab === 'privacy' && (
          <PrivacySection
            privacySettings={privacySettings}
            setPrivacySettings={setPrivacySettings}
            onSave={handleSavePrivacy}
          />
        )}
      </motion.div>
    </div>
  )
}
