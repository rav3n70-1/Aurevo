import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Pomodoro from '../components/Pomodoro'
import Flashcards from '../components/Flashcards'
import { useAppStore, useTaskStore } from '../store'

export default function Study() {
  const { t } = useTranslation()
  const { darkMode, user, isLoading } = useAppStore()
  const { loadStudySessionsHistory } = useTaskStore()

  useEffect(() => {
    if (user) {
      loadStudySessionsHistory(7)
    }
  }, [user, loadStudySessionsHistory])

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
              Study Suite
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Enhance your learning with Pomodoro timers, AI-powered flashcards, and study analytics.
            </p>
          </div>

          {/* Study Tools Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Pomodoro />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Flashcards />
            </motion.div>
          </div>

          {/* Study Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl border shadow-sm p-6 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Study Analytics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Today', value: '2.5h', icon: '⏰', color: 'text-blue-500' },
                { label: 'This Week', value: '18h', icon: '📅', color: 'text-green-500' },
                { label: 'Sessions', value: '47', icon: '🎯', color: 'text-orange-500' },
                { label: 'Accuracy', value: '87%', icon: '✅', color: 'text-purple-500' }
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={`p-4 rounded-lg text-center ${
                    darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className={`text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Study Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={`rounded-2xl border shadow-sm p-6 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Study Techniques
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Pomodoro Technique', desc: 'Focus for 25 minutes, break for 5', icon: '🍅' },
                  { name: 'Spaced Repetition', desc: 'Review material at increasing intervals', icon: '📚' },
                  { name: 'Active Recall', desc: 'Test yourself without looking at notes', icon: '🧠' },
                  { name: 'Feynman Method', desc: 'Explain concepts in simple terms', icon: '👨‍🏫' }
                ].map((technique, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg transition-colors cursor-pointer ${
                      darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{technique.icon}</span>
                      <div>
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {technique.name}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {technique.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className={`rounded-2xl border shadow-sm p-6 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Upload PDF', desc: 'Generate flashcards from documents', icon: '📄', action: 'upload' },
                  { name: 'Study Planner', desc: 'Schedule your study sessions', icon: '📅', action: 'plan' },
                  { name: 'Progress Report', desc: 'View detailed analytics', icon: '📊', action: 'report' },
                  { name: 'Study Groups', desc: 'Join collaborative sessions', icon: '👥', action: 'groups' }
                ].map((action, index) => (
                  <button
                    key={index}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{action.icon}</span>
                      <div>
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {action.name}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {action.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Study Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`rounded-2xl border shadow-sm p-6 ${
              darkMode ? 'bg-purple-900/20' : 'bg-purple-50'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>
              💡 Study Tip of the Day
            </h3>
            <p className={`${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
              <strong>Use the Two-Minute Rule:</strong> If a study task takes less than two minutes, do it immediately. 
              This prevents small tasks from piling up and overwhelming you later.
            </p>
          </motion.div>
        </motion.main>
      </div>
    </div>
  )
} 