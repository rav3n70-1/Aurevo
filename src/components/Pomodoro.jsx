
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Coffee, 
  BookOpen,
  TrendingUp,
  Target,
  Timer
} from 'lucide-react'
import { useTaskStore } from '../store'
import { useAppStore } from '../store'

const TIMER_PRESETS = {
  pomodoro: { work: 25, shortBreak: 5, longBreak: 15, cycles: 4 },
  study: { work: 50, shortBreak: 10, longBreak: 30, cycles: 3 },
  focus: { work: 30, shortBreak: 5, longBreak: 20, cycles: 4 },
  custom: { work: 25, shortBreak: 5, longBreak: 15, cycles: 4 }
}

const TIMER_STATES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak', 
  LONG_BREAK: 'longBreak',
  STOPPED: 'stopped'
}

const BACKGROUND_SOUNDS = [
  { name: 'None', value: 'none' },
  { name: 'Rain', value: 'rain', emoji: '🌧️' },
  { name: 'Forest', value: 'forest', emoji: '🌲' },
  { name: 'Ocean', value: 'ocean', emoji: '🌊' },
  { name: 'Coffee Shop', value: 'cafe', emoji: '☕' }
]

export default function Pomodoro() {
  const { t } = useTranslation()
  const { darkMode, addXP } = useAppStore()
  const { addStudySession } = useTaskStore()
  
  const [preset, setPreset] = useState('pomodoro')
  const [timerState, setTimerState] = useState(TIMER_STATES.STOPPED)
  const [seconds, setSeconds] = useState(TIMER_PRESETS.pomodoro.work * 60)
  const [running, setRunning] = useState(false)
  const [currentCycle, setCurrentCycle] = useState(1)
  const [completedCycles, setCompletedCycles] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [customSettings, setCustomSettings] = useState(TIMER_PRESETS.custom)
  const [backgroundSound, setBackgroundSound] = useState('none')
  const [subject, setSubject] = useState('')
  const [sessionsToday, setSessionsToday] = useState(0)

  const currentPreset = preset === 'custom' ? customSettings : TIMER_PRESETS[preset]
  const totalCycles = currentPreset.cycles

  // Timer logic
  useEffect(() => {
    if (!running) return
    
    const id = setInterval(() => {
      setSeconds(s => {
        if (s > 0) return s - 1
        
        // Timer finished
        setRunning(false)
        handleTimerComplete()
        return 0
      })
    }, 1000)
    
    return () => clearInterval(id)
  }, [running])

  const handleTimerComplete = () => {
    if (timerState === TIMER_STATES.WORK) {
      // Work session completed
      setCompletedCycles(prev => prev + 1)
      setSessionsToday(prev => prev + 1)
      
      // Add XP and log study session
      addXP(50)
      addStudySession({
        subject: subject || 'Study Session',
        duration: currentPreset.work,
        type: 'pomodoro'
      })
      
      // Start break
      if (currentCycle >= totalCycles) {
        // Long break
        setTimerState(TIMER_STATES.LONG_BREAK)
        setSeconds(currentPreset.longBreak * 60)
        setCurrentCycle(1)
      } else {
        // Short break
        setTimerState(TIMER_STATES.SHORT_BREAK)
        setSeconds(currentPreset.shortBreak * 60)
        setCurrentCycle(prev => prev + 1)
      }
    } else {
      // Break completed, start work
      setTimerState(TIMER_STATES.WORK)
      setSeconds(currentPreset.work * 60)
    }
    
    // Auto-start next session (can be disabled in settings)
    setRunning(true)
  }

  const startTimer = () => {
    if (timerState === TIMER_STATES.STOPPED) {
      setTimerState(TIMER_STATES.WORK)
      setSeconds(currentPreset.work * 60)
    }
    setRunning(true)
  }

  const pauseTimer = () => {
    setRunning(false)
  }

  const resetTimer = () => {
    setRunning(false)
    setTimerState(TIMER_STATES.STOPPED)
    setSeconds(currentPreset.work * 60)
    setCurrentCycle(1)
  }

  const changePreset = (newPreset) => {
    setPreset(newPreset)
    resetTimer()
    const presetSettings = newPreset === 'custom' ? customSettings : TIMER_PRESETS[newPreset]
    setSeconds(presetSettings.work * 60)
  }

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const getTimerColor = () => {
    switch (timerState) {
      case TIMER_STATES.WORK:
        return 'text-red-500'
      case TIMER_STATES.SHORT_BREAK:
        return 'text-green-500'
      case TIMER_STATES.LONG_BREAK:
        return 'text-blue-500'
      default:
        return darkMode ? 'text-white' : 'text-gray-800'
    }
  }

  const getProgressColor = () => {
    switch (timerState) {
      case TIMER_STATES.WORK:
        return 'stroke-red-500'
      case TIMER_STATES.SHORT_BREAK:
        return 'stroke-green-500'
      case TIMER_STATES.LONG_BREAK:
        return 'stroke-blue-500'
      default:
        return 'stroke-gray-400'
    }
  }

  const CircularProgress = () => {
    const totalTime = timerState === TIMER_STATES.WORK 
      ? currentPreset.work * 60
      : timerState === TIMER_STATES.SHORT_BREAK
      ? currentPreset.shortBreak * 60
      : currentPreset.longBreak * 60
    
    const progress = ((totalTime - seconds) / totalTime) * 100
    const circumference = 2 * Math.PI * 90
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke={darkMode ? '#374151' : '#e5e7eb'}
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className={getProgressColor()}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-4xl font-mono font-bold ${getTimerColor()}`}>
            {formatTime(seconds)}
          </div>
          <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {timerState === TIMER_STATES.WORK && 'Focus Time'}
            {timerState === TIMER_STATES.SHORT_BREAK && 'Short Break'}
            {timerState === TIMER_STATES.LONG_BREAK && 'Long Break'}
            {timerState === TIMER_STATES.STOPPED && 'Ready to Start'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl shadow-sm border p-6 space-y-6 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-lg flex items-center gap-2 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <Timer className="text-red-500" size={20} />
          {t('pomodoro')}
        </h3>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-colors ${
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <Settings size={16} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
        </button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-lg border space-y-4 ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Timer Settings
            </h4>
            
            {/* Preset Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Timer Preset
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(TIMER_PRESETS).map((presetKey) => (
                  <button
                    key={presetKey}
                    onClick={() => changePreset(presetKey)}
                    className={`p-2 rounded-lg text-sm transition-colors ${
                      preset === presetKey
                        ? darkMode ? 'bg-red-600/30 ring-1 ring-red-500' : 'bg-red-100 ring-1 ring-red-400'
                        : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {presetKey.charAt(0).toUpperCase() + presetKey.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Study Subject
              </label>
              <input
                type="text"
                placeholder="What are you studying?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Background Sound */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Background Sound
              </label>
              <div className="grid grid-cols-3 gap-2">
                {BACKGROUND_SOUNDS.map((sound) => (
                  <button
                    key={sound.value}
                    onClick={() => setBackgroundSound(sound.value)}
                    className={`p-2 rounded-lg text-sm transition-colors ${
                      backgroundSound === sound.value
                        ? darkMode ? 'bg-blue-600/30 ring-1 ring-blue-500' : 'bg-blue-100 ring-1 ring-blue-400'
                        : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <div>{sound.emoji}</div>
                    <div className="text-xs">{sound.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circular Timer */}
      <div className="flex justify-center">
        <CircularProgress />
      </div>

      {/* Cycle Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Cycle {currentCycle} of {totalCycles}
          </span>
          <span className={`text-sm font-bold ${getTimerColor()}`}>
            {completedCycles} completed
          </span>
        </div>
        
        <div className={`h-2 rounded-full overflow-hidden ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCycles / totalCycles) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-red-500 to-orange-500"
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={resetTimer}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
            darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <RotateCcw size={20} />
        </button>

        <motion.button
          onClick={running ? pauseTimer : startTimer}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center justify-center w-16 h-16 rounded-full text-white transition-colors ${
            running ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-red-500 hover:bg-red-400'
          }`}
        >
          {running ? <Pause size={24} /> : <Play size={24} />}
        </motion.button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
            darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Today's Stats */}
      <div className={`grid grid-cols-3 gap-4 pt-4 border-t ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
            {sessionsToday}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Sessions
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
            {Math.round((sessionsToday * currentPreset.work) / 60 * 10) / 10}h
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Focus Time
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {timerState === TIMER_STATES.WORK ? '🔥' : timerState !== TIMER_STATES.STOPPED ? '☕' : '⏸️'}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Status
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className={`p-3 rounded-lg ${
        darkMode ? 'bg-red-900/20' : 'bg-red-50'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="text-red-500" size={16} />
          <span className={`text-sm font-medium ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
            Focus Tip
          </span>
        </div>
        <p className={`text-xs ${darkMode ? 'text-red-200' : 'text-red-600'}`}>
          {timerState === TIMER_STATES.WORK
            ? "Stay focused! You're building your concentration muscle."
            : timerState !== TIMER_STATES.STOPPED
            ? "Enjoy your break! Rest is essential for productivity."
            : "Ready to dive deep into focused work? Let's make this session count!"
          }
        </p>
      </div>
    </div>
  )
}
