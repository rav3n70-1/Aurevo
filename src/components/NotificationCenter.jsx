import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck,
  Trash2, 
  Settings,
  Filter,
  Calendar,
  Trophy,
  Target,
  BookOpen,
  Clock,
  Star,
  AlertCircle,
  Info,
  Zap,
  Heart,
  Gift,
  Flame
} from 'lucide-react'
import { useAppStore, useNotificationStore } from '../store'

const NOTIFICATION_TYPES = {
  study: { icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  achievement: { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  reminder: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  goal: { icon: Target, color: 'text-green-500', bg: 'bg-green-500/10' },
  streak: { icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10' },
  system: { icon: Info, color: 'text-gray-500', bg: 'bg-gray-500/10' },
  celebration: { icon: Gift, color: 'text-purple-500', bg: 'bg-purple-500/10' }
}

export default function NotificationCenter({ isOpen, onClose }) {
  const { t } = useTranslation()
  const { darkMode, addXP } = useAppStore()
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications,
    getUnreadCount,
    initializeNotifications
  } = useNotificationStore()
  
  const [filter, setFilter] = useState('all')
  const [showSettings, setShowSettings] = useState(false)

  const unreadCount = getUnreadCount()

  // Initialize notifications on component mount
  useEffect(() => {
    initializeNotifications()
  }, [])

  const handleNotificationAction = (notification) => {
    if (notification.actionable) {
      // Handle different actions based on notification type
      switch (notification.type) {
        case 'reminder':
          // Navigate to study page or start session
          break
        case 'achievement':
          // Navigate to achievements page
          break
        default:
          break
      }
    }
    markAsRead(notification.id)
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.read
    return notification.type === filter
  })

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, x: 300, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 300, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-md h-[80vh] rounded-2xl shadow-2xl overflow-hidden ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          {/* Header */}
          <div className={`sticky top-0 p-4 border-b ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Bell className="text-violet-500" size={20} />
                <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded-full"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setShowSettings(!showSettings)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Settings size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                </motion.button>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                </motion.button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'study', label: 'Study' },
                { id: 'achievement', label: 'Achievements' },
                { id: 'reminder', label: 'Reminders' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    filter === tab.id
                      ? darkMode 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-violet-500 text-white'
                      : darkMode 
                        ? 'text-gray-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Quick Actions */}
            {notifications.length > 0 && (
              <div className="flex gap-2 mt-3">
                <motion.button
                  onClick={markAllAsRead}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CheckCheck size={12} />
                  Mark all read
                </motion.button>
                <motion.button
                  onClick={clearAllNotifications}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    darkMode 
                      ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  <Trash2 size={12} />
                  Clear all
                </motion.button>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Bell size={48} className={`mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  No notifications
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  You're all caught up! New notifications will appear here.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <AnimatePresence>
                  {filteredNotifications.map((notification, index) => {
                    const NotificationType = NOTIFICATION_TYPES[notification.type]
                    const Icon = NotificationType.icon

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative p-4 rounded-lg border transition-all cursor-pointer group ${
                          notification.read
                            ? darkMode 
                              ? 'bg-gray-700/30 border-gray-600' 
                              : 'bg-gray-50 border-gray-200'
                            : darkMode 
                              ? 'bg-gray-700/50 border-gray-600 ring-1 ring-violet-500/30' 
                              : 'bg-white border-gray-200 ring-1 ring-violet-500/30'
                        }`}
                        onClick={() => handleNotificationAction(notification)}
                      >
                        {/* Unread Indicator */}
                        {!notification.read && (
                          <div className="absolute top-3 right-3 w-2 h-2 bg-violet-500 rounded-full"></div>
                        )}

                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`p-2 rounded-lg ${NotificationType.bg}`}>
                            <Icon size={16} className={NotificationType.color} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm mb-1 ${
                              darkMode ? 'text-white' : 'text-gray-800'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className={`text-sm leading-relaxed ${
                              darkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>

                            {/* Additional Info */}
                            <div className="flex items-center gap-4 mt-2">
                              <span className={`text-xs ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {formatTimeAgo(notification.timestamp)}
                              </span>

                              {notification.xpGained && (
                                <span className="flex items-center gap-1 text-xs text-violet-500">
                                  <Zap size={10} />
                                  +{notification.xpGained} XP
                                </span>
                              )}

                              {notification.streakCount && (
                                <span className="flex items-center gap-1 text-xs text-orange-500">
                                  <Flame size={10} />
                                  {notification.streakCount} day streak
                                </span>
                              )}
                            </div>

                            {/* Action Button */}
                            {notification.actionable && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`mt-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  darkMode 
                                    ? 'bg-violet-600 text-white hover:bg-violet-500' 
                                    : 'bg-violet-500 text-white hover:bg-violet-400'
                                }`}
                              >
                                {notification.action}
                              </motion.button>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                                }`}
                                title="Mark as read"
                              >
                                <Check size={12} className="text-green-500" />
                              </motion.button>
                            )}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                              }`}
                              title="Delete"
                            >
                              <X size={12} className="text-red-500" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`border-t p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Notification Settings
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Study reminders', key: 'studyReminders' },
                    { label: 'Achievement alerts', key: 'achievementAlerts' },
                    { label: 'Goal notifications', key: 'goalNotifications' },
                    { label: 'Weekly reports', key: 'weeklyReports' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {setting.label}
                      </span>
                      <motion.button
                        className={`relative w-10 h-5 rounded-full transition-colors bg-violet-500`}
                      >
                        <motion.div
                          animate={{ x: 20 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
                        />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 