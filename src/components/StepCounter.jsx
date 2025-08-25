import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Footprints, 
  Plus, 
  Minus, 
  Target,
  Activity,
  TrendingUp,
  Zap
} from 'lucide-react'
import { useWellnessStore } from '../store'
import { useAppStore } from '../store'

const STEP_GOALS = [
  { steps: 5000, level: 'Beginner', emoji: '🚶', color: 'text-blue-500' },
  { steps: 8000, level: 'Active', emoji: '🚶‍♂️', color: 'text-green-500' },
  { steps: 10000, level: 'Fitness Enthusiast', emoji: '🏃', color: 'text-orange-500' },
  { steps: 15000, level: 'Athletic', emoji: '🏃‍♂️', color: 'text-red-500' },
  { steps: 20000, level: 'Elite', emoji: '🏃‍♀️', color: 'text-purple-500' }
]

const ACTIVITY_TYPES = [
  { name: 'Walking', stepsPerMin: 100, emoji: '🚶' },
  { name: 'Jogging', stepsPerMin: 150, emoji: '🏃' },
  { name: 'Running', stepsPerMin: 180, emoji: '🏃‍♂️' },
  { name: 'Stairs', stepsPerMin: 120, emoji: '🪜' }
]

export default function StepCounter() {
  const { t } = useTranslation()
  const { darkMode } = useAppStore()
  const { steps, updateSteps, saveWellnessData } = useWellnessStore()
  
  const [dailyGoal] = useState(10000)
  const [showActivityInput, setShowActivityInput] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(ACTIVITY_TYPES[0])
  const [activityMinutes, setActivityMinutes] = useState('')

  const progress = Math.min(100, (steps / dailyGoal) * 100)
  const currentLevel = STEP_GOALS.reduce((prev, curr) => 
    steps >= curr.steps ? curr : prev
  )
  const nextLevel = STEP_GOALS.find(level => level.steps > steps)

  // Calculate calories burned (rough estimate: 0.04 calories per step)
  const caloriesBurned = Math.round(steps * 0.04)
  
  // Calculate distance (rough estimate: 0.0008 km per step)
  const distanceKm = (steps * 0.0008).toFixed(2)

  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveWellnessData()
    }, 1000)
    
    return () => clearTimeout(saveTimeout)
  }, [steps, saveWellnessData])

  const addSteps = (amount) => {
    updateSteps(steps + amount)
  }

  const addActivitySteps = () => {
    if (activityMinutes && selectedActivity) {
      const totalSteps = parseInt(activityMinutes) * selectedActivity.stepsPerMin
      addSteps(totalSteps)
      setActivityMinutes('')
      setShowActivityInput(false)
    }
  }

  const StepVisualization = () => {
    const footsteps = Math.min(10, Math.floor(progress / 10))
    
    return (
      <div className="flex justify-center items-center space-x-2 py-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: i < footsteps ? 1 : 0.3,
              scale: i < footsteps ? 1 : 0.8
            }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className={`text-lg ${i < footsteps ? currentLevel.color : 'text-gray-400'}`}
          >
            👣
          </motion.div>
        ))}
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
          <Footprints className="text-green-500" size={20} />
          {t('stepCounter')}
        </h3>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          darkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <Target size={16} className="text-green-500" />
          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            {dailyGoal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Current Level */}
      <div className="text-center">
        <motion.div
          key={currentLevel.emoji}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-4xl mb-2"
        >
          {currentLevel.emoji}
        </motion.div>
        <h4 className={`font-medium ${currentLevel.color}`}>
          {currentLevel.level}
        </h4>
        {nextLevel && (
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {nextLevel.steps - steps} steps to {nextLevel.level}
          </p>
        )}
      </div>

      {/* Step Visualization */}
      <StepVisualization />

      {/* Main Counter */}
      <div className="text-center">
        <div className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {steps.toLocaleString()}
        </div>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          steps today
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Progress
          </span>
          <span className={`text-sm font-bold ${
            progress >= 100 ? 'text-green-500' : currentLevel.color
          }`}>
            {Math.round(progress)}%
          </span>
        </div>
        
        <div className={`h-3 rounded-full overflow-hidden ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              progress >= 100 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-blue-500 to-green-500'
            }`}
          />
        </div>
      </div>

      {/* Manual Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => addSteps(-500)}
          disabled={steps <= 0}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            steps <= 0
              ? darkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-200 text-gray-400'
              : darkMode ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-red-500 text-white hover:bg-red-400'
          }`}
        >
          <Minus size={16} />
        </button>

        <div className={`px-4 py-2 rounded-lg ${
          darkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {steps.toLocaleString()}
          </span>
        </div>

        <button
          onClick={() => addSteps(500)}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            darkMode ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-green-500 text-white hover:bg-green-400'
          }`}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Activity Input */}
      <div className="space-y-3">
        <button
          onClick={() => setShowActivityInput(!showActivityInput)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
            darkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Activity size={16} />
          Add Activity
        </button>

        <AnimatePresence>
          {showActivityInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {ACTIVITY_TYPES.map((activity) => (
                    <button
                      key={activity.name}
                      onClick={() => setSelectedActivity(activity)}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        selectedActivity.name === activity.name
                          ? darkMode ? 'bg-green-600/30 ring-1 ring-green-500' : 'bg-green-100 ring-1 ring-green-400'
                          : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{activity.emoji}</span>
                        <div>
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {activity.name}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {activity.stepsPerMin}/min
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Minutes"
                    value={activityMinutes}
                    onChange={(e) => setActivityMinutes(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    onClick={addActivitySteps}
                    className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-400 transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                {activityMinutes && selectedActivity && (
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Will add ~{parseInt(activityMinutes || 0) * selectedActivity.stepsPerMin} steps
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-3 gap-4 pt-4 border-t ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
            {caloriesBurned}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Calories
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {distanceKm}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            KM
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${currentLevel.color}`}>
            {currentLevel.emoji}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Level
          </div>
        </div>
      </div>

      {/* Motivation */}
      <div className={`p-3 rounded-lg ${
        darkMode ? 'bg-green-900/20' : 'bg-green-50'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="text-green-500" size={16} />
          <span className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
            Fitness Tip
          </span>
        </div>
        <p className={`text-xs ${darkMode ? 'text-green-200' : 'text-green-600'}`}>
          {progress < 25 
            ? "Every step counts! Take the stairs or park further away to add more steps."
            : progress < 50
            ? "Great momentum! Try to take short walks throughout the day."
            : progress < 75
            ? "You're crushing it! Keep moving and stay active."
            : progress < 100
            ? "So close to your goal! A short walk will get you there!"
            : "Goal achieved! Consider increasing your daily target for tomorrow. 🎉"
          }
        </p>
      </div>
    </div>
  )
} 