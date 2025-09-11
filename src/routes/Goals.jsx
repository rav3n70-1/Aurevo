import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useTaskStore } from '../store'
import { Target, Plus, Calendar, TrendingUp, Award, CheckCircle, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

export default function Goals() {
  const { t } = useTranslation()
  const { darkMode, isLoading, user } = useAppStore()
  const { goals, loadGoals, addGoal } = useTaskStore()
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'general', deadline: '' })

  useEffect(() => {
    if (user) loadGoals()
  }, [user, loadGoals])

  const stats = useMemo(() => {
    const active = goals.filter(g => !g.completed).length
    const completed = goals.filter(g => g.completed).length
    const thisMonth = goals.filter(g => {
      if (!g.createdAt) return false
      const d = g.createdAt?.toDate?.() || new Date(g.createdAt)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    return { active, completed, thisMonth }
  }, [goals])

  const handleCreate = async () => {
    if (!form.title.trim()) return
    await addGoal({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      deadline: form.deadline ? new Date(form.deadline) : null,
      progress: 0
    })
    setForm({ title: '', description: '', category: 'general', deadline: '' })
    setShowNewGoal(false)
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Goals & Objectives
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Set, track, and achieve your personal and academic goals.
                </p>
              </div>
              <button
                onClick={() => setShowNewGoal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-violet-500 text-white hover:bg-violet-400'
              }`}>
                <Plus size={16} />
                New Goal
              </button>
            </div>
          </div>

          {/* Goals Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Active Goals', value: String(stats.active), icon: Target, color: 'text-blue-500' },
              { label: 'Completed', value: String(stats.completed), icon: CheckCircle, color: 'text-green-500' },
              { label: 'This Month', value: String(stats.thisMonth), icon: Calendar, color: 'text-purple-500' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl border shadow-sm p-6 ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={`${stat.color}`} size={24} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Active Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl border shadow-sm p-6 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Active Goals
            </h3>
            <div className="space-y-4">
              {goals.map((goal) => {
                const deadlineStr = goal.deadline ? new Date(goal.deadline?.toDate?.() || goal.deadline).toLocaleDateString() : 'No deadline'
                return (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      darkMode ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {goal.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {goal.category || 'general'}
                          </span>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Due: {deadlineStr}
                          </span>
                        </div>
                      </div>
                      <span className={`text-lg font-bold ${
                        goal.progress >= 80 ? 'text-green-500' : goal.progress >= 50 ? 'text-yellow-500' : 'text-blue-500'
                      }`}>
                        {goal.progress ?? 0}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${
                      darkMode ? 'bg-gray-600' : 'bg-gray-200'
                    }`}>
                      <div
                        className={`h-full rounded-full ${
                          goal.progress >= 80 ? 'bg-green-500' : goal.progress >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${goal.progress ?? 0}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {goals.length === 0 && (
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No goals yet. Click "New Goal" to get started.</div>
              )}
            </div>
          </motion.div>

          {/* Goal Categories & Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={`rounded-2xl border shadow-sm p-6 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Goal Categories
              </h3>
              <div className="space-y-3">
                {['health', 'academic', 'career', 'personal'].map((name, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {name}
                      </span>
                      <span className={`text-sm font-bold text-violet-500`}>
                        {goals.filter(g => (g.category || 'general').toLowerCase().includes(name)).length} goals
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className={`rounded-2xl border shadow-sm p-6 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <Award className="text-yellow-500" size={20} />
                Recent Achievements
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Complete goals to unlock achievements.</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.main>
      </div>

      {/* New Goal Modal */}
      {showNewGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`w-full max-w-md rounded-lg border shadow-lg p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>New Goal</h3>
              <button onClick={() => setShowNewGoal(false)} className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="general">General</option>
                  <option value="health">Health</option>
                  <option value="academic">Academic</option>
                  <option value="career">Career</option>
                  <option value="personal">Personal</option>
                </select>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <button
                onClick={handleCreate}
                className={`w-full py-2 rounded-lg ${darkMode ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-violet-500 text-white hover:bg-violet-400'}`}
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 