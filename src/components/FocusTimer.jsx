import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Target,
  Clock,
  Coffee,
  Brain,
  Zap,
  Trophy,
  X
} from 'lucide-react'
import { useAppStore, useFocusStore, useTaskStore } from '../store'

export default function FocusTimer({ goalId, onClose }) {
  const { t } = useTranslation()
  const { darkMode } = useAppStore()
  const { 
    currentSession, 
    isActive, 
    timeRemaining, 
    sessionType, 
    settings,
    startFocusSession, 
    completeFocusSession 
  } = useFocusStore()
  const { goals } = useTaskStore()
  
  const [localTimeRemaining, setLocalTimeRemaining] = useState(0)
  const [sessionCount, setSessionCount] = useState(0)
  const [isBreak, setIsBreak] = useState(false)
  const intervalRef = useRef(null)

  const selectedGoal = goals.find(g => g.id === goalId)

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setLocalTimeRemaining(prev => {
          if (prev <= 1) {
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, timeRemaining])

  useEffect(() => {
    setLocalTimeRemaining(timeRemaining)
  }, [timeRemaining])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    if (!isActive) {
      const duration = isBreak 
        ? sessionCount % 4 === 0 ? settings.longBreakDuration : settings.shortBreakDuration
        : settings.focusDuration
      
      startFocusSession(goalId, duration)
      setLocalTimeRemaining(duration * 60)
    }
  }

  const handlePause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setLocalTimeRemaining(settings.focusDuration * 60)
    setIsBreak(false)
  }

  const handleSessionComplete = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (!isBreak) {
      await completeFocusSession()
      setSessionCount(prev => prev + 1)
      
      // Start break
      const breakDuration = sessionCount % 3 === 0 ? settings.longBreakDuration : settings.shortBreakDuration
      setIsBreak(true)
      setLocalTimeRemaining(breakDuration * 60)
    } else {
      // Break complete, ready for next focus session
      setIsBreak(false)
      setLocalTimeRemaining(settings.focusDuration * 60)
    }
  }

  const progress = localTimeRemaining > 0 
    ? ((isBreak 
        ? (sessionCount % 4 === 0 ? settings.longBreakDuration : settings.shortBreakDuration) * 60 - localTimeRemaining
        : settings.focusDuration * 60 - localTimeRemaining
      ) / (isBreak 
        ? (sessionCount % 4 === 0 ? settings.longBreakDuration : settings.shortBreakDuration) * 60
        : settings.focusDuration * 60
      )) * 100
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`w-full max-w-md rounded-xl border shadow-xl p-8 text-center ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {isBreak ? (
              <>
                <Coffee className="text-orange-500" size={20} />
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Break Time
                </span>
              </>
            ) : (
              <>
                <Brain className="text-violet-500" size={20} />
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Focus Session
                </span>
              </>
            )}
          </div>
          <button 
            onClick={onClose}
            className={`p-1 rounded ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <X size={18} />
          </button>
        </div>

        {selectedGoal && (
          <div className={`mb-6 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 justify-center">
              <Target size={16} className="text-violet-500" />
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {selectedGoal.title}
              </span>
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={darkMode ? '#374151' : '#e5e7eb'}
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={isBreak ? '#f97316' : '#8b5cf6'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${isBreak ? 'text-orange-500' : 'text-violet-500'}`}>
                {formatTime(localTimeRemaining)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {sessionCount}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Sessions
              </div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {Math.floor((sessionCount * settings.focusDuration) / 60)}h
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Total
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            disabled={isActive}
            className={`p-4 rounded-full transition-colors ${
              isActive
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isBreak
                  ? darkMode ? 'bg-orange-600 text-white hover:bg-orange-500' : 'bg-orange-500 text-white hover:bg-orange-400'
                  : darkMode ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-violet-500 text-white hover:bg-violet-400'
            }`}
          >
            <Play size={24} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePause}
            disabled={!isActive}
            className={`p-4 rounded-full transition-colors ${
              !isActive
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : darkMode ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-red-500 text-white hover:bg-red-400'
            }`}
          >
            <Pause size={24} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className={`p-4 rounded-full transition-colors ${
              darkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-500 text-white hover:bg-gray-400'
            }`}
          >
            <RotateCcw size={24} />
          </motion.button>
        </div>

        {/* Session Stats */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className={`text-sm font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                {sessionCount}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Today
              </div>
            </div>
            <div>
              <div className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {sessionCount * 4}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Week
              </div>
            </div>
            <div>
              <div className={`text-sm font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {Math.floor(progress)}%
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Progress
              </div>
            </div>
            <div>
              <div className={`text-sm font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                🔥7
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Streak
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 