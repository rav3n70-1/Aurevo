import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import WaterTracker from '../components/WaterTracker'
import CalorieTracker from '../components/CalorieTracker'
import StepCounter from '../components/StepCounter'
import SleepTracker from '../components/SleepTracker'
import { useAppStore, useWellnessStore } from '../store'

export default function Wellness() {
  const { t } = useTranslation()
  const { darkMode, user, isLoading } = useAppStore()
  const { loadWellnessData, initializeWellnessData } = useWellnessStore()

  useEffect(() => {
    if (user) {
      const initializeData = async () => {
        try {
          await initializeWellnessData()
        } catch (error) {
          console.error('Error initializing wellness data:', error)
        }
      }
      initializeData()
    }
  }, [user, initializeWellnessData])

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

        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Wellness Dashboard
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your daily wellness metrics and build healthy habits
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
            >
              <WaterTracker />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
            >
              <CalorieTracker />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
            >
              <StepCounter />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
            >
              <SleepTracker />
            </motion.div>
          </div>

          {/* Wellness Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }}
            className={`rounded-2xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Daily Wellness Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Stay Hydrated",
                  tip: "Drink water regularly throughout the day. Aim for 8-10 glasses.",
                  emoji: "💧"
                },
                {
                  title: "Move Your Body",
                  tip: "Take regular breaks to walk or stretch. Every step counts!",
                  emoji: "🚶"
                },
                {
                  title: "Eat Balanced",
                  tip: "Include a variety of nutrients in your meals for sustained energy.",
                  emoji: "🥗"
                },
                {
                  title: "Rest Well",
                  tip: "Maintain a consistent sleep schedule for better recovery.",
                  emoji: "😴"
                }
              ].map((tip, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{tip.emoji}</span>
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {tip.title}
                    </h3>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {tip.tip}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.main>
      </div>
    </div>
  )
} 