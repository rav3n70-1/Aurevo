import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useTaskStore } from '../store'
import { Target, Plus, Calendar, TrendingUp, Award, CheckCircle, X, Edit2, Trash2, Search, Filter, MoreHorizontal, Flag, ChevronDown, ChevronUp, Clock, Star, Zap, Trophy, Share2, Copy, Archive, Camera, BarChart, Users, Timer, BookOpen, Lightbulb, Heart, Flame, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState, useRef } from 'react'

// Animated Particles Component
const AnimatedParticles = ({ count = 50, color = '#8b5cf6' }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    speed: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.5 + 0.3
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: color,
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.sin(particle.id) * 10, 0],
            opacity: [particle.opacity, 0.8, particle.opacity]
          }}
          transition={{
            duration: particle.speed + 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.id * 0.1
          }}
        />
      ))}
    </div>
  )
}

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 1 }) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let start = 0
    const end = parseInt(value) || 0
    if (start === end) return

    let totalMilSecDur = duration * 1000
    let incrementTime = Math.max(10, totalMilSecDur / end)

    let timer = setInterval(() => {
      start += 1
      setCount(start)
      if (start === end) clearInterval(timer)
    }, incrementTime)

    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{count}</span>
}

// Celebration Component
const CelebrationFireworks = ({ show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show) return null

  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)]
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded"
          style={{ backgroundColor: piece.color, left: `${piece.x}%` }}
          initial={{ y: -50, rotation: 0 }}
          animate={{ 
            y: window.innerHeight + 50, 
            rotation: 720,
            x: Math.sin(piece.id) * 100
          }}
          transition={{ duration: 3, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-green-600', bgColor: 'bg-green-100', darkBgColor: 'bg-green-900/30' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100', darkBgColor: 'bg-yellow-900/30' },
  { value: 'high', label: 'High', color: 'text-red-600', bgColor: 'bg-red-100', darkBgColor: 'bg-red-900/30' }
]

const CATEGORIES = [
  { value: 'general', label: 'General', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '📋' },
  { value: 'health', label: 'Health', color: 'text-green-600', bgColor: 'bg-green-100', icon: '💚' },
  { value: 'academic', label: 'Academic', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '🎓' },
  { value: 'career', label: 'Career', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '💼' },
  { value: 'personal', label: 'Personal', color: 'text-pink-600', bgColor: 'bg-pink-100', icon: '✨' },
  { value: 'finance', label: 'Finance', color: 'text-emerald-600', bgColor: 'bg-emerald-100', icon: '💰' }
]

const GOAL_TEMPLATES = [
  {
    id: 'fitness',
    title: 'Fitness Journey',
    icon: '💪',
    description: 'Get in shape and stay healthy',
    category: 'health',
    priority: 'high',
    subGoals: ['Exercise 3x per week', 'Drink 8 glasses water daily', 'Sleep 8 hours nightly'],
    timeEstimate: 90
  },
  {
    id: 'learning',
    title: 'Learn a New Skill',
    icon: '📚',
    description: 'Master a new skill or hobby',
    category: 'personal',
    priority: 'medium',
    subGoals: ['Choose learning resource', 'Practice daily', 'Join community'],
    timeEstimate: 60
  },
  {
    id: 'career',
    title: 'Career Advancement',
    icon: '🚀',
    description: 'Grow professionally',
    category: 'career',
    priority: 'high',
    subGoals: ['Update resume', 'Build portfolio', 'Network actively'],
    timeEstimate: 120
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness Practice',
    icon: '🧘',
    description: 'Develop inner peace and focus',
    category: 'personal',
    priority: 'medium',
    subGoals: ['Meditate daily', 'Practice gratitude', 'Reduce screen time'],
    timeEstimate: 30
  }
]

export default function Goals() {
  const { t } = useTranslation()
  const { darkMode, isLoading, user } = useAppStore()
  const { goals, loadGoals, addGoal, updateGoal, deleteGoal, toggleGoalComplete, updateGoalProgress } = useTaskStore()
  
  // UI State
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [showEditGoal, setShowEditGoal] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSubGoals, setShowSubGoals] = useState({})
  const [showCelebration, setShowCelebration] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [sortBy, setSortBy] = useState('created')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedGoals, setSelectedGoals] = useState(new Set())
  const [activeTab, setActiveTab] = useState('all') // all | active | completed | overdue
  const [showFilters, setShowFilters] = useState(false)
  const [groupByCategory, setGroupByCategory] = useState(false)
  const [editingInlineId, setEditingInlineId] = useState(null)
  const [inlineForm, setInlineForm] = useState({ title: '', description: '', priority: 'medium' })
  
  // Form State
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    category: 'general', 
    priority: 'medium',
    deadline: '',
    progress: 0,
    subGoals: [],
    timeEstimate: 30
  })

  useEffect(() => {
    if (user) loadGoals()
  }, [user, loadGoals])

  // Statistics with animations
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
    
    const avgProgress = goals.length > 0 
      ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length)
      : 0
    
    const highPriorityCount = goals.filter(g => g.priority === 'high' && !g.completed).length
    
    return { active, completed, overdue, thisMonth, avgProgress, highPriorityCount }
  }, [goals])

  // Filtered and sorted goals
  const filteredGoals = useMemo(() => {
    const statusToUse = activeTab === 'all' ? filterStatus : (activeTab === 'active' ? 'active' : activeTab)
    let filtered = goals.filter(goal => {
      if (searchTerm && !goal.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !goal.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      if (filterCategory !== 'all' && goal.category !== filterCategory) return false
      if (statusToUse === 'completed' && !goal.completed) return false
      if (statusToUse === 'active' && goal.completed) return false
      if (statusToUse === 'overdue') {
        if (goal.completed || !goal.deadline) return false
        const deadline = new Date(goal.deadline?.toDate?.() || goal.deadline)
        if (deadline >= new Date()) return false
      }
      
      if (filterPriority !== 'all' && goal.priority !== filterPriority) return false
      
      return true
    })

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
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        case 'created':
        default:
          const aTime = a.createdAt?.toDate?.() || a.timestamp?.toDate?.() || new Date(a.createdAt || a.timestamp)
          const bTime = b.createdAt?.toDate?.() || b.timestamp?.toDate?.() || new Date(b.createdAt || b.timestamp)
          return bTime - aTime
      }
    })

    return filtered
  }, [goals, searchTerm, filterCategory, filterStatus, filterPriority, sortBy, activeTab])

  const handleCreate = async () => {
    if (!form.title.trim()) return
    await addGoal({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      deadline: form.deadline ? new Date(form.deadline) : null,
      progress: Number(form.progress) || 0,
      subGoals: form.subGoals,
      timeEstimate: form.timeEstimate
    })
    resetForm()
    setShowNewGoal(false)
    
    if (goals.length === 0) {
      setShowCelebration(true)
    }
  }

  const handleCreateFromTemplate = async (template) => {
    await addGoal({
      title: template.title,
      description: template.description,
      category: template.category,
      priority: template.priority,
      deadline: null,
      progress: 0,
      subGoals: template.subGoals,
      timeEstimate: template.timeEstimate
    })
    setShowTemplates(false)
    setShowCelebration(true)
  }

  const handleEdit = async () => {
    if (!editingGoal || !form.title.trim()) return
    await updateGoal(editingGoal.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      deadline: form.deadline ? new Date(form.deadline) : null,
      subGoals: form.subGoals,
      timeEstimate: form.timeEstimate
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
      progress: goal.progress || 0,
      subGoals: goal.subGoals || [],
      timeEstimate: goal.timeEstimate || 30
    })
    setShowEditGoal(true)
  }

  const resetForm = () => {
    setForm({ 
      title: '', 
      description: '', 
      category: 'general', 
      priority: 'medium', 
      deadline: '', 
      progress: 0,
      subGoals: [],
      timeEstimate: 30
    })
  }

  const handleProgressUpdate = async (goalId, newProgress) => {
    const oldProgress = goals.find(g => g.id === goalId)?.progress || 0
    await updateGoalProgress(goalId, newProgress)
    
    if (newProgress === 100 && oldProgress < 100) {
      setShowCelebration(true)
    }
  }

  const handleDelete = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(goalId)
    }
  }

  const handleDuplicateGoal = async (goal) => {
    await addGoal({
      title: `${goal.title} (Copy)`,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      deadline: goal.deadline,
      progress: 0,
      subGoals: goal.subGoals || [],
      timeEstimate: goal.timeEstimate || 30
    })
  }

  const toggleSubGoals = (goalId) => {
    setShowSubGoals(prev => ({
      ...prev,
      [goalId]: !prev[goalId]
    }))
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

  const addSubGoal = () => {
    setForm(prev => ({
      ...prev,
      subGoals: [...prev.subGoals, '']
    }))
  }

  const updateSubGoal = (index, value) => {
    setForm(prev => ({
      ...prev,
      subGoals: prev.subGoals.map((sg, i) => i === index ? value : sg)
    }))
  }

  const removeSubGoal = (index) => {
    setForm(prev => ({
      ...prev,
      subGoals: prev.subGoals.filter((_, i) => i !== index)
    }))
  }

  const startInlineEdit = (goal) => {
    setEditingInlineId(goal.id)
    setInlineForm({ title: goal.title || '', description: goal.description || '', priority: goal.priority || 'medium' })
  }

  const saveInlineEdit = async () => {
    if (!editingInlineId) return
    await updateGoal(editingInlineId, {
      title: inlineForm.title.trim() || 'Untitled Goal',
      description: inlineForm.description,
      priority: inlineForm.priority
    })
    setEditingInlineId(null)
  }

  const cancelInlineEdit = () => {
    setEditingInlineId(null)
  }

  const toggleSelect = (goalId) => {
    setSelectedGoals((prev) => {
      const next = new Set(prev)
      if (next.has(goalId)) next.delete(goalId)
      else next.add(goalId)
      return next
    })
  }

  const clearSelection = () => setSelectedGoals(new Set())

  const bulkComplete = async () => {
    for (const id of selectedGoals) {
      const g = goals.find(x => x.id === id)
      if (g && !g.completed) await toggleGoalComplete(id)
    }
    clearSelection()
  }

  const bulkDelete = async () => {
    if (!window.confirm('Delete selected goals?')) return
    for (const id of selectedGoals) {
      await deleteGoal(id)
    }
    clearSelection()
  }

  const bulkSetPriority = async (priority) => {
    for (const id of selectedGoals) {
      await updateGoal(id, { priority })
    }
    clearSelection()
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
    } relative overflow-hidden`}>
      {/* Background Particles */}
      <AnimatedParticles count={30} color={darkMode ? '#8b5cf6' : '#6366f1'} />
      
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pb-20 grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6 mt-6 relative z-10">
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <Sidebar />
        </div>

        <motion.main 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-6"
        >
          {/* Enhanced Page Header */}
          <motion.div 
            className={`rounded-2xl border shadow-sm p-6 relative overflow-hidden ${
              darkMode ? 'bg-gray-800/90 border-gray-700 backdrop-blur-sm' : 'bg-white/90 border-gray-200 backdrop-blur-sm'
            }`}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <AnimatedParticles count={10} color={darkMode ? '#8b5cf6' : '#6366f1'} />
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <motion.h1 
                  className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    Goals & Objectives
                  </span>
                  <Sparkles className="inline ml-2 text-yellow-500" size={24} />
                </motion.h1>
                <motion.p 
                  className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Transform your dreams into achievable milestones with smart goal tracking.
                </motion.p>
                {selectedGoals.size > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{selectedGoals.size} selected</span>
                    <button onClick={bulkComplete} className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-green-700' : 'bg-green-500 text-white'}`}>Mark Complete</button>
                    <button onClick={bulkDelete} className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-red-700' : 'bg-red-500 text-white'}`}>Delete</button>
                    <div className="flex items-center gap-1 text-xs">
                      <span>Priority:</span>
                      {['low','medium','high'].map(p => (
                        <button key={p} onClick={() => bulkSetPriority(p)} className={`px-2 py-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{p}</button>
                      ))}
                    </div>
                    <button onClick={clearSelection} className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Clear</button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <motion.button
                  onClick={() => setShowTemplates(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-purple-500 text-white hover:bg-purple-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Lightbulb size={16} />
                  Templates
                </motion.button>
                <motion.button
                  onClick={() => {
                    resetForm()
                    setShowNewGoal(true)
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-violet-500 text-white hover:bg-violet-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={16} />
                  New Goal
                </motion.button>
              </div>
            </div>

            {/* Redesigned: Tabs and quick toggles */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'completed', label: 'Completed' },
                { id: 'overdue', label: 'Overdue' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    activeTab === tab.id
                      ? (darkMode ? 'bg-violet-600 border-violet-500 text-white' : 'bg-violet-500 border-violet-400 text-white')
                      : (darkMode ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100')
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${darkMode ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={groupByCategory} onChange={(e) => setGroupByCategory(e.target.checked)} />
                  Group by category
                </label>
              </div>
            </div>

            {/* Enhanced Search and Filters */}
            {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mt-3">
              <div className="relative">
                <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search goals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 ${
                    darkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500' 
                      : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500'
                  }`}
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 ${
                  darkMode ? 'bg-gray-700/50 border-gray-600 text-white focus:border-violet-500' : 'bg-white/50 border-gray-300 text-gray-900 focus:border-violet-500'
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
                className={`px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 ${
                  darkMode ? 'bg-gray-700/50 border-gray-600 text-white focus:border-violet-500' : 'bg-white/50 border-gray-300 text-gray-900 focus:border-violet-500'
                }`}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className={`px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 ${
                  darkMode ? 'bg-gray-700/50 border-gray-600 text-white focus:border-violet-500' : 'bg-white/50 border-gray-300 text-gray-900 focus:border-violet-500'
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
                className={`px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 ${
                  darkMode ? 'bg-gray-700/50 border-gray-600 text-white focus:border-violet-500' : 'bg-white/50 border-gray-300 text-gray-900 focus:border-violet-500'
                }`}
              >
                <option value="created">Sort by Created</option>
                <option value="priority">Sort by Priority</option>
                <option value="progress">Sort by Progress</option>
                <option value="deadline">Sort by Deadline</option>
                <option value="alphabetical">Sort A-Z</option>
              </select>

              <div className="flex rounded-lg border overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-2 px-3 transition-colors ${
                    viewMode === 'grid'
                      ? darkMode ? 'bg-violet-600 text-white' : 'bg-violet-500 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-2 px-3 transition-colors ${
                    viewMode === 'list'
                      ? darkMode ? 'bg-violet-600 text-white' : 'bg-violet-500 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
            )}
          </motion.div>

          {/* Enhanced Stats Overview with Animated Counters */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Active Goals', value: stats.active, icon: Target, color: 'text-blue-500', bgGradient: 'from-blue-500/10 to-blue-600/20' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-500', bgGradient: 'from-green-500/10 to-green-600/20' },
              { label: 'Overdue', value: stats.overdue, icon: Calendar, color: 'text-red-500', bgGradient: 'from-red-500/10 to-red-600/20' },
              { label: 'This Month', value: stats.thisMonth, icon: TrendingUp, color: 'text-purple-500', bgGradient: 'from-purple-500/10 to-purple-600/20' },
              { label: 'Avg Progress', value: `${stats.avgProgress}%`, icon: BarChart, color: 'text-indigo-500', bgGradient: 'from-indigo-500/10 to-indigo-600/20' },
              { label: 'High Priority', value: stats.highPriorityCount, icon: Flame, color: 'text-orange-500', bgGradient: 'from-orange-500/10 to-orange-600/20' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`rounded-xl border shadow-sm p-4 relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} ${
                  darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <AnimatedCounter value={stat.value} duration={1.5} />
                    </p>
                  </div>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                  >
                    <stat.icon className={`${stat.color}`} size={24} />
                  </motion.div>
                </div>
                <div className="absolute -bottom-4 -right-4 opacity-10">
                  <stat.icon size={60} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Goals List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl border shadow-sm p-6 relative overflow-hidden ${
              darkMode ? 'bg-gray-800/90 border-gray-700 backdrop-blur-sm' : 'bg-white/90 border-gray-200 backdrop-blur-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Goals ({filteredGoals.length})
              </h3>
            </div>

            {!groupByCategory && (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredGoals.map((goal, index) => {
                const priorityConfig = getPriorityConfig(goal.priority)
                const categoryConfig = getCategoryConfig(goal.category)
                const deadlineStr = goal.deadline ? new Date(goal.deadline?.toDate?.() || goal.deadline).toLocaleDateString() : null
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg relative overflow-hidden ${
                      darkMode ? 'bg-gray-700/50 border-gray-600 hover:border-violet-500/50' : 'bg-gray-50/50 border-gray-200 hover:border-violet-300'
                    } ${goal.completed ? 'opacity-75' : ''}`}
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br opacity-5 ${
                      goal.priority === 'high' ? 'from-red-500 to-orange-500' :
                      goal.priority === 'medium' ? 'from-yellow-500 to-orange-500' :
                      'from-green-500 to-blue-500'
                    }`} />

                                            <div className="relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{categoryConfig.icon}</span>
                                {editingInlineId === goal.id ? (
                                  <div className="flex-1">
                                    <input
                                      value={inlineForm.title}
                                      onChange={(e) => setInlineForm(prev => ({ ...prev, title: e.target.value }))}
                                      className={`w-full px-2 py-1 rounded border text-lg font-semibold ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    />
                                  </div>
                                ) : (
                                  <h4 className={`font-semibold text-lg ${getStatusColor(goal)} ${goal.completed ? 'line-through' : ''}`}>
                                    {goal.title}
                                  </h4>
                                )}
                                
                                <div className="flex gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium transition-all hover:scale-110 ${
                                    darkMode ? priorityConfig.darkBgColor : priorityConfig.bgColor
                                  } ${priorityConfig.color}`}>
                                    <Flag size={10} className="inline mr-1" />
                                    {priorityConfig.label}
                                  </span>
                                  
                                  {goal.timeEstimate && (
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                      <Clock size={10} className="inline mr-1" />
                                      {goal.timeEstimate}d
                                    </span>
                                  )}
                                </div>
                              </div>

                              {editingInlineId === goal.id ? (
                                <textarea
                                  value={inlineForm.description}
                                  onChange={(e) => setInlineForm(prev => ({ ...prev, description: e.target.value }))}
                                  rows={2}
                                  className={`w-full mb-3 px-2 py-1 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                />
                              ) : (
                                goal.description && (
                                  <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {goal.description}
                                  </p>
                                )
                              )}

                          <div className="flex items-center gap-4 text-xs mb-4">
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

                          {/* Sub Goals */}
                          {goal.subGoals && goal.subGoals.length > 0 && (
                            <div className="mb-4">
                              <button
                                onClick={() => toggleSubGoals(goal.id)}
                                className={`flex items-center gap-2 text-sm font-medium ${darkMode ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-700'}`}
                              >
                                {showSubGoals[goal.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                Sub-goals ({goal.subGoals.length})
                              </button>
                              
                              <AnimatePresence>
                                {showSubGoals[goal.id] && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 space-y-1"
                                  >
                                    {goal.subGoals.map((subGoal, sgIndex) => (
                                      <div key={sgIndex} className={`text-xs flex items-center gap-2 px-3 py-1 rounded ${
                                        darkMode ? 'bg-gray-600/30' : 'bg-gray-100'
                                      }`}>
                                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                                        {subGoal}
                                      </div>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-4">
                          <motion.button
                            onClick={() => toggleGoalComplete(goal.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-2 rounded-lg transition-colors ${
                              goal.completed
                                ? 'text-green-600 bg-green-100 dark:bg-green-900/30'
                                : darkMode ? 'text-gray-400 hover:text-green-400 hover:bg-gray-600' : 'text-gray-500 hover:text-green-600 hover:bg-gray-100'
                            }`}
                            title={goal.completed ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            <CheckCircle size={16} />
                          </motion.button>
                          
                          {editingInlineId === goal.id ? (
                            <>
                              <motion.button
                                onClick={saveInlineEdit}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-green-400 hover:bg-gray-600' : 'text-green-600 hover:bg-gray-100'}`}
                                title="Save"
                              >
                                <CheckCircle size={16} />
                              </motion.button>
                              <motion.button
                                onClick={cancelInlineEdit}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                title="Cancel"
                              >
                                <X size={16} />
                              </motion.button>
                            </>
                          ) : (
                            <motion.button
                              onClick={() => startInlineEdit(goal)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-600' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
                              }`}
                              title="Inline edit"
                            >
                              <Edit2 size={16} />
                            </motion.button>
                          )}

                          <motion.button
                            onClick={() => handleDuplicateGoal(goal)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode ? 'text-gray-400 hover:text-purple-400 hover:bg-gray-600' : 'text-gray-500 hover:text-purple-600 hover:bg-gray-100'
                            }`}
                            title="Duplicate goal"
                          >
                            <Copy size={16} />
                          </motion.button>
                          
                          <motion.button
                            onClick={() => handleDelete(goal.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-gray-600' : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                            }`}
                            title="Delete goal"
                          >
                            <Trash2 size={16} />
                          </motion.button>

                          {/* Select checkbox */}
                          <input type="checkbox" className="ml-2" checked={selectedGoals.has(goal.id)} onChange={() => toggleSelect(goal.id)} />
                        </div>
                      </div>

                      {/* Enhanced Progress Bar with Animation */}
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
                              className={`w-16 px-2 py-1 text-xs rounded border transition-all focus:ring-2 focus:ring-violet-500/20 ${
                                darkMode ? 'bg-gray-600 border-gray-500 text-white focus:border-violet-500' : 'bg-white border-gray-300 text-gray-900 focus:border-violet-500'
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
                        
                        <div className={`h-3 rounded-full overflow-hidden ${
                          darkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          <motion.div
                            className={`h-full rounded-full transition-all duration-500 ${
                              (goal.progress || 0) >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                              (goal.progress || 0) >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progress || 0}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>

                        {/* Progress Milestones */}
                        {(goal.progress || 0) > 0 && (
                          <div className="flex justify-between text-xs mt-2">
                            {[25, 50, 75, 100].map(milestone => (
                              <div
                                key={milestone}
                                className={`flex items-center gap-1 ${
                                  (goal.progress || 0) >= milestone
                                    ? 'text-green-500'
                                    : darkMode ? 'text-gray-500' : 'text-gray-400'
                                }`}
                              >
                                {(goal.progress || 0) >= milestone ? (
                                  <Star size={10} className="fill-current" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full border border-current" />
                                )}
                                {milestone}%
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              
              {filteredGoals.length === 0 && (
                <div className={`col-span-full text-center py-16 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Target size={64} className="mx-auto mb-6 opacity-50" />
                    <h3 className="text-xl font-medium mb-3">No goals found</h3>
                    <p className="text-sm mb-6">
                      {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' || filterPriority !== 'all'
                        ? 'Try adjusting your filters or search terms.'
                        : 'Start your journey by creating your first goal!'
                      }
                    </p>
                    {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && filterPriority === 'all' && (
                      <motion.button
                        onClick={() => setShowTemplates(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                          darkMode ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-violet-500 text-white hover:bg-violet-400'
                        }`}
                      >
                        <Lightbulb className="inline mr-2" size={16} />
                        Browse Templates
                      </motion.button>
                    )}
                  </motion.div>
                </div>
              )}
            </div>
            )}

            {groupByCategory && (
              <div className="space-y-6">
                {Array.from(new Set(filteredGoals.map(g => g.category || 'general'))).map((cat) => {
                  const catConfig = getCategoryConfig(cat)
                  const goalsInCat = filteredGoals.filter(g => (g.category || 'general') === cat)
                  return (
                    <div key={cat}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{catConfig.icon}</span>
                        <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{catConfig.label}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{goalsInCat.length}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goalsInCat.map((goal, index) => {
                          const priorityConfig = getPriorityConfig(goal.priority)
                          const deadlineStr = goal.deadline ? new Date(goal.deadline?.toDate?.() || goal.deadline).toLocaleDateString() : null
                          return (
                            <motion.div
                              key={goal.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              whileHover={{ scale: 1.02, y: -5 }}
                              className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg relative overflow-hidden ${
                                darkMode ? 'bg-gray-700/50 border-gray-600 hover:border-violet-500/50' : 'bg-gray-50/50 border-gray-200 hover:border-violet-300'
                              } ${goal.completed ? 'opacity-75' : ''}`}
                            >
                              <div className="relative">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h4 className={`font-semibold text-lg ${getStatusColor(goal)} ${goal.completed ? 'line-through' : ''}`}>{goal.title}</h4>
                                    {goal.description && (
                                      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{goal.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs mb-4">
                                      {deadlineStr && (
                                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Due: {deadlineStr}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Progress</span>
                                    <span className={`text-sm font-bold ${
                                      (goal.progress || 0) >= 80 ? 'text-green-500' : (goal.progress || 0) >= 50 ? 'text-yellow-500' : 'text-blue-500'
                                    }`}>{goal.progress || 0}%</span>
                                  </div>
                                  <div className={`${darkMode ? 'bg-gray-600' : 'bg-gray-200'} h-2 rounded-full overflow-hidden`}>
                                    <motion.div className={`h-full ${
                                      (goal.progress || 0) >= 80 ? 'bg-green-500' : (goal.progress || 0) >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
                                    }`} initial={{ width: 0 }} animate={{ width: `${goal.progress || 0}%` }} transition={{ duration: 0.8 }} />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Goal Insights & Analytics */}
          {goals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Insights Card */}
              <div className={`rounded-2xl border shadow-sm p-6 relative overflow-hidden ${
                darkMode ? 'bg-gray-800/90 border-gray-700 backdrop-blur-sm' : 'bg-white/90 border-gray-200 backdrop-blur-sm'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <BarChart className="text-indigo-500" size={20} />
                  Goal Insights
                </h3>
                
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Completion Rate
                      </span>
                      <span className={`text-lg font-bold ${stats.completed > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                        {goals.length > 0 ? Math.round((stats.completed / goals.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${goals.length > 0 ? (stats.completed / goals.length) * 100 : 0}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg text-center ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className={`text-xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        <AnimatedCounter value={stats.avgProgress} />%
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Average Progress
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className={`text-xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                        <AnimatedCounter value={stats.highPriorityCount} />
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        High Priority
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Challenge & Activities */}
              <div className={`rounded-2xl border shadow-sm p-6 relative overflow-hidden ${
                darkMode ? 'bg-gray-800/90 border-gray-700 backdrop-blur-sm' : 'bg-white/90 border-gray-200 backdrop-blur-sm'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <Trophy className="text-yellow-500" size={20} />
                  Weekly Challenge
                </h3>

                <div className={`p-4 rounded-lg mb-4 ${
                  darkMode ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20' : 'bg-gradient-to-r from-yellow-50 to-orange-50'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h4 className={`font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        Complete 3 Goals This Week
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                        Reward: 150 XP + Special Badge
                      </p>
                    </div>
                  </div>
                  <div className={`flex justify-between text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                    <span>Progress: {stats.completed}/3</span>
                    <span>4 days left</span>
                  </div>
                </div>

                {/* Quick Activities */}
                <div className="space-y-3">
                  <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Quick Activities
                  </h4>
                  {[
                    { icon: '📝', title: 'Update Goal Progress', xp: '15 XP', action: () => {} },
                    { icon: '⭐', title: 'Set High Priority Goal', xp: '25 XP', action: () => setShowNewGoal(true) },
                    { icon: '📅', title: 'Add Deadlines', xp: '20 XP', action: () => {} },
                    { icon: '🎯', title: 'Complete Daily Review', xp: '30 XP', action: () => {} }
                  ].map((activity, index) => (
                    <motion.button
                      key={index}
                      onClick={activity.action}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                        darkMode ? 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{activity.icon}</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {activity.title}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        darkMode ? 'bg-violet-900/30 text-violet-400' : 'bg-violet-100 text-violet-600'
                      }`}>
                        {activity.xp}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Motivational Section */}
          {goals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`rounded-2xl border shadow-sm p-6 text-center relative overflow-hidden ${
                darkMode ? 'bg-gradient-to-br from-violet-900/20 to-purple-900/20 border-gray-700' : 'bg-gradient-to-br from-violet-50 to-purple-50 border-gray-200'
              }`}
            >
              <AnimatedParticles count={20} color={darkMode ? '#a855f7' : '#8b5cf6'} />
              
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart className="text-pink-500 mx-auto mb-3" size={32} />
                </motion.div>
                
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  You're Making Amazing Progress!
                </h3>
                <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  {stats.completed === 0 
                    ? "Every great journey begins with a single step. You've got this!"
                    : stats.completed === 1
                    ? "Fantastic! You've completed your first goal. Keep the momentum going!"
                    : `Incredible! You've completed ${stats.completed} goals. You're unstoppable!`
                  }
                </p>
                
                {stats.avgProgress > 50 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-4"
                  >
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      <Flame size={16} />
                      <span className="text-sm font-medium">
                        You're on fire! {stats.avgProgress}% average progress
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </motion.main>
      </div>

      {/* Template Modal */}
      <AnimatePresence>
        {showTemplates && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-4xl rounded-xl border shadow-xl p-6 m-4 max-h-[90vh] overflow-y-auto ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Goal Templates
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Quick start with proven goal frameworks
                  </p>
                </div>
                <button 
                  onClick={() => setShowTemplates(false)} 
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {GOAL_TEMPLATES.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl border transition-all cursor-pointer ${
                      darkMode 
                        ? 'bg-gray-700/50 border-gray-600 hover:border-violet-500/50 hover:shadow-lg' 
                        : 'bg-gray-50 border-gray-200 hover:border-violet-300 hover:shadow-lg'
                    }`}
                    onClick={() => handleCreateFromTemplate(template)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{template.icon}</span>
                      <div>
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {template.title}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {template.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`px-2 py-1 rounded ${getCategoryConfig(template.category).bgColor} ${getCategoryConfig(template.category).color}`}>
                          {getCategoryConfig(template.category).label}
                        </div>
                        <div className={`px-2 py-1 rounded ${getPriorityConfig(template.priority).bgColor} ${getPriorityConfig(template.priority).color}`}>
                          {getPriorityConfig(template.priority).label}
                        </div>
                        <div className={`px-2 py-1 rounded ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                          {template.timeEstimate} days
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Includes {template.subGoals.length} sub-goals:
                      </p>
                      {template.subGoals.slice(0, 3).map((subGoal, sgIndex) => (
                        <div key={sgIndex} className={`text-xs flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <div className="w-1 h-1 rounded-full bg-violet-500" />
                          {subGoal}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enhanced New Goal Modal */}
      <AnimatePresence>
        {showNewGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-full max-w-2xl rounded-xl border shadow-xl p-6 m-4 max-h-[90vh] overflow-y-auto ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Create New Goal
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Define your objective and track your progress
                  </p>
                </div>
                <button 
                  onClick={() => setShowNewGoal(false)} 
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your goal..."
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    placeholder="Describe your goal in detail..."
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border resize-none transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500'
                    }`}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-violet-500' : 'bg-white border-gray-300 text-gray-900 focus:border-violet-500'
                      }`}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Priority
                    </label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-violet-500' : 'bg-white border-gray-300 text-gray-900 focus:border-violet-500'
                      }`}
                    >
                      {PRIORITIES.map(priority => (
                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Time Estimate (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={form.timeEstimate}
                      onChange={(e) => setForm(prev => ({ ...prev, timeEstimate: Number(e.target.value) }))}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-violet-500' : 'bg-white border-gray-300 text-gray-900 focus:border-violet-500'
                      }`}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Deadline (optional)
                    </label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-violet-500' : 'bg-white border-gray-300 text-gray-900 focus:border-violet-500'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Initial Progress: {form.progress}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={form.progress}
                      onChange={(e) => setForm(prev => ({ ...prev, progress: Number(e.target.value) }))}
                      className="w-full h-3 mt-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-blue-500 to-violet-500"
                    />
                  </div>
                </div>

                {/* Sub-goals Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sub-goals
                    </label>
                    <button
                      type="button"
                      onClick={addSubGoal}
                      className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                        darkMode ? 'bg-violet-600/20 text-violet-400 hover:bg-violet-600/30' : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
                      }`}
                    >
                      <Plus size={14} className="inline mr-1" />
                      Add Sub-goal
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {form.subGoals.map((subGoal, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder={`Sub-goal ${index + 1}`}
                          value={subGoal}
                          onChange={(e) => updateSubGoal(index, e.target.value)}
                          className={`flex-1 px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => removeSubGoal(index)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode ? 'text-red-400 hover:bg-red-600/20' : 'text-red-600 hover:bg-red-100'
                          }`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreate}
                    disabled={!form.title.trim()}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                      form.title.trim()
                        ? darkMode ? 'bg-violet-600 text-white hover:bg-violet-500 hover:scale-105' : 'bg-violet-500 text-white hover:bg-violet-400 hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="inline mr-2" size={16} />
                    Create Goal
                  </button>
                  <button
                    onClick={() => setShowNewGoal(false)}
                    className={`px-6 py-3 rounded-lg transition-colors ${
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-full max-w-2xl rounded-xl border shadow-xl p-6 m-4 max-h-[90vh] overflow-y-auto ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Edit Goal
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Update your goal details
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowEditGoal(false)
                    setEditingGoal(null)
                  }} 
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="Goal title *"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                
                <textarea
                  placeholder="Description..."
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border resize-none ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className={`px-4 py-3 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                  
                  <select
                    value={form.priority}
                    onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
                    className={`px-4 py-3 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
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
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEdit}
                    disabled={!form.title.trim()}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                      form.title.trim()
                        ? darkMode ? 'bg-violet-600 text-white hover:bg-violet-500 hover:scale-105' : 'bg-violet-500 text-white hover:bg-violet-400 hover:scale-105'
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
                    className={`px-6 py-3 rounded-lg transition-colors ${
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

      {/* Enhanced Celebration with fireworks */}
      <CelebrationFireworks 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  )
} 