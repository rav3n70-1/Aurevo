import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  User, 
  Edit3, 
  Camera, 
  Trophy, 
  Star, 
  Target,
  Calendar,
  Clock,
  BookOpen,
  Brain,
  Flame,
  Award,
  BarChart3,
  Settings,
  Shield,
  Bell,
  Image,
  Upload,
  Download,
  Save,
  X,
  Check,
  Mail,
  MapPin,
  Link,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useTaskStore } from '../store'

export default function Profile() {
  const { t } = useTranslation()
  const { 
    darkMode, 
    user, 
    xp, 
    level, 
    shinePoints,
    isLoading 
  } = useAppStore()
  const { studySessions } = useTaskStore()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    bio: '',
    location: '',
    website: '',
    github: '',
    twitter: '',
    linkedin: ''
  })
  const [achievements, setAchievements] = useState([])

  useEffect(() => {
    // Load user achievements and stats
    loadUserAchievements()
  }, [user])

  const loadUserAchievements = () => {
    // Sample achievements based on user activity - Updated to fix cache issue
    const userAchievements = [
      {
        id: 1,
        title: 'First Steps',
        description: 'Complete your first study session',
        icon: '🎯',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 86400000 * 5)
      },
      {
        id: 2,
        title: 'Study Streak',
        description: 'Study for 7 consecutive days',
        icon: '🔥',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 86400000 * 2)
      },
      {
        id: 3,
        title: 'Knowledge Seeker',
        description: 'Complete 50 flashcard reviews',
        icon: '🧠',
        unlocked: xp > 500,
        unlockedAt: xp > 500 ? new Date(Date.now() - 86400000) : null
      },
      {
        id: 4,
        title: 'Time Master',
        description: 'Complete 25 Pomodoro sessions',
        icon: '⏰',
        unlocked: false,
        progress: Math.min((studySessions?.length || 0) / 25 * 100, 100)
      },
      {
        id: 5,
        title: 'Scholar',
        description: 'Reach Level 10',
        icon: '🎓',
        unlocked: level >= 10,
        progress: level < 10 ? (level / 10 * 100) : 100
      }
    ]
    setAchievements(userAchievements)
  }

  const handleSaveProfile = async () => {
    try {
      // Here you would typically update the user profile in Firebase
      // For now, we'll just update local state
      setIsEditing(false)
      // toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      // toast.error('Failed to update profile')
    }
  }

  const getUserStats = () => {
    const totalStudyTime = studySessions?.reduce((total, session) => total + session.duration, 0) || 0
    const averageSessionLength = studySessions?.length > 0 ? totalStudyTime / studySessions.length : 0
    const longestStreak = 7 // This would be calculated from actual data
    const joinDate = user?.metadata?.creationTime ? new Date(user.metadata.creationTime) : new Date()
    const daysActive = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24))

    return {
      totalStudyTime: Math.round(totalStudyTime),
      averageSessionLength: Math.round(averageSessionLength),
      totalSessions: studySessions?.length || 0,
      longestStreak,
      daysActive,
      joinDate
    }
  }

  const stats = getUserStats()

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

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
          {/* Profile Header */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`rounded-2xl border shadow-sm p-6 bg-gradient-to-r ${
              darkMode 
                ? 'from-violet-900/20 via-purple-900/20 to-indigo-900/20 border-gray-700' 
                : 'from-violet-50 via-purple-50 to-indigo-50 border-gray-200'
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Image */}
              <div className="relative">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=7c3aed&color=fff&size=120`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-violet-600 shadow-lg"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`absolute -bottom-2 -right-2 p-2 rounded-full shadow-lg ${
                    darkMode ? 'bg-violet-600 hover:bg-violet-500' : 'bg-violet-500 hover:bg-violet-400'
                  } text-white`}
                >
                  <Camera size={16} />
                </motion.button>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </h1>
                  <motion.button
                    onClick={() => setIsEditing(!isEditing)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Edit3 size={16} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                  </motion.button>
                </div>

                <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user?.email}
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    darkMode ? 'bg-violet-900/30' : 'bg-violet-100'
                  }`}>
                    <Trophy className="text-violet-500" size={16} />
                    <span className={`text-sm font-medium ${darkMode ? 'text-violet-300' : 'text-violet-700'}`}>
                      Level {level}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    darkMode ? 'bg-amber-900/30' : 'bg-amber-100'
                  }`}>
                    <Star className="text-amber-500" size={16} />
                    <span className={`text-sm font-medium ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                      {shinePoints} Shine Points
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}>
                    <Calendar className="text-blue-500" size={16} />
                    <span className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      Joined {stats.joinDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Experience Points
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {xp} XP
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(xp % 1000) / 10}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-violet-600 to-purple-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className={`rounded-2xl border shadow-sm overflow-hidden ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ backgroundColor: darkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(243, 244, 246, 0.5)' }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? darkMode 
                          ? 'text-violet-400 border-b-2 border-violet-400' 
                          : 'text-violet-600 border-b-2 border-violet-600'
                        : darkMode 
                          ? 'text-gray-400 hover:text-gray-300' 
                          : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </motion.button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Study Time', value: `${Math.floor(stats.totalStudyTime / 60)}h ${stats.totalStudyTime % 60}m`, icon: Clock, color: 'text-blue-500' },
                        { label: 'Study Sessions', value: stats.totalSessions, icon: BookOpen, color: 'text-green-500' },
                        { label: 'Current Streak', value: `${stats.longestStreak} days`, icon: Flame, color: 'text-orange-500' },
                        { label: 'Days Active', value: stats.daysActive, icon: Calendar, color: 'text-purple-500' }
                      ].map((stat, index) => {
                        const Icon = stat.icon
                        return (
                          <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg text-center ${
                              darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                            }`}
                          >
                            <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                            <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {stat.value}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {stat.label}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Recent Activity
                      </h3>
                      <div className="space-y-3">
                        {[
                          { action: 'Completed Quiz Mode', time: '2 hours ago', icon: Brain, color: 'text-purple-500' },
                          { action: 'Finished Pomodoro Session', time: '5 hours ago', icon: Clock, color: 'text-red-500' },
                          { action: 'Added Study Notes', time: '1 day ago', icon: BookOpen, color: 'text-blue-500' }
                        ].map((activity, index) => {
                          const Icon = activity.icon
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`flex items-center gap-3 p-3 rounded-lg ${
                                darkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${activity.color}`} />
                              <div className="flex-1">
                                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {activity.action}
                                </p>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {activity.time}
                                </p>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'achievements' && (
                  <motion.div
                    key="achievements"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Achievements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement, index) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            achievement.unlocked
                              ? darkMode 
                                ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/50' 
                                : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                              : darkMode 
                                ? 'bg-gray-700/30 border-gray-600' 
                                : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold ${
                                achievement.unlocked 
                                  ? darkMode ? 'text-yellow-300' : 'text-yellow-700'
                                  : darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {achievement.title}
                              </h4>
                              <p className={`text-sm ${
                                achievement.unlocked 
                                  ? darkMode ? 'text-yellow-200' : 'text-yellow-600'
                                  : darkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                {achievement.description}
                              </p>
                              {achievement.unlocked && achievement.unlockedAt && (
                                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Unlocked {achievement.unlockedAt.toLocaleDateString()}
                                </p>
                              )}
                              {!achievement.unlocked && achievement.progress !== undefined && (
                                <div className="mt-2">
                                  <div className={`h-2 rounded-full overflow-hidden ${
                                    darkMode ? 'bg-gray-600' : 'bg-gray-200'
                                  }`}>
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${achievement.progress}%` }}
                                      transition={{ duration: 1, delay: index * 0.1 }}
                                      className="h-full bg-gradient-to-r from-violet-600 to-purple-600"
                                    />
                                  </div>
                                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {Math.round(achievement.progress)}% Complete
                                  </p>
                                </div>
                              )}
                            </div>
                            {achievement.unlocked && (
                              <Check className="text-green-500" size={20} />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  )
} 