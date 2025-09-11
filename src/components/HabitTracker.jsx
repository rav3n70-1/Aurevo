import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Plus, 
  Calendar,
  Flame,
  Target,
  TrendingUp,
  Check,
  X,
  MoreHorizontal,
  Edit2,
  Trash2,
  Clock,
  Repeat
} from 'lucide-react'
import { useAppStore, useHabitsStore } from '../store'

export default function HabitTracker() {
  const { t } = useTranslation()
  const { darkMode } = useAppStore()
  const { habits, habitLogs, loadHabits, addHabit, logHabit } = useHabitsStore()
  
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [form, setForm] = useState({
    title: '',
    frequency: 'daily',
    targetValue: 1,
    unit: 'times',
    icon: '✅',
    color: '#8b5cf6'
  })

  useEffect(() => {
    loadHabits()
  }, [])

  // Generate heatmap data
  const generateHeatmap = (habitId) => {
    const today = new Date()
    const days = []
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      const hasLog = habitLogs.some(log => 
        log.habitId === habitId && 
        new Date(log.timestamp?.toDate?.() || log.timestamp).toDateString() === date.toDateString()
      )
      
      days.push({
        date: date.toISOString().split('T')[0],
        completed: hasLog,
        day: date.getDate(),
        month: date.getMonth(),
        weekday: date.getDay()
      })
    }
    
    return days
  }

  const handleAddHabit = async () => {
    if (!form.title.trim()) return
    
    await addHabit({
      title: form.title,
      frequency: form.frequency,
      targetValue: form.targetValue,
      unit: form.unit,
      icon: form.icon,
      color: form.color
    })
    
    setForm({
      title: '',
      frequency: 'daily',
      targetValue: 1,
      unit: 'times',
      icon: '✅',
      color: '#8b5cf6'
    })
    setShowAddHabit(false)
  }

  const handleLogHabit = async (habitId) => {
    await logHabit(habitId, 1)
  }

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'text-purple-500'
    if (streak >= 14) return 'text-orange-500'
    if (streak >= 7) return 'text-yellow-500'
    if (streak >= 3) return 'text-blue-500'
    return 'text-gray-400'
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
          <Repeat className="text-green-500" size={20} />
          {t('habitTracker')}
        </h3>
        
        <button
          onClick={() => setShowAddHabit(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            darkMode ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-green-500 text-white hover:bg-green-400'
          }`}
        >
          <Plus size={16} />
          Add Habit
        </button>
      </div>

      {/* Habits List */}
      <div className="space-y-6">
        {habits.map(habit => {
          const heatmapData = generateHeatmap(habit.id)
          const todayCompleted = heatmapData[heatmapData.length - 1]?.completed
          
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{habit.icon}</span>
                  <div>
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {habit.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {habit.frequency}
                      </span>
                      <span className={`flex items-center gap-1 ${getStreakColor(habit.streak)}`}>
                        <Flame size={12} />
                        {habit.streak || 0} day streak
                      </span>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {habit.totalCompletions || 0} total
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLogHabit(habit.id)}
                    disabled={todayCompleted}
                    className={`p-2 rounded-lg transition-colors ${
                      todayCompleted
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 cursor-not-allowed'
                        : darkMode ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-green-500 text-white hover:bg-green-400'
                    }`}
                    title={todayCompleted ? 'Already completed today' : 'Mark as completed'}
                  >
                    <Check size={16} />
                  </button>
                  
                  <button className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}>
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              {/* Heatmap */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Last 90 days
                  </span>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {Math.round((heatmapData.filter(d => d.completed).length / heatmapData.length) * 100)}% completion
                  </span>
                </div>
                
                <div className="grid grid-cols-15 gap-1">
                  {heatmapData.map((day, index) => (
                    <div
                      key={day.date}
                      className={`w-3 h-3 rounded-sm transition-all hover:scale-110 ${
                        day.completed
                          ? habit.color ? `bg-[${habit.color}]` : 'bg-green-500'
                          : darkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}
                      title={`${day.date} - ${day.completed ? 'Completed' : 'Not completed'}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
        
        {habits.length === 0 && (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Repeat size={48} className="mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">No habits yet</h4>
            <p className="text-sm">Create your first habit to start building consistency</p>
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddHabit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-md rounded-lg border shadow-xl p-6 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Create New Habit
                </h3>
                <button 
                  onClick={() => setShowAddHabit(false)} 
                  className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Habit name *"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm(prev => ({ ...prev, frequency: e.target.value }))}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  
                  <input
                    type="number"
                    placeholder="Target"
                    value={form.targetValue}
                    onChange={(e) => setForm(prev => ({ ...prev, targetValue: Number(e.target.value) }))}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Unit (e.g., times, minutes)"
                    value={form.unit}
                    onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  
                  <input
                    type="text"
                    placeholder="Icon (emoji)"
                    value={form.icon}
                    onChange={(e) => setForm(prev => ({ ...prev, icon: e.target.value }))}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleAddHabit}
                    disabled={!form.title.trim()}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      form.title.trim()
                        ? darkMode ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-green-500 text-white hover:bg-green-400'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Create Habit
                  </button>
                  <button
                    onClick={() => setShowAddHabit(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      darkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
} 