
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Trophy, 
  Star,
  ChevronDown,
  Languages,
  Sun,
  Moon
} from 'lucide-react'
import { signOutUser } from '../hooks_useAuth'
import { useAppStore, useNotificationStore } from '../store'
import NotificationCenter from './NotificationCenter'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { 
    user, 
    darkMode, 
    toggleDarkMode, 
    xp, 
    level, 
    shinePoints,
    language,
    setLanguage,
    notifications,
    toggleNotifications
  } = useAppStore()
  const { getUnreadCount } = useNotificationStore()
  
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const languageOptions = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ]

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode)
    i18n.changeLanguage(langCode)
    setShowLanguageMenu(false)
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const navigateToProfile = () => {
    navigate('/profile')
    setShowUserMenu(false)
  }

  const navigateToSettings = () => {
    navigate('/settings')
    setShowUserMenu(false)
  }

  const unreadCount = getUnreadCount()

  return (
    <>
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-900/80 border-gray-800' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and App Name */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">✨</span>
              </div>
              <span className={`font-bold text-xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent`}>
                Aurevo
              </span>
            </motion.div>

            {/* Center Stats (Desktop) */}
            <div className="hidden md:flex items-center gap-6">
              {/* Level & XP */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                darkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'
              }`}>
                <Trophy className="text-yellow-500" size={16} />
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {t('level')} {level}
                </span>
                <div className={`w-16 h-2 rounded-full overflow-hidden ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className="h-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-300"
                    style={{ width: `${(xp % 1000) / 10}%` }}
                  />
                </div>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {xp % 1000}/1000
                </span>
              </div>

              {/* Shine Points */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                darkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'
              }`}>
                <Star className="text-amber-500" size={16} />
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {shinePoints}
                </span>
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowNotifications(!showNotifications)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg transition-colors relative ${
                    notifications
                      ? darkMode ? 'bg-violet-600/20 text-violet-400' : 'bg-violet-100 text-violet-600'
                      : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Bell size={18} />
                  {/* Notification Badge */}
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </motion.button>
              </div>

              {/* Dark Mode Toggle */}
              <motion.button
                onClick={toggleDarkMode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-yellow-400 hover:bg-gray-800' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>

              {/* Language Selector */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Languages size={18} />
                </motion.button>

                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute right-0 mt-2 py-2 rounded-xl backdrop-blur-lg min-w-48 shadow-lg ${
                      darkMode ? 'bg-gray-800/95 border border-gray-700' : 'bg-white/95 border border-gray-200'
                    }`}
                  >
                    {languageOptions.map((lang) => (
                      <motion.button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        whileHover={{ x: 5 }}
                        className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                          language === lang.code
                            ? darkMode ? 'bg-purple-600/50' : 'bg-violet-100'
                            : darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                          {lang.name}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'hover:bg-gray-800 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <img
                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=7c3aed&color=fff`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-violet-600"
                  />
                  <span className="hidden sm:block text-sm font-medium max-w-32 truncate">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <motion.div
                    animate={{ rotate: showUserMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </motion.button>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute right-0 mt-2 py-2 rounded-xl backdrop-blur-lg min-w-48 shadow-lg ${
                      darkMode ? 'bg-gray-800/95 border border-gray-700' : 'bg-white/95 border border-gray-200'
                    }`}
                  >
                    <div className={`px-4 py-3 border-b ${
                      darkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user?.displayName || 'User'}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          darkMode ? 'bg-violet-600/20 text-violet-400' : 'bg-violet-100 text-violet-600'
                        }`}>
                          {t('level')} {level}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          darkMode ? 'bg-amber-600/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {shinePoints} ✨
                        </span>
                      </div>
                    </div>

                    <motion.button 
                      onClick={navigateToProfile}
                      whileHover={{ x: 5 }}
                      className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                        darkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <User size={16} />
                      <span className="text-sm">Profile</span>
                    </motion.button>

                    <motion.button 
                      onClick={navigateToSettings}
                      whileHover={{ x: 5 }}
                      className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                        darkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Settings size={16} />
                      <span className="text-sm">{t('settings')}</span>
                    </motion.button>

                    <motion.button
                      onClick={handleSignOut}
                      whileHover={{ x: 5 }}
                      className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                        darkMode ? 'hover:bg-gray-700/50 text-red-400' : 'hover:bg-gray-100 text-red-600'
                      }`}
                    >
                      <LogOut size={16} />
                      <span className="text-sm">{t('logout')}</span>
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  )
}
