import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Moon, 
  Sun, 
  Clock, 
  Target,
  TrendingUp,
  Zap,
  Star
} from 'lucide-react'
import { useWellnessStore } from '../store'
import { useAppStore } from '../store'

const SLEEP_QUALITY = [
  { level: 1, label: 'Poor', emoji: '😴', color: 'text-red-500' },
  { level: 2, label: 'Fair', emoji: '😪', color: 'text-orange-500' },
  { level: 3, label: 'Good', emoji: '😊', color: 'text-yellow-500' },
  { level: 4, label: 'Great', emoji: '😌', color: 'text-green-500' },
  { level: 5, label: 'Excellent', emoji: '🌟', color: 'text-blue-500' }
]

const SLEEP_PHASES = [
  { phase: 'Light Sleep', color: 'bg-blue-300', percentage: 45 },
  { phase: 'Deep Sleep', color: 'bg-indigo-500', percentage: 25 },
  { phase: 'REM Sleep', color: 'bg-purple-500', percentage: 20 },
  { phase: 'Awake', color: 'bg-yellow-300', percentage: 10 }
]

const RECOMMENDED_SLEEP = {
  adult: { min: 7, max: 9, optimal: 8 },
  teen: { min: 8, max: 10, optimal: 9 },
  child: { min: 9, max: 11, optimal: 10 }
}

export default function SleepTracker() {
  const { t } = useTranslation()
  const { darkMode } = useAppStore()
  const { sleepHours, updateSleep, saveWellnessData } = useWellnessStore()
  
  const [bedTime, setBedTime] = useState('')
  const [wakeTime, setWakeTime] = useState('')
  const [sleepQuality, setSleepQuality] = useState(3)
  const [sleepGoal] = useState(8) // hours
  const [showSleepLog, setShowSleepLog] = useState(false)
  const [sleepNotes, setSleepNotes] = useState('')

  const sleepProgress = Math.min(100, (sleepHours / sleepGoal) * 100)
  const isOptimalSleep = sleepHours >= RECOMMENDED_SLEEP.adult.min && sleepHours <= RECOMMENDED_SLEEP.adult.max

  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveWellnessData()
    }, 1000)
    
    return () => clearTimeout(saveTimeout)
  }, [sleepHours, saveWellnessData])

  const calculateSleepDuration = () => {
    if (bedTime && wakeTime) {
      const bed = new Date(`2024-01-01T${bedTime}`)
      let wake = new Date(`2024-01-01T${wakeTime}`)
      
      // If wake time is earlier than bed time, assume it's next day
      if (wake < bed) {
        wake.setDate(wake.getDate() + 1)
      }
      
      const diffMs = wake - bed
      const diffHours = diffMs / (1000 * 60 * 60)
      return Math.round(diffHours * 10) / 10
    }
    return 0
  }

  const logSleep = () => {
    const duration = calculateSleepDuration()
    if (duration > 0) {
      updateSleep(duration)
      // Reset form
      setBedTime('')
      setWakeTime('')
      setSleepQuality(3)
      setSleepNotes('')
      setShowSleepLog(false)
    }
  }

  const SleepVisualization = () => {
    const moonPhases = Math.min(8, Math.max(1, Math.round(sleepHours)))
    
    return (
      <div className="flex justify-center items-center py-4">
        <div className="relative">
          {/* Sleep Circle */}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'
          }`}>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="text-3xl"
            >
              {isOptimalSleep ? '😴' : sleepHours < 6 ? '😵' : '😪'}
            </motion.div>
          </div>
          
          {/* Moon phases around circle */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45) - 90
            const x = 40 * Math.cos((angle * Math.PI) / 180)
            const y = 40 * Math.sin((angle * Math.PI) / 180)
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: i < moonPhases ? 1 : 0.3,
                  scale: i < moonPhases ? 1 : 0.5
                }}
                transition={{ delay: i * 0.1 }}
                className="absolute text-lg"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                🌙
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  const SleepPhaseChart = () => (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
      <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Typical Sleep Phases
      </h4>
      <div className="space-y-2">
        {SLEEP_PHASES.map((phase) => (
          <div key={phase.phase} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded ${phase.color}`} />
            <span className={`text-sm flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {phase.phase}
            </span>
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {phase.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className={`rounded-2xl shadow-sm border p-6 space-y-6 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-lg flex items-center gap-2 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <Moon className="text-indigo-500" size={20} />
          {t('sleepTracker')}
        </h3>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          darkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <Target size={16} className="text-indigo-500" />
          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            {sleepGoal}h
          </span>
        </div>
      </div>

      {/* Sleep Visualization */}
      <SleepVisualization />

      {/* Current Sleep Stats */}
      <div className="text-center space-y-2">
        <div className={`text-3xl font-bold ${
          isOptimalSleep ? 'text-green-500' : sleepHours < 6 ? 'text-red-500' : 'text-yellow-500'
        }`}>
          {sleepHours}h
        </div>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          last sleep duration
        </div>
        <div className={`text-xs px-2 py-1 rounded-full inline-block ${
          isOptimalSleep 
            ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
            : sleepHours < 6
            ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
            : darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
        }`}>
          {isOptimalSleep ? 'Optimal' : sleepHours < 6 ? 'Insufficient' : 'Acceptable'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Sleep Goal Progress
          </span>
          <span className={`text-sm font-bold ${
            sleepProgress >= 100 ? 'text-green-500' : 'text-indigo-500'
          }`}>
            {Math.round(sleepProgress)}%
          </span>
        </div>
        
        <div className={`h-3 rounded-full overflow-hidden ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${sleepProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              sleepProgress >= 100 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
            }`}
          />
        </div>
      </div>

      {/* Log Sleep Button */}
      <button
        onClick={() => setShowSleepLog(!showSleepLog)}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
          darkMode 
            ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
            : 'bg-indigo-500 text-white hover:bg-indigo-400'
        }`}
      >
        <Clock size={16} />
        Log Sleep
      </button>

      {/* Sleep Log Form */}
      <AnimatePresence>
        {showSleepLog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-lg border space-y-4 ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Log Your Sleep
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Bed Time
                </label>
                <input
                  type="time"
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-xs font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Wake Time
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {bedTime && wakeTime && (
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Duration: {calculateSleepDuration()} hours
              </div>
            )}

            <div>
              <label className={`block text-xs font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Sleep Quality
              </label>
              <div className="flex justify-between gap-2">
                {SLEEP_QUALITY.map((quality) => (
                  <button
                    key={quality.level}
                    onClick={() => setSleepQuality(quality.level)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                      sleepQuality === quality.level
                        ? darkMode ? 'bg-indigo-600/30 ring-1 ring-indigo-500' : 'bg-indigo-100 ring-1 ring-indigo-400'
                        : darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg mb-1">{quality.emoji}</span>
                    <span className={`text-xs ${quality.color}`}>{quality.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={logSleep}
                disabled={!bedTime || !wakeTime}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  bedTime && wakeTime
                    ? 'bg-green-500 text-white hover:bg-green-400'
                    : darkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-200 text-gray-400'
                }`}
              >
                Save Sleep Log
              </button>
              <button
                onClick={() => setShowSleepLog(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleep Phase Chart */}
      <SleepPhaseChart />

      {/* Stats */}
      <div className={`grid grid-cols-3 gap-4 pt-4 border-t ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            {SLEEP_QUALITY[sleepQuality - 1]?.emoji || '😴'}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Quality
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${
            isOptimalSleep ? 'text-green-500' : 'text-yellow-500'
          }`}>
            {isOptimalSleep ? '✅' : '⚠️'}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Status
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            {Math.round(sleepHours * 60)}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Minutes
          </div>
        </div>
      </div>

      {/* Sleep Tip */}
      <div className={`p-3 rounded-lg ${
        darkMode ? 'bg-indigo-900/20' : 'bg-indigo-50'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="text-indigo-500" size={16} />
          <span className={`text-sm font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
            Sleep Tip
          </span>
        </div>
        <p className={`text-xs ${darkMode ? 'text-indigo-200' : 'text-indigo-600'}`}>
          {sleepHours < 6 
            ? "Aim for 7-9 hours of sleep. Try establishing a consistent bedtime routine."
            : sleepHours < 7
            ? "Good start! Try going to bed 30 minutes earlier for optimal rest."
            : isOptimalSleep
            ? "Perfect sleep duration! Keep maintaining this healthy sleep schedule."
            : "You might be getting too much sleep. Consider adjusting your bedtime."
          }
        </p>
      </div>
    </div>
  )
} 