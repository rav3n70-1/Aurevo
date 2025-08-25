import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  User, 
  Target, 
  Droplets, 
  Footprints, 
  Moon, 
  Utensils,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react'
import { useAppStore, useWellnessStore } from '../store'
import toast from 'react-hot-toast'

export default function Onboarding() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { darkMode, user, syncProfile } = useAppStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const [preferences, setPreferences] = useState({
    displayName: user?.displayName || '',
    age: '',
    activityLevel: 'moderate',
    goals: [],
    waterGoal: 2000,
    stepGoal: 10000,
    sleepGoal: 8,
    calorieGoal: 2000,
    studyGoals: []
  })

  const totalSteps = 4

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Minimal physical activity' },
    { value: 'moderate', label: 'Moderate', desc: 'Some exercise/activity' },
    { value: 'active', label: 'Very Active', desc: 'Regular exercise' }
  ]

  const healthGoals = [
    { id: 'hydration', label: 'Stay Hydrated', icon: '💧' },
    { id: 'fitness', label: 'Get Fit', icon: '💪' },
    { id: 'sleep', label: 'Better Sleep', icon: '😴' },
    { id: 'nutrition', label: 'Eat Healthy', icon: '🥗' },
    { id: 'mental', label: 'Mental Wellness', icon: '🧠' }
  ]

  const studyGoals = [
    { id: 'focus', label: 'Improve Focus', icon: '🎯' },
    { id: 'productivity', label: 'Be More Productive', icon: '⚡' },
    { id: 'learning', label: 'Learn Effectively', icon: '📚' },
    { id: 'memory', label: 'Better Memory', icon: '🧠' },
    { id: 'habits', label: 'Build Study Habits', icon: '📅' }
  ]

  const handleGoalToggle = (goalId, type) => {
    setPreferences(prev => ({
      ...prev,
      [type]: prev[type].includes(goalId)
        ? prev[type].filter(id => id !== goalId)
        : [...prev[type], goalId]
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    try {
      // Save preferences to user profile
      await syncProfile()
      toast.success('Welcome to Aurevo! Your profile is set up.')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      toast.error('Failed to save preferences. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`w-3 h-3 rounded-full transition-colors ${
            index + 1 <= currentStep
              ? 'bg-violet-600'
              : darkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <User className="mx-auto mb-4 text-violet-600" size={48} />
              <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Welcome to Aurevo!
              </h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Let's personalize your experience
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={preferences.displayName}
                  onChange={(e) => setPreferences(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="What should we call you?"
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Age (Optional)
                </label>
                <input
                  type="number"
                  value={preferences.age}
                  onChange={(e) => setPreferences(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Your age"
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Activity Level
                </label>
                <div className="space-y-2">
                  {activityLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setPreferences(prev => ({ ...prev, activityLevel: level.value }))}
                      className={`w-full p-4 rounded-xl text-left transition-colors ${
                        preferences.activityLevel === level.value
                          ? darkMode ? 'bg-violet-600/30 ring-2 ring-violet-500' : 'bg-violet-100 ring-2 ring-violet-400'
                          : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {level.label}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {level.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Target className="mx-auto mb-4 text-green-600" size={48} />
              <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Your Health Goals
              </h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                What would you like to focus on?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {healthGoals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalToggle(goal.id, 'goals')}
                  className={`p-4 rounded-xl text-center transition-colors ${
                    preferences.goals.includes(goal.id)
                      ? darkMode ? 'bg-green-600/30 ring-2 ring-green-500' : 'bg-green-100 ring-2 ring-green-400'
                      : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-2xl mb-2">{goal.icon}</div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {goal.label}
                  </div>
                  {preferences.goals.includes(goal.id) && (
                    <Check className="mx-auto mt-2 text-green-500" size={16} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Target className="mx-auto mb-4 text-blue-600" size={48} />
              <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Daily Targets
              </h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Set your daily wellness goals
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Droplets className="inline mr-2" size={16} />
                    Water Goal (ml)
                  </label>
                  <input
                    type="number"
                    value={preferences.waterGoal}
                    onChange={(e) => setPreferences(prev => ({ ...prev, waterGoal: parseInt(e.target.value) || 2000 }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Footprints className="inline mr-2" size={16} />
                    Steps Goal
                  </label>
                  <input
                    type="number"
                    value={preferences.stepGoal}
                    onChange={(e) => setPreferences(prev => ({ ...prev, stepGoal: parseInt(e.target.value) || 10000 }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Moon className="inline mr-2" size={16} />
                    Sleep Goal (hours)
                  </label>
                  <input
                    type="number"
                    value={preferences.sleepGoal}
                    onChange={(e) => setPreferences(prev => ({ ...prev, sleepGoal: parseInt(e.target.value) || 8 }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Utensils className="inline mr-2" size={16} />
                    Calorie Goal
                  </label>
                  <input
                    type="number"
                    value={preferences.calorieGoal}
                    onChange={(e) => setPreferences(prev => ({ ...prev, calorieGoal: parseInt(e.target.value) || 2000 }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Target className="mx-auto mb-4 text-purple-600" size={48} />
              <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Study Goals
              </h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                What academic goals would you like to achieve?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {studyGoals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalToggle(goal.id, 'studyGoals')}
                  className={`p-4 rounded-xl text-center transition-colors ${
                    preferences.studyGoals.includes(goal.id)
                      ? darkMode ? 'bg-purple-600/30 ring-2 ring-purple-500' : 'bg-purple-100 ring-2 ring-purple-400'
                      : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-2xl mb-2">{goal.icon}</div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {goal.label}
                  </div>
                  {preferences.studyGoals.includes(goal.id) && (
                    <Check className="mx-auto mt-2 text-purple-500" size={16} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
        : 'bg-gradient-to-br from-violet-100 via-sky-100 to-rose-100'
    }`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className={`w-full max-w-2xl backdrop-blur-lg rounded-3xl shadow-2xl p-8 ${
          darkMode 
            ? 'bg-gray-800/50 border border-gray-700/50' 
            : 'bg-white/70 border border-white/20'
        }`}
      >
        <StepIndicator />
        
        <div className="min-h-96">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
              currentStep === 1
                ? 'opacity-50 cursor-not-allowed'
                : darkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft size={20} />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              darkMode
                ? 'bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50'
                : 'bg-violet-500 text-white hover:bg-violet-400 disabled:opacity-50'
            }`}
          >
            {isLoading ? (
              'Setting up...'
            ) : currentStep === totalSteps ? (
              'Complete Setup'
            ) : (
              <>
                Next
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
