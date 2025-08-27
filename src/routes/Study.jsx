import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Pomodoro from '../components/Pomodoro'
import Flashcards from '../components/Flashcards'
import ManualStudyLogger from '../components/ManualStudyLogger'
import StudyNotes from '../components/StudyNotes'
import StudyProgressChart from '../components/StudyProgressChart'
import QuizMode from '../components/QuizMode'
import StudyFAB from '../components/StudyFAB'
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
                ? 'from-purple-900/20 via-blue-900/20 to-indigo-900/20 border-gray-700' 
                : 'from-purple-50 via-blue-50 to-indigo-50 border-gray-200'
            }`}
          >
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent`}
            >
              Study Suite
            </motion.h1>
            <motion.p 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Enhance your learning with Pomodoro timers, AI-powered flashcards, quiz modes, study analytics, and comprehensive note-taking tools.
            </motion.p>
          </motion.div>

          {/* Manual Study Logger */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            data-action="log-study"
          >
            <ManualStudyLogger />
          </motion.div>

          {/* Study Tools Grid - Now 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="transition-transform duration-300"
              data-component="pomodoro"
            >
              <Pomodoro />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="transition-transform duration-300"
            >
              <Flashcards />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5 }}
              className="transition-transform duration-300 xl:col-span-1 lg:col-span-2"
              data-component="quiz"
            >
              <QuizMode />
            </motion.div>
          </div>

          {/* Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -2 }}
            className="transition-transform duration-300"
          >
            <StudyProgressChart />
          </motion.div>

          {/* Study Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -2 }}
            className="transition-transform duration-300"
            data-action="create-note"
          >
            <StudyNotes />
          </motion.div>

          {/* Study Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`rounded-2xl border shadow-sm p-6 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              📊 Quick Study Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Today', value: '2.5h', icon: '⏰', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
                { label: 'This Week', value: '18h', icon: '📅', color: 'text-green-500', bgColor: 'bg-green-500/10' },
                { label: 'Sessions', value: '47', icon: '🎯', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
                { label: 'Accuracy', value: '87%', icon: '✅', color: 'text-purple-500', bgColor: 'bg-purple-500/10' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`p-4 rounded-xl text-center transition-all duration-300 cursor-pointer ${
                    darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                  } ${stat.bgColor}`}
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.1, type: "spring" }}
                    className="text-2xl mb-2"
                  >
                    {stat.icon}
                  </motion.div>
                  <div className={`text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Study Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ y: -2 }}
              className={`rounded-2xl border shadow-sm p-6 transition-all duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                🧠 Study Techniques
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Pomodoro Technique', desc: 'Focus for 25 minutes, break for 5', icon: '🍅', color: 'text-red-500' },
                  { name: 'Spaced Repetition', desc: 'Review material at increasing intervals', icon: '📚', color: 'text-blue-500' },
                  { name: 'Active Recall', desc: 'Test yourself without looking at notes', icon: '🧠', color: 'text-purple-500' },
                  { name: 'Feynman Method', desc: 'Explain concepts in simple terms', icon: '👨‍🏫', color: 'text-green-500' }
                ].map((technique, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + index * 0.1 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                    className={`p-3 rounded-lg transition-all duration-300 cursor-pointer ${
                      darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <motion.span 
                        whileHover={{ scale: 1.2 }}
                        className="text-xl"
                      >
                        {technique.icon}
                      </motion.span>
                      <div>
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {technique.name}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {technique.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              whileHover={{ y: -2 }}
              className={`rounded-2xl border shadow-sm p-6 transition-all duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                ⚡ Quick Actions
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Upload PDF', desc: 'Generate flashcards from documents', icon: '📄', action: 'upload', color: 'text-blue-500' },
                  { name: 'Study Planner', desc: 'Schedule your study sessions', icon: '📅', action: 'plan', color: 'text-green-500' },
                  { name: 'Progress Report', desc: 'View detailed analytics', icon: '📊', action: 'report', color: 'text-purple-500' },
                  { name: 'Study Groups', desc: 'Join collaborative sessions', icon: '👥', action: 'groups', color: 'text-orange-500' }
                ].map((action, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    whileHover={{ x: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-300 ${
                      darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <motion.span 
                        whileHover={{ scale: 1.2 }}
                        className="text-xl"
                      >
                        {action.icon}
                      </motion.span>
                      <div>
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {action.name}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {action.desc}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Enhanced Study Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            whileHover={{ scale: 1.01 }}
            className={`rounded-2xl border shadow-sm p-6 bg-gradient-to-r transition-all duration-300 ${
              darkMode 
                ? 'from-purple-900/20 to-blue-900/20 border-purple-700/50' 
                : 'from-purple-50 to-blue-50 border-purple-200'
            }`}
          >
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-purple-300' : 'text-purple-800'
              }`}
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                💡
              </motion.span>
              Study Tip of the Day
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className={`${darkMode ? 'text-purple-200' : 'text-purple-700'}`}
            >
              <strong>Use the Two-Minute Rule:</strong> If a study task takes less than two minutes, do it immediately. 
              This prevents small tasks from piling up and overwhelming you later. Small wins create momentum for bigger achievements!
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="mt-4 flex items-center gap-4"
            >
              {['🏆', '⚡', '🚀', '🎯', '✨'].map((emoji, index) => (
                <motion.span
                  key={index}
                  animate={{ 
                    y: [0, -5, 0],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: index * 0.2,
                    repeatDelay: 1
                  }}
                  className="text-lg cursor-pointer hover:scale-125 transition-transform"
                >
                  {emoji}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </motion.main>
      </div>
      
      {/* Floating Action Button */}
      <StudyFAB />
    </div>
  )
} 