import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download, 
  Upload,
  Link,
  Trash2,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  HardDrive,
  Cloud,
  Image,
  FileText,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Lock,
  Key,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  BarChart3,
  Target,
  Trophy
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore } from '../store'
import { initDrive, uploadToDrive, listDriveFiles } from '../services/drive'
import { pickPhoto } from '../services/photos'

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { 
    darkMode, 
    toggleDarkMode,
    user, 
    notifications,
    toggleNotifications,
    language,
    setLanguage,
    isLoading 
  } = useAppStore()
  
  const [activeSection, setActiveSection] = useState('general')
  const [settings, setSettings] = useState({
    // General Settings
    theme: darkMode ? 'dark' : 'light',
    language: language || 'en',
    notifications: notifications,
    soundEnabled: true,
    autoSave: true,
    
    // Privacy Settings
    profileVisibility: 'public',
    shareProgress: true,
    allowAnalytics: true,
    
    // Study Settings
    defaultStudyDuration: 25,
    autoStartBreaks: true,
    dailyStudyGoal: 120, // minutes
    reminderFrequency: 'daily',
    
    // Cloud Integration
    googleDriveConnected: false,
    googlePhotosConnected: false,
    autoBackup: false,
    
    // Account Settings
    emailNotifications: true,
    marketingEmails: false,
    weeklyReports: true
  })
  
  const [isDriveLoading, setIsDriveLoading] = useState(false)
  const [isPhotosLoading, setIsPhotosLoading] = useState(false)
  const [driveFiles, setDriveFiles] = useState([])

  const sections = [
    { 
      id: 'general', 
      label: 'General', 
      icon: SettingsIcon,
      description: 'App preferences and basic settings'
    },
    { 
      id: 'account', 
      label: 'Account', 
      icon: User,
      description: 'Profile and account management'
    },
    { 
      id: 'privacy', 
      label: 'Privacy', 
      icon: Shield,
      description: 'Privacy and security settings'
    },
    { 
      id: 'study', 
      label: 'Study', 
      icon: BarChart3,
      description: 'Study preferences and goals'
    },
    { 
      id: 'cloud', 
      label: 'Cloud Storage', 
      icon: Cloud,
      description: 'Google Drive and Photos integration'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell,
      description: 'Notification preferences'
    }
  ]

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    
    // Apply certain settings immediately
    if (key === 'theme') {
      if (value === 'dark' && !darkMode) toggleDarkMode()
      if (value === 'light' && darkMode) toggleDarkMode()
    }
    if (key === 'language') {
      setLanguage(value)
      i18n.changeLanguage(value)
    }
    if (key === 'notifications') {
      if (value !== notifications) toggleNotifications()
    }
  }

  const connectGoogleDrive = async () => {
    setIsDriveLoading(true)
    try {
      await initDrive()
      const files = await listDriveFiles()
      setDriveFiles(files)
      setSettings(prev => ({ ...prev, googleDriveConnected: true }))
    } catch (error) {
      console.error('Failed to connect Google Drive:', error)
    } finally {
      setIsDriveLoading(false)
    }
  }

  const connectGooglePhotos = async () => {
    setIsPhotosLoading(true)
    try {
      // Initialize Google Photos API connection
      await pickPhoto()
      setSettings(prev => ({ ...prev, googlePhotosConnected: true }))
    } catch (error) {
      console.error('Failed to connect Google Photos:', error)
    } finally {
      setIsPhotosLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const data = {
        profile: user,
        settings,
        exportDate: new Date().toISOString(),
        studyData: {
          // Export study sessions, notes, flashcards, etc.
        }
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `aurevo-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  const saveSettings = async () => {
    try {
      // Save settings to backend/localStorage
      localStorage.setItem('aurevor-settings', JSON.stringify(settings))
      // toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      // toast.error('Failed to save settings')
    }
  }

  if (isLoading) {
    return (
      <div className={`h-screen grid place-items-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-600'}`}>
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"
          />
          <p>{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-slate-50'
    }`}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pb-20 grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6 mt-6">
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <Sidebar />
        </div>

        <motion.main 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-6"
        >
          {/* Page Header */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`rounded-2xl border shadow-sm p-6 bg-gradient-to-r ${
              darkMode 
                ? 'from-gray-800/50 via-gray-700/50 to-gray-800/50 border-gray-700' 
                : 'from-gray-50 via-white to-gray-50 border-gray-200'
            }`}
          >
            <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Settings
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Customize your Aurevo experience and manage your account
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6">
            {/* Settings Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-2xl border shadow-sm p-4 h-fit ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      whileHover={{ x: 5 }}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        activeSection === section.id
                          ? darkMode 
                            ? 'bg-violet-600/20 border border-violet-500/50' 
                            : 'bg-violet-50 border border-violet-200'
                          : darkMode 
                            ? 'hover:bg-gray-700' 
                            : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={
                          activeSection === section.id
                            ? 'text-violet-500'
                            : darkMode ? 'text-gray-400' : 'text-gray-500'
                        } />
                        <div>
                          <div className={`font-medium ${
                            activeSection === section.id
                              ? darkMode ? 'text-violet-300' : 'text-violet-700'
                              : darkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            {section.label}
                          </div>
                          <div className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {section.description}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>

            {/* Settings Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-2xl border shadow-sm p-6 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <AnimatePresence mode="wait">
                {/* General Settings */}
                {activeSection === 'general' && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      General Settings
                    </h2>

                    {/* Theme */}
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Palette size={16} className="inline mr-2" />
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'light', label: 'Light', icon: Sun },
                          { value: 'dark', label: 'Dark', icon: Moon },
                          { value: 'system', label: 'System', icon: Monitor }
                        ].map(({ value, label, icon: Icon }) => (
                          <motion.button
                            key={value}
                            onClick={() => handleSettingChange('theme', value)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              settings.theme === value
                                ? darkMode 
                                  ? 'border-violet-500 bg-violet-900/20' 
                                  : 'border-violet-500 bg-violet-50'
                                : darkMode 
                                  ? 'border-gray-600 hover:border-gray-500' 
                                  : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon size={20} className={`mx-auto mb-2 ${
                              settings.theme === value 
                                ? 'text-violet-500' 
                                : darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`} />
                            <div className={`text-sm font-medium ${
                              settings.theme === value 
                                ? 'text-violet-500' 
                                : darkMode ? 'text-white' : 'text-gray-800'
                            }`}>
                              {label}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Globe size={16} className="inline mr-2" />
                        Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="en">English</option>
                        <option value="bn">বাংলা</option>
                        <option value="hi">हिंदी</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>

                    {/* Sound */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className={`flex items-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {settings.soundEnabled ? <Volume2 size={16} className="mr-2" /> : <VolumeX size={16} className="mr-2" />}
                          Sound Effects
                        </label>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Enable sound notifications and effects
                        </p>
                      </div>
                      <motion.button
                        onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.soundEnabled ? 'bg-violet-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      >
                        <motion.div
                          animate={{ x: settings.soundEnabled ? 24 : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                        />
                      </motion.button>
                    </div>

                    {/* Auto Save */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className={`flex items-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <Save size={16} className="mr-2" />
                          Auto Save
                        </label>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Automatically save your progress
                        </p>
                      </div>
                      <motion.button
                        onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.autoSave ? 'bg-violet-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      >
                        <motion.div
                          animate={{ x: settings.autoSave ? 24 : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                        />
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Cloud Storage Settings */}
                {activeSection === 'cloud' && (
                  <motion.div
                    key="cloud"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Cloud Storage
                    </h2>

                    {/* Google Drive Integration */}
                    <div className={`p-4 rounded-lg border ${
                      darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <HardDrive className="text-blue-500" size={24} />
                          <div>
                            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              Google Drive
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Store your study documents and notes
                            </p>
                          </div>
                        </div>
                        <motion.button
                          onClick={connectGoogleDrive}
                          disabled={isDriveLoading}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            settings.googleDriveConnected
                              ? darkMode 
                                ? 'bg-green-600 text-white hover:bg-green-500' 
                                : 'bg-green-500 text-white hover:bg-green-400'
                              : darkMode 
                                ? 'bg-blue-600 text-white hover:bg-blue-500' 
                                : 'bg-blue-500 text-white hover:bg-blue-400'
                          }`}
                        >
                          {isDriveLoading ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : settings.googleDriveConnected ? (
                            'Connected'
                          ) : (
                            'Connect'
                          )}
                        </motion.button>
                      </div>
                      
                      {settings.googleDriveConnected && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Auto Backup
                            </span>
                            <motion.button
                              onClick={() => handleSettingChange('autoBackup', !settings.autoBackup)}
                              className={`relative w-10 h-5 rounded-full transition-colors ${
                                settings.autoBackup ? 'bg-green-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                              }`}
                            >
                              <motion.div
                                animate={{ x: settings.autoBackup ? 20 : 2 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
                              />
                            </motion.button>
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                                darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                            >
                              <Upload size={14} className="inline mr-1" />
                              Backup Now
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                                darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                            >
                              <Download size={14} className="inline mr-1" />
                              Restore
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Google Photos Integration */}
                    <div className={`p-4 rounded-lg border ${
                      darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Image className="text-pink-500" size={24} />
                          <div>
                            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              Google Photos
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Access photos for study materials
                            </p>
                          </div>
                        </div>
                        <motion.button
                          onClick={connectGooglePhotos}
                          disabled={isPhotosLoading}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            settings.googlePhotosConnected
                              ? darkMode 
                                ? 'bg-green-600 text-white hover:bg-green-500' 
                                : 'bg-green-500 text-white hover:bg-green-400'
                              : darkMode 
                                ? 'bg-pink-600 text-white hover:bg-pink-500' 
                                : 'bg-pink-500 text-white hover:bg-pink-400'
                          }`}
                        >
                          {isPhotosLoading ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : settings.googlePhotosConnected ? (
                            'Connected'
                          ) : (
                            'Connect'
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Data Export */}
                    <div className={`p-4 rounded-lg border ${
                      darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="text-green-500" size={24} />
                          <div>
                            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              Data Export
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Download all your data
                            </p>
                          </div>
                        </div>
                        <motion.button
                          onClick={exportData}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            darkMode 
                              ? 'bg-green-600 text-white hover:bg-green-500' 
                              : 'bg-green-500 text-white hover:bg-green-400'
                          }`}
                        >
                          <Download size={16} className="mr-2 inline" />
                          Export
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Account Settings */}
                {activeSection === 'account' && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Account Settings
                    </h2>

                    {/* Profile Information */}
                    <div className={`p-4 rounded-lg border ${
                      darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Profile Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className={`w-full px-3 py-2 rounded-lg border opacity-50 ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-gray-100 border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Display Name
                          </label>
                          <input
                            type="text"
                            defaultValue={user?.displayName || ''}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Account Actions */}
                    <div className={`p-4 rounded-lg border ${
                      darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Account Actions
                      </h3>
                      <div className="space-y-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          className={`w-full p-3 rounded-lg text-left flex items-center gap-3 ${
                            darkMode ? 'bg-blue-900/30 hover:bg-blue-900/50' : 'bg-blue-50 hover:bg-blue-100'
                          }`}
                        >
                          <Key className="text-blue-500" size={20} />
                          <div>
                            <div className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                              Change Password
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              Update your account password
                            </div>
                          </div>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          className={`w-full p-3 rounded-lg text-left flex items-center gap-3 ${
                            darkMode ? 'bg-red-900/30 hover:bg-red-900/50' : 'bg-red-50 hover:bg-red-100'
                          }`}
                        >
                          <Trash2 className="text-red-500" size={20} />
                          <div>
                            <div className={`font-medium ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                              Delete Account
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                              Permanently delete your account and data
                            </div>
                          </div>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Privacy Settings */}
                {activeSection === 'privacy' && (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Privacy & Security
                    </h2>

                    {/* Privacy Settings */}
                    <div className={`p-4 rounded-lg border ${
                      darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Data Privacy
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className={`flex items-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <Shield size={16} className="mr-2" />
                              Profile Visibility
                            </label>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Control who can see your profile
                            </p>
                          </div>
                          <select
                            value={settings.profileVisibility}
                            onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                            className={`px-3 py-1 rounded border text-sm ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="public">Public</option>
                            <option value="friends">Friends Only</option>
                            <option value="private">Private</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className={`flex items-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <BarChart3 size={16} className="mr-2" />
                              Share Progress
                            </label>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Allow others to see your study progress
                            </p>
                          </div>
                          <motion.button
                            onClick={() => handleSettingChange('shareProgress', !settings.shareProgress)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              settings.shareProgress ? 'bg-violet-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                            }`}
                          >
                            <motion.div
                              animate={{ x: settings.shareProgress ? 24 : 2 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                            />
                          </motion.button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className={`flex items-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <Eye size={16} className="mr-2" />
                              Analytics
                            </label>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Help improve the app with usage analytics
                            </p>
                          </div>
                          <motion.button
                            onClick={() => handleSettingChange('allowAnalytics', !settings.allowAnalytics)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              settings.allowAnalytics ? 'bg-violet-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                            }`}
                          >
                            <motion.div
                              animate={{ x: settings.allowAnalytics ? 24 : 2 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                            />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Study Settings */}
                {activeSection === 'study' && (
                  <motion.div
                    key="study"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Study Preferences
                    </h2>

                    {/* Study Settings */}
                    <div className={`p-4 rounded-lg border ${
                      darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Session Settings
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <Clock size={16} className="inline mr-2" />
                            Default Study Duration (minutes)
                          </label>
                          <input
                            type="range"
                            min="5"
                            max="120"
                            value={settings.defaultStudyDuration}
                            onChange={(e) => handleSettingChange('defaultStudyDuration', parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>5 min</span>
                            <span>{settings.defaultStudyDuration} minutes</span>
                            <span>120 min</span>
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <Target size={16} className="inline mr-2" />
                            Daily Study Goal (minutes)
                          </label>
                          <input
                            type="range"
                            min="30"
                            max="480"
                            value={settings.dailyStudyGoal}
                            onChange={(e) => handleSettingChange('dailyStudyGoal', parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>30 min</span>
                            <span>{Math.floor(settings.dailyStudyGoal / 60)}h {settings.dailyStudyGoal % 60}m</span>
                            <span>8 hours</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className={`flex items-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Auto-start Breaks
                            </label>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Automatically start break timers
                            </p>
                          </div>
                          <motion.button
                            onClick={() => handleSettingChange('autoStartBreaks', !settings.autoStartBreaks)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              settings.autoStartBreaks ? 'bg-violet-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                            }`}
                          >
                            <motion.div
                              animate={{ x: settings.autoStartBreaks ? 24 : 2 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                            />
                          </motion.button>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <Bell size={16} className="inline mr-2" />
                            Reminder Frequency
                          </label>
                          <select
                            value={settings.reminderFrequency}
                            onChange={(e) => handleSettingChange('reminderFrequency', e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="never">Never</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Notification Settings */}
                {activeSection === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Notification Preferences
                    </h2>

                    {/* Email Notifications */}
                    <div className={`p-4 rounded-lg border ${
                      darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Email Notifications
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className={`flex items-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <Mail size={16} className="mr-2" />
                              Study Reminders
                            </label>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Get email reminders for study sessions
                            </p>
                          </div>
                          <motion.button
                            onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              settings.emailNotifications ? 'bg-violet-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                            }`}
                          >
                            <motion.div
                              animate={{ x: settings.emailNotifications ? 24 : 2 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                            />
                          </motion.button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className={`flex items-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <BarChart3 size={16} className="mr-2" />
                              Weekly Reports
                            </label>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Receive weekly progress summaries
                            </p>
                          </div>
                          <motion.button
                            onClick={() => handleSettingChange('weeklyReports', !settings.weeklyReports)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              settings.weeklyReports ? 'bg-violet-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                            }`}
                          >
                            <motion.div
                              animate={{ x: settings.weeklyReports ? 24 : 2 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                            />
                          </motion.button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className={`flex items-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Marketing Emails
                            </label>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Receive updates about new features
                            </p>
                          </div>
                          <motion.button
                            onClick={() => handleSettingChange('marketingEmails', !settings.marketingEmails)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              settings.marketingEmails ? 'bg-violet-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                            }`}
                          >
                            <motion.div
                              animate={{ x: settings.marketingEmails ? 24 : 2 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                            />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div className={`p-4 rounded-lg border ${
                      darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Browser Notifications
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className={`flex items-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <Bell size={16} className="mr-2" />
                              Study Session Alerts
                            </label>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Get browser notifications for study sessions
                            </p>
                          </div>
                          <motion.button
                            onClick={() => handleSettingChange('studyReminders', true)}
                            className={`relative w-12 h-6 rounded-full transition-colors bg-violet-500`}
                          >
                            <motion.div
                              animate={{ x: 24 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                            />
                          </motion.button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className={`flex items-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <Trophy size={16} className="mr-2" />
                              Achievement Notifications
                            </label>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Get notified when you unlock achievements
                            </p>
                          </div>
                          <motion.button
                            onClick={() => handleSettingChange('achievementAlerts', true)}
                            className={`relative w-12 h-6 rounded-full transition-colors bg-violet-500`}
                          >
                            <motion.div
                              animate={{ x: 24 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                            />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save Button */}
              <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  onClick={saveSettings}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
                    darkMode 
                      ? 'bg-violet-600 text-white hover:bg-violet-500' 
                      : 'bg-violet-500 text-white hover:bg-violet-400'
                  }`}
                >
                  <Save size={16} />
                  Save Settings
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.main>
      </div>
    </div>
  )
} 