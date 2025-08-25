
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MoodTracker from '../components/MoodTracker'
import WaterTracker from '../components/WaterTracker'
import CalorieTracker from '../components/CalorieTracker'
import StepCounter from '../components/StepCounter'
import SleepTracker from '../components/SleepTracker'
import Pomodoro from '../components/Pomodoro'
import Flashcards from '../components/Flashcards'
import { useAppStore } from '../store'

export default function Dashboard() {
  const { t } = useTranslation()
  const { darkMode, user, level, xp, shinePoints } = useAppStore()

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-slate-50'
    }`}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          {/* Sidebar */}
          <div className="lg:sticky lg:top-20 lg:h-fit">
            <Sidebar />
          </div>
          
          {/* Main Content */}
          <motion.main 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="space-y-8"
          >
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-6 rounded-2xl ${
                darkMode 
                  ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-gray-700' 
                  : 'bg-gradient-to-r from-purple-100 to-blue-100 border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}! 👋
                  </h1>
                  <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Ready to continue your journey of growth and learning?
                  </p>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Level {level}
                  </div>
                  <div className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {xp} XP
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    {shinePoints} ✨ Shine Points
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mood & Emotional Tracking Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                🎯 Mood & Emotional Wellness
              </h2>
              <MoodTracker />
            </motion.section>

            {/* Wellness Tracking Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                💪 Physical Wellness Tracking
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <WaterTracker />
                <CalorieTracker />
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <StepCounter />
                <SleepTracker />
              </div>
            </motion.section>

            {/* Academic Excellence Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                📚 Academic Excellence Suite
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Pomodoro />
                <Flashcards />
              </div>
            </motion.section>

            {/* Quick Actions Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`p-6 rounded-2xl ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                ⚡ Quick Actions
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '📝', label: 'Add Task', color: 'blue' },
                  { icon: '🎯', label: 'Set Goal', color: 'green' },
                  { icon: '📖', label: 'Study Plan', color: 'purple' },
                  { icon: '📊', label: 'View Reports', color: 'orange' }
                ].map((action, index) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl text-center transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <div className="text-sm font-medium">{action.label}</div>
                  </motion.button>
                ))}
              </div>
            </motion.section>

            {/* Daily Motivation */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`p-6 rounded-2xl ${
                darkMode 
                  ? 'bg-gradient-to-r from-violet-900/50 to-purple-900/50 border border-gray-700' 
                  : 'bg-gradient-to-r from-violet-50 to-purple-50 border border-gray-200'
              }`}
            >
              <div className="text-center">
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  💎 Daily Inspiration
                </h3>
                <p className={`text-base italic ${darkMode ? 'text-violet-300' : 'text-violet-700'}`}>
                  "{t('emotionalSupport.growth')}"
                </p>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Keep growing, keep learning, keep shining! ✨
                </p>
              </div>
            </motion.section>
          </motion.main>
        </div>
      </div>
    </div>
  )
}
