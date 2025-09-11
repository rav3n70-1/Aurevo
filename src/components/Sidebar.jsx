import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Home, 
  Heart, 
  Activity, 
  BookOpen, 
  Target, 
  BarChart3,
  Settings,
  Trophy,
  Star,
  TrendingUp,
  Calendar,
  User
} from 'lucide-react'
import { useAppStore, useWellnessStore, useMoodStore, useTaskStore } from '../store'

const NAVIGATION_ITEMS = [
  { id: 'dashboard', path: '/dashboard', icon: Home, labelKey: 'dashboard', color: 'text-blue-500' },
  { id: 'mood', path: '/mood', icon: Heart, labelKey: 'mood', color: 'text-pink-500' },
  { id: 'wellness', path: '/wellness', icon: Activity, labelKey: 'wellness', color: 'text-green-500' },
  { id: 'study', path: '/study', icon: BookOpen, labelKey: 'study', color: 'text-purple-500' },
  { id: 'goals', path: '/goals', icon: Target, labelKey: 'goals', color: 'text-orange-500' },
  { id: 'reports', path: '/reports', icon: BarChart3, labelKey: 'reports', color: 'text-indigo-500' }
]

export default function Sidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { darkMode, user, level, xp, shinePoints, streaks } = useAppStore()
  const { waterIntake, dailyWaterGoal, steps, sleepHours } = useWellnessStore()
  const { moodLogs } = useMoodStore()
  const { studySessions } = useTaskStore()
  const [activeSection, setActiveSection] = useState('dashboard')

  const xpToNextLevel = 1000 - (xp % 1000)
  const currentLevelProgress = (xp % 1000) / 1000 * 100

  // Update active section based on current route
  useEffect(() => {
    const currentItem = NAVIGATION_ITEMS.find(item => item.path === location.pathname)
    if (currentItem) {
      setActiveSection(currentItem.id)
    }
  }, [location.pathname])

  const navigateToPage = (item) => {
    setActiveSection(item.id)
    navigate(item.path)
  }

  // Calculate today's metrics
  const todaysMoodLogged = moodLogs.some(log => {
    const logDate = new Date(log.timestamp?.toDate?.() || log.timestamp).toDateString()
    const today = new Date().toDateString()
    return logDate === today
  })

  const waterProgress = Math.round((waterIntake / dailyWaterGoal) * 100)
  
  const todaysStudyTime = studySessions
    .filter(session => {
      const sessionDate = new Date(session.timestamp?.toDate?.() || session.timestamp).toDateString()
      const today = new Date().toDateString()
      return sessionDate === today
    })
    .reduce((total, session) => total + (session.duration || 0), 0)

  const stepsInK = Math.round(steps / 1000 * 10) / 10

  return (
    <aside className={`rounded-2xl shadow-sm border p-6 space-y-6 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* User Profile Section */}
      <div className="text-center space-y-3">
        <div className="relative mx-auto w-16 h-16">
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=7c3aed&color=fff`}
            alt="Profile"
            className="w-full h-full rounded-full border-3 border-violet-500"
          />
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
            darkMode ? 'bg-violet-600' : 'bg-violet-500'
          }`}>
            {level}
          </div>
        </div>
        
        <div>
          <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {user?.displayName?.split(' ')[0] || 'Student'}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Level {level} Scholar
          </p>
        </div>

        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              {xp % 1000} / 1000 XP
            </span>
            <span className={darkMode ? 'text-violet-400' : 'text-violet-600'}>
              {xpToNextLevel} to level {level + 1}
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentLevelProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-violet-600 to-purple-600"
            />
          </div>
        </div>

        {/* Shine Points */}
        <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${
          darkMode ? 'bg-amber-900/20' : 'bg-amber-50'
        }`}>
          <Star className="text-amber-500" size={16} />
          <span className={`text-sm font-medium ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
            {shinePoints} Shine Points
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        <h4 className={`text-xs font-semibold uppercase tracking-wider ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Navigation
        </h4>
        
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = activeSection === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => navigateToPage(item)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                isActive
                  ? darkMode 
                    ? 'bg-violet-600/20 text-violet-400 border border-violet-600/30' 
                    : 'bg-violet-100 text-violet-700 border border-violet-200'
                  : darkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon size={18} className={isActive ? item.color : ''} />
              <span className="text-sm font-medium">{t(item.labelKey)}</span>
            </motion.button>
          )
        })}
      </nav>

      {/* Streaks */}
      <div className="space-y-3">
        <h4 className={`text-xs font-semibold uppercase tracking-wider ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Current Streaks
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(streaks).map(([type, count]) => (
            <div
              key={type}
              className={`p-2 rounded-lg text-center ${
                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}
            >
              <div className={`text-lg font-bold ${
                count > 0 
                  ? darkMode ? 'text-orange-400' : 'text-orange-600'
                  : darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {count > 0 ? `🔥${count}` : '💭'}
              </div>
              <div className={`text-xs capitalize ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {type}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className={`p-4 rounded-lg space-y-3 ${
        darkMode ? 'bg-gray-700/30' : 'bg-gray-50'
      }`}>
        <h4 className={`text-sm font-medium flex items-center gap-2 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <TrendingUp size={16} />
          Today's Progress
        </h4>
        
        <div className="space-y-2">
          {[
            { 
              label: 'Mood Logged', 
              value: todaysMoodLogged ? '✅' : '❌', 
              color: todaysMoodLogged ? 'text-green-500' : 'text-gray-400' 
            },
            { 
              label: 'Water Goal', 
              value: `${waterProgress}%`, 
              color: waterProgress >= 100 ? 'text-green-500' : waterProgress >= 50 ? 'text-blue-500' : 'text-gray-400' 
            },
            { 
              label: 'Study Time', 
              value: `${Math.round(todaysStudyTime / 60 * 10) / 10}h`, 
              color: todaysStudyTime > 0 ? 'text-purple-500' : 'text-gray-400' 
            },
            { 
              label: 'Steps', 
              value: stepsInK > 0 ? `${stepsInK}k` : '0', 
              color: steps >= 10000 ? 'text-green-500' : steps >= 5000 ? 'text-orange-500' : 'text-gray-400' 
            }
          ].map((stat) => (
            <div key={stat.label} className="flex justify-between items-center">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </span>
              <span className={`text-xs font-medium ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement of the Day */}
      <div className={`p-4 rounded-lg ${
        darkMode ? 'bg-gradient-to-r from-purple-900/30 to-violet-900/30' : 'bg-gradient-to-r from-purple-50 to-violet-50'
      }`}>
        <div className="text-center">
          <Trophy className={`mx-auto mb-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} size={24} />
          <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {todaysMoodLogged && waterProgress >= 50 && todaysStudyTime > 0 ? 'Great Progress!' : 'Keep Going!'}
          </h4>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {todaysMoodLogged && waterProgress >= 50 && todaysStudyTime > 0 
              ? 'You\'re crushing your goals today!'
              : 'Every small step counts towards your goals'
            }
          </p>
          {todaysMoodLogged && waterProgress >= 50 && todaysStudyTime > 0 && (
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              +25 bonus XP earned!
            </p>
          )}
        </div>
      </div>

      {/* Settings Link */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/settings')}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
          darkMode 
            ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <Settings size={18} />
        <span className="text-sm font-medium">{t('settings')}</span>
      </motion.button>
    </aside>
  )
}
