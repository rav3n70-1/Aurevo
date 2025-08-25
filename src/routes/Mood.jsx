import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MoodTracker from '../components/MoodTracker'
import { useAppStore, useMoodStore } from '../store'

export default function Mood() {
  const { t } = useTranslation()
  const { darkMode, user, isLoading } = useAppStore()
  const { loadMoodData } = useMoodStore()

  useEffect(() => {
    if (user) {
      loadMoodData()
    }
  }, [user, loadMoodData])

  if (isLoading) {
    return (
      <div className={`h-screen grid place-items-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-600'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
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
          <div className={`rounded-2xl border shadow-sm p-6 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Mood & Emotional Tracking
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your daily emotions, log voice journals, and watch your emotional wellness grow.
            </p>
          </div>

          {/* Mood Tracker Component */}
          <MoodTracker />

          {/* Additional Mood Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-2xl border shadow-sm p-6 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Mood Insights
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Most Common Mood
                    </span>
                    <span className="text-lg">😊</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Average This Week
                    </span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      4.2/5
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Entries This Month
                    </span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      24
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl border shadow-sm p-6 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Emotional Support
              </h3>
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-violet-900/20' : 'bg-violet-50'
              }`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">🌟</div>
                  <p className={`text-sm italic ${darkMode ? 'text-violet-300' : 'text-violet-700'}`}>
                    "Every small step forward is progress. You're doing better than you think."
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <button className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}>
                  📱 Quick Check-in
                </button>
                <button className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}>
                  🎵 Mood Music Suggestions
                </button>
                <button className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}>
                  📝 Guided Journaling
                </button>
              </div>
            </motion.div>
          </div>
        </motion.main>
      </div>
    </div>
  )
} 