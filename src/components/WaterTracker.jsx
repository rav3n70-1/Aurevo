
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Droplets, 
  Plus, 
  Minus, 
  Target,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react'
import { useWellnessStore } from '../store'
import { useAppStore } from '../store'

const PLANT_STAGES = [
  { emoji: '🌰', name: 'Seed', minWater: 0, color: 'text-amber-600' },
  { emoji: '🌱', name: 'Sprout', minWater: 500, color: 'text-green-400' },
  { emoji: '🌿', name: 'Growing', minWater: 1000, color: 'text-green-500' },
  { emoji: '🪴', name: 'Young Plant', minWater: 1500, color: 'text-green-600' },
  { emoji: '🌳', name: 'Mature Tree', minWater: 2000, color: 'text-green-700' },
  { emoji: '🌸', name: 'Blooming', minWater: 2500, color: 'text-pink-500' }
]

const WATER_AMOUNTS = [
  { amount: 250, label: '250ml', icon: '🥤' },
  { amount: 500, label: '500ml', icon: '🧴' },
  { amount: 750, label: '750ml', icon: '🍶' },
  { amount: 1000, label: '1L', icon: '🍼' }
]

export default function WaterTracker() {
  const { t } = useTranslation()
  const { darkMode } = useAppStore()
  const { 
    waterIntake, 
    dailyWaterGoal, 
    updateWaterIntake, 
    saveWellnessData 
  } = useWellnessStore()
  
  const [showCelebration, setShowCelebration] = useState(false)
  const [lastGoalReached, setLastGoalReached] = useState(false)

  // Calculate progress and plant stage
  const progress = Math.min(100, (waterIntake / dailyWaterGoal) * 100)
  const currentPlantStage = PLANT_STAGES.reduce((prev, curr) => 
    waterIntake >= curr.minWater ? curr : prev
  )
  
  const nextPlantStage = PLANT_STAGES.find(stage => stage.minWater > waterIntake)

  // Check if goal was just reached
  useEffect(() => {
    if (waterIntake >= dailyWaterGoal && !lastGoalReached) {
      setShowCelebration(true)
      setLastGoalReached(true)
      setTimeout(() => setShowCelebration(false), 3000)
    } else if (waterIntake < dailyWaterGoal) {
      setLastGoalReached(false)
    }
  }, [waterIntake, dailyWaterGoal, lastGoalReached])

  // Save data when waterIntake changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveWellnessData()
    }, 1000)
    
    return () => clearTimeout(saveTimeout)
  }, [waterIntake, saveWellnessData])

  const handleWaterUpdate = (amount) => {
    updateWaterIntake(amount)
  }

  const PlantAnimation = () => (
    <div className="relative flex flex-col items-center">
      {/* Plant */}
      <motion.div
        key={currentPlantStage.emoji}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={`text-6xl ${currentPlantStage.color} mb-2`}
      >
        {currentPlantStage.emoji}
      </motion.div>

      {/* Water Drops Animation */}
      <AnimatePresence>
        {Array.from({ length: Math.min(5, Math.floor(progress / 20)) }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
            className="absolute text-blue-400 text-lg"
            style={{ 
              left: `${20 + i * 15}%`,
              top: `${10 + i * 5}%`
            }}
          >
            💧
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Progress Soil */}
      <div className={`w-20 h-6 rounded-b-full relative overflow-hidden ${
        darkMode ? 'bg-amber-900' : 'bg-amber-700'
      }`}>
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(20, progress)}%` }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-blue-200 rounded-b-full"
        />
      </div>

      {/* Plant Stage Info */}
      <div className="text-center mt-3">
        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {currentPlantStage.name}
        </p>
        {nextPlantStage && (
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Next: {nextPlantStage.name} ({nextPlantStage.minWater}ml)
          </p>
        )}
      </div>
    </div>
  )

  return (
    <div className={`rounded-2xl shadow-sm border p-6 space-y-6 relative overflow-hidden ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Celebration Effect */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-2xl z-10"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-2"
              >
                🎉
              </motion.div>
              <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Goal Reached!
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Great hydration! +50 XP
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-lg flex items-center gap-2 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <Droplets className="text-blue-500" size={20} />
          {t('hydrationTracker')}
        </h3>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          darkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <Target size={16} className="text-blue-500" />
          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            {dailyWaterGoal}ml
          </span>
        </div>
      </div>

      {/* Plant Animation */}
      <div className="flex justify-center py-4">
        <PlantAnimation />
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {waterIntake}ml / {dailyWaterGoal}ml
          </span>
          <span className={`text-sm font-bold ${
            progress >= 100 ? 'text-green-500' : 'text-blue-500'
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
                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
            }`}
          />
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {WATER_AMOUNTS.map((water) => (
          <motion.button
            key={water.amount}
            onClick={() => handleWaterUpdate(water.amount)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-lg">{water.icon}</span>
            <span className="text-sm font-medium">+{water.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Manual Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => handleWaterUpdate(-250)}
          disabled={waterIntake <= 0}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            waterIntake <= 0
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
            {waterIntake}ml
          </span>
        </div>

        <button
          onClick={() => handleWaterUpdate(250)}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-500 text-white hover:bg-blue-400'
          }`}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Stats and Motivation */}
      <div className={`grid grid-cols-3 gap-4 pt-4 border-t ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {Math.floor(waterIntake / 250)}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Glasses
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${
            progress >= 100 ? 'text-green-500' : 'text-yellow-500'
          }`}>
            {progress >= 100 ? '✅' : '⏳'}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {progress >= 100 ? 'Complete' : 'In Progress'}
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            {currentPlantStage.emoji}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Plant Stage
          </div>
        </div>
      </div>

      {/* Hydration Tips */}
      <div className={`p-3 rounded-lg ${
        darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="text-blue-500" size={16} />
          <span className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
            Hydration Tip
          </span>
        </div>
        <p className={`text-xs ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>
          {progress < 25 
            ? "Start your day with a glass of water to kickstart your metabolism!"
            : progress < 50
            ? "Great start! Try drinking water before each meal to stay consistent."
            : progress < 75
            ? "You're doing amazing! Keep this momentum going throughout the day."
            : progress < 100
            ? "Almost there! One more push to reach your hydration goal!"
            : "Excellent hydration! Your body and mind will thank you. 🎉"
          }
        </p>
      </div>
    </div>
  )
}
