import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Apple, 
  Plus, 
  Minus, 
  Camera,
  Search,
  Target,
  Flame,
  TrendingUp
} from 'lucide-react'
import { useWellnessStore } from '../store'
import { useAppStore } from '../store'

const COMMON_FOODS = [
  { name: 'Apple', calories: 95, emoji: '🍎', category: 'fruit' },
  { name: 'Banana', calories: 105, emoji: '🍌', category: 'fruit' },
  { name: 'Chicken Breast', calories: 165, emoji: '🍗', category: 'protein' },
  { name: 'Rice (1 cup)', calories: 205, emoji: '🍚', category: 'carb' },
  { name: 'Eggs', calories: 155, emoji: '🥚', category: 'protein' },
  { name: 'Bread (1 slice)', calories: 80, emoji: '🍞', category: 'carb' },
  { name: 'Yogurt', calories: 150, emoji: '🥛', category: 'dairy' },
  { name: 'Salad', calories: 50, emoji: '🥗', category: 'vegetable' }
]

const CALORIE_GOALS = {
  sedentary: { male: 2200, female: 1800 },
  moderate: { male: 2400, female: 2000 },
  active: { male: 2600, female: 2200 }
}

export default function CalorieTracker() {
  const { t } = useTranslation()
  const { darkMode } = useAppStore()
  const { calories, updateCalories, saveWellnessData } = useWellnessStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [customFood, setCustomFood] = useState({ name: '', calories: '' })
  const [showAddFood, setShowAddFood] = useState(false)
  const [dailyGoal] = useState(2000) // This would be configurable based on user profile
  const [todaysMeals, setTodaysMeals] = useState([])

  const progress = Math.min(100, (calories / dailyGoal) * 100)
  const remaining = Math.max(0, dailyGoal - calories)

  const filteredFoods = COMMON_FOODS.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveWellnessData()
    }, 1000)
    
    return () => clearTimeout(saveTimeout)
  }, [calories, saveWellnessData])

  const addFood = (food, quantity = 1) => {
    const totalCalories = food.calories * quantity
    updateCalories(calories + totalCalories)
    
    // Add to today's meals
    const newMeal = {
      ...food,
      quantity,
      totalCalories,
      timestamp: new Date(),
      id: Date.now()
    }
    setTodaysMeals(prev => [...prev, newMeal])
  }

  const removeFood = (mealId) => {
    const meal = todaysMeals.find(m => m.id === mealId)
    if (meal) {
      updateCalories(calories - meal.totalCalories)
      setTodaysMeals(prev => prev.filter(m => m.id !== mealId))
    }
  }

  const addCustomFood = () => {
    if (customFood.name && customFood.calories) {
      const food = {
        name: customFood.name,
        calories: parseInt(customFood.calories),
        emoji: '🍽️',
        category: 'custom'
      }
      addFood(food)
      setCustomFood({ name: '', calories: '' })
      setShowAddFood(false)
    }
  }

  const CalorieProgress = () => {
    const isOverGoal = calories > dailyGoal
    const progressWidth = isOverGoal ? 100 : progress
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {calories} / {dailyGoal} kcal
          </span>
          <span className={`text-sm font-bold ${
            isOverGoal ? 'text-red-500' : progress >= 80 ? 'text-orange-500' : 'text-green-500'
          }`}>
            {isOverGoal ? `+${calories - dailyGoal}` : remaining} left
          </span>
        </div>
        
        <div className={`h-3 rounded-full overflow-hidden ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isOverGoal 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : progress >= 80
                ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                : 'bg-gradient-to-r from-green-500 to-green-600'
            }`}
          />
          {isOverGoal && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((calories - dailyGoal) / dailyGoal) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
              className="h-full bg-gradient-to-r from-red-600 to-red-700 absolute top-0"
              style={{ left: '100%' }}
            />
          )}
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
          <Flame className="text-orange-500" size={20} />
          {t('calorieTracker')}
        </h3>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          darkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <Target size={16} className="text-orange-500" />
          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            {dailyGoal} kcal
          </span>
        </div>
      </div>

      {/* Progress */}
      <CalorieProgress />

      {/* Search and Add */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          
          <button
            onClick={() => setShowAddFood(!showAddFood)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-orange-600 text-white hover:bg-orange-500' 
                : 'bg-orange-500 text-white hover:bg-orange-400'
            }`}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Custom Food Input */}
        <AnimatePresence>
          {showAddFood && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Add Custom Food
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Food name"
                  value={customFood.name}
                  onChange={(e) => setCustomFood(prev => ({ ...prev, name: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <input
                  type="number"
                  placeholder="Calories"
                  value={customFood.calories}
                  onChange={(e) => setCustomFood(prev => ({ ...prev, calories: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={addCustomFood}
                  className="flex-1 py-2 rounded-lg bg-green-500 text-white hover:bg-green-400 transition-colors"
                >
                  Add Food
                </button>
                <button
                  onClick={() => setShowAddFood(false)}
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
      </div>

      {/* Food Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
        {filteredFoods.map((food, index) => (
          <motion.button
            key={food.name}
            onClick={() => addFood(food)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-lg text-left transition-colors ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{food.emoji}</span>
              <span className="text-sm font-medium truncate">{food.name}</span>
            </div>
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {food.calories} kcal
            </span>
          </motion.button>
        ))}
      </div>

      {/* Today's Meals */}
      {todaysMeals.length > 0 && (
        <div className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <TrendingUp size={16} />
            Today's Meals
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {todaysMeals.map((meal) => (
              <div
                key={meal.id}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{meal.emoji}</span>
                  <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {meal.name}
                  </span>
                  {meal.quantity > 1 && (
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      x{meal.quantity}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                    {meal.totalCalories} kcal
                  </span>
                  <button
                    onClick={() => removeFood(meal.id)}
                    className={`p-1 rounded ${
                      darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    <Minus size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className={`grid grid-cols-3 gap-4 pt-4 border-t ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
            {todaysMeals.length}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Meals
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${
            progress >= 100 ? 'text-green-500' : 'text-yellow-500'
          }`}>
            {Math.round(progress)}%
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Progress
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {Math.round(calories / (todaysMeals.length || 1))}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Avg/Meal
          </div>
        </div>
      </div>

      {/* Nutritional Tip */}
      <div className={`p-3 rounded-lg ${
        darkMode ? 'bg-orange-900/20' : 'bg-orange-50'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Apple className="text-orange-500" size={16} />
          <span className={`text-sm font-medium ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
            Nutrition Tip
          </span>
        </div>
        <p className={`text-xs ${darkMode ? 'text-orange-200' : 'text-orange-600'}`}>
          {progress < 25 
            ? "Don't skip breakfast! It kickstarts your metabolism for the day."
            : progress < 50
            ? "Great start! Try to include protein with each meal for sustained energy."
            : progress < 75
            ? "You're on track! Remember to stay hydrated and eat plenty of vegetables."
            : progress < 100
            ? "Almost at your goal! Listen to your body's hunger cues."
            : "Goal reached! Focus on nutritious choices for the rest of the day."
          }
        </p>
      </div>
    </div>
  )
} 