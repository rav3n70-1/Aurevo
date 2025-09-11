import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useTaskStore } from '../store'
import { Target, Plus, Calendar, TrendingUp, Award, CheckCircle, X, Edit2, Trash2, Search, Filter, MoreHorizontal, Flag, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-green-600', bgColor: 'bg-green-100', darkBgColor: 'bg-green-900/30' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100', darkBgColor: 'bg-yellow-900/30' },
  { value: 'high', label: 'High', color: 'text-red-600', bgColor: 'bg-red-100', darkBgColor: 'bg-red-900/30' }
]

const CATEGORIES = [
  { value: 'general', label: 'General', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { value: 'health', label: 'Health', color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'academic', label: 'Academic', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { value: 'career', label: 'Career', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { value: 'personal', label: 'Personal', color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { value: 'finance', label: 'Finance', color: 'text-emerald-600', bgColor: 'bg-emerald-100' }
]

export default function Goals() {
  const { t } = useTranslation()
  const { darkMode, isLoading, user } = useAppStore()
  const { goals, loadGoals, addGoal, updateGoal, deleteGoal, toggleGoalComplete, updateGoalProgress } = useTaskStore()
  
  // UI State
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [showEditGoal, setShowEditGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [sortBy, setSortBy] = useState('created')
  
  // Form State
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    category: 'general', 
    priority: 'medium',
    deadline: '',
    progress: 0
  })

  useEffect(() => {
    if (user) loadGoals()
  }, [user, loadGoals])

  // Statistics
  const stats = useMemo(() => {
    const active = goals.filter(g => !g.completed).length
    const completed = goals.filter(g => g.completed).length
    const overdue = goals.filter(g => {
      if (g.completed || !g.deadline) return false
      const deadline = new Date(g.deadline?.toDate?.() || g.deadline)
      return deadline < new Date()
    }).length
    const thisMonth = goals.filter(g => {
      if (!g.createdAt && !g.timestamp) return false
      const d = g.createdAt?.toDate?.() || g.timestamp?.toDate?.() || new Date(g.createdAt || g.timestamp)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    return { active, completed, overdue, thisMonth }
  }, [goals])

  // Filtered and sorted goals
  const filteredGoals = useMemo(() => {
    let filtered = goals.filter(goal => {
      // Search filter
      if (searchTerm && !goal.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !goal.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Category filter
      if (filterCategory !== 'all' && goal.category !== filterCategory) return false
      
      // Status filter
      if (filterStatus === 'completed' && !goal.completed) return false
      if (filterStatus === 'active' && goal.completed) return false
      if (filterStatus === 'overdue') {
        if (goal.completed || !goal.deadline) return false
        const deadline = new Date(goal.deadline?.toDate?.() || goal.deadline)
        if (deadline >= new Date()) return false
      }
      
      // Priority filter
      if (filterPriority !== 'all' && goal.priority !== filterPriority) return false
      
      return true
    })

    // Sort goals
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium']
        case 'progress':
          return (b.progress || 0) - (a.progress || 0)
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          const aDate = new Date(a.deadline?.toDate?.() || a.deadline)
          const bDate = new Date(b.deadline?.toDate?.() || b.deadline)
          return aDate - bDate
        case 'created':
        default:
          const aTime = a.createdAt?.toDate?.() || a.timestamp?.toDate?.() || new Date(a.createdAt || a.timestamp)
          const bTime = b.createdAt?.toDate?.() || b.timestamp?.toDate?.() || new Date(b.createdAt || b.timestamp)
          return bTime - aTime
      }
    })

    return filtered
  }, [goals, searchTerm, filterCategory, filterStatus, filterPriority, sortBy])

  const handleCreate = async () => {
    if (!form.title.trim()) return
    await addGoal({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      deadline: form.deadline ? new Date(form.deadline) : null,
      progress: Number(form.progress) || 0
    })
    resetForm()
    setShowNewGoal(false)
  }

  const handleEdit = async () => {
    if (!editingGoal || !form.title.trim()) return
    await updateGoal(editingGoal.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      deadline: form.deadline ? new Date(form.deadline) : null
    })
    resetForm()
    setShowEditGoal(false)
    setEditingGoal(null)
  }

  const openEditModal = (goal) => {
    setEditingGoal(goal)
    setForm({
      title: goal.title,
      description: goal.description || '',
      category: goal.category || 'general',
      priority: goal.priority || 'medium',
      deadline: goal.deadline ? new Date(goal.deadline?.toDate?.() || goal.deadline).toISOString().split('T')[0] : '',
      progress: goal.progress || 0
    })
    setShowEditGoal(true)
  }

  const resetForm = () => {
    setForm({ title: '', description: '', category: 'general', priority: 'medium', deadline: '', progress: 0 })
  }

  const handleProgressUpdate = async (goalId, newProgress) => {
    await updateGoalProgress(goalId, newProgress)
  }

  const handleDelete = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(goalId)
    }
  }

  const getPriorityConfig = (priority) => {
    return PRIORITIES.find(p => p.value === priority) || PRIORITIES[1]
  }

  const getCategoryConfig = (category) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[0]
  }

  const getStatusColor = (goal) => {
    if (goal.completed) return 'text-green-500'
    if (goal.deadline) {
      const deadline = new Date(goal.deadline?.toDate?.() || goal.deadline)
      if (deadline < new Date()) return 'text-red-500'
      if (deadline < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) return 'text-yellow-500'
    }
    return darkMode ? 'text-gray-300' : 'text-gray-700'
  }

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

        <motion.main 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-6"
        >
          {/* Page Header */}
          <div className={`rounded-2xl border shadow-sm p-6 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Goals & Objectives
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Set, track, and achieve your personal and academic goals.
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm()
                  setShowNewGoal(true)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-violet-500 text-white hover:bg-violet-400'
              }`}>
                <Plus size={16} />
                New Goal
              </button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative">
                <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search goals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Priorities</option>
                {PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="created">Sort by Created</option>
                <option value="priority">Sort by Priority</option>
                <option value="progress">Sort by Progress</option>
                <option value="deadline">Sort by Deadline</option>
              </select>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Goals', value: stats.active, icon: Target, color: 'text-blue-500' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-500' },
              { label: 'Overdue', value: stats.overdue, icon: Calendar, color: 'text-red-500' },
              { label: 'This Month', value: stats.thisMonth, icon: TrendingUp, color: 'text-purple-500' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl border shadow-sm p-4 ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </p>
                    <p className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={`${stat.color}`} size={20} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Goals List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl border shadow-sm p-6 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Goals ({filteredGoals.length})
              </h3>
            </div>

            <div className="space-y-4">
              {filteredGoals.map((goal) => {
                const priorityConfig = getPriorityConfig(goal.priority)
                const categoryConfig = getCategoryConfig(goal.category)
                const deadlineStr = goal.deadline ? new Date(goal.deadline?.toDate?.() || goal.deadline).toLocaleDateString() : null
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      darkMode ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    } ${goal.completed ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`font-medium ${getStatusColor(goal)} ${goal.completed ? 'line-through' : ''}`}>
                            {goal.title}
                          </h4>
                          
                          {/* Priority Badge */}
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            darkMode ? priorityConfig.darkBgColor : priorityConfig.bgColor
                          } ${priorityConfig.color}`}>
                            <Flag size={10} className="inline mr-1" />
                            {priorityConfig.label}
                          </span>
                          
                          {/* Category Badge */}
                          <span className={`text-xs px-2 py-1 rounded ${
                            darkMode ? 'bg-gray-600 text-gray-300' : categoryConfig.bgColor
                          } ${darkMode ? '' : categoryConfig.color}`}>
                            {categoryConfig.label}
                          </span>
                        </div>

                        {goal.description && (
                          <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {goal.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs">
                          {deadlineStr && (
                            <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Calendar size={12} />
                              Due: {deadlineStr}
                            </span>
                          )}
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Created: {new Date(goal.createdAt?.toDate?.() || goal.timestamp?.toDate?.() || goal.createdAt || goal.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toggleGoalComplete(goal.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            goal.completed
                              ? 'text-green-600 bg-green-100 dark:bg-green-900/30'
                              : darkMode ? 'text-gray-400 hover:text-green-400 hover:bg-gray-600' : 'text-gray-500 hover:text-green-600 hover:bg-gray-100'
                          }`}
                          title={goal.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          <CheckCircle size={16} />
                        </button>
                        
                        <button
                          onClick={() => openEditModal(goal)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-600' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
                          }`}
                          title="Edit goal"
                        >
                          <Edit2 size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-gray-600' : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                          }`}
                          title="Delete goal"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Progress
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={goal.progress || 0}
                            onChange={(e) => handleProgressUpdate(goal.id, Number(e.target.value))}
                            className={`w-16 px-2 py-1 text-xs rounded border ${
                              darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            disabled={goal.completed}
                          />
                          <span className={`text-sm font-bold ${
                            (goal.progress || 0) >= 80 ? 'text-green-500' : 
                            (goal.progress || 0) >= 50 ? 'text-yellow-500' : 'text-blue-500'
                          }`}>
                            {goal.progress || 0}%
                          </span>
                        </div>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${
                        darkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}>
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            (goal.progress || 0) >= 80 ? 'bg-green-500' : 
                            (goal.progress || 0) >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${goal.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              
              {filteredGoals.length === 0 && (
                <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Target size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No goals found</h3>
                  <p className="text-sm">
                    {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' || filterPriority !== 'all'
                      ? 'Try adjusting your filters or search terms.'
                      : 'Create your first goal to get started on your journey!'
                    }
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.main>
      </div>

      {/* New Goal Modal */}
      <AnimatePresence>
        {showNewGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-lg rounded-lg border shadow-lg p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Create New Goal</h3>
                <button 
                  onClick={() => setShowNewGoal(false)} 
                  className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Goal title *"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
                
                <textarea
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  
                  <select
                    value={form.priority}
                    onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
                    className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    {PRIORITIES.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                    className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Initial Progress: {form.progress}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={form.progress}
                      onChange={(e) => setForm(prev => ({ ...prev, progress: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreate}
                    disabled={!form.title.trim()}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      form.title.trim()
                        ? darkMode ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-violet-500 text-white hover:bg-violet-400'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Create Goal
                  </button>
                  <button
                    onClick={() => setShowNewGoal(false)}
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

      {/* Edit Goal Modal */}
      <AnimatePresence>
        {showEditGoal && editingGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-lg rounded-lg border shadow-lg p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Edit Goal</h3>
                <button 
                  onClick={() => {
                    setShowEditGoal(false)
                    setEditingGoal(null)
                  }} 
                  className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Goal title *"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
                
                <textarea
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  
                  <select
                    value={form.priority}
                    onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
                    className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    {PRIORITIES.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
                
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEdit}
                    disabled={!form.title.trim()}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      form.title.trim()
                        ? darkMode ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-violet-500 text-white hover:bg-violet-400'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Update Goal
                  </button>
                  <button
                    onClick={() => {
                      setShowEditGoal(false)
                      setEditingGoal(null)
                    }}
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