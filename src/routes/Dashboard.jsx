
import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useMoodStore, useWellnessStore, useTaskStore } from '../store'

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444']

export default function Dashboard() {
  const { t } = useTranslation()
  const { darkMode, user, level, xp, shinePoints, isLoading } = useAppStore()
  const { moodLogs, loadMoodData } = useMoodStore()
  const { wellnessHistory, waterIntake, calories, steps, sleepHours, loadWellnessHistory, loadWellnessData, initializeWellnessData } = useWellnessStore()
  const { studySessions, loadStudySessionsHistory } = useTaskStore()

  useEffect(() => {
    if (!user) return
    
    const loadAllMetrics = async () => {
      try {
        await Promise.all([
          loadMoodData(),
          initializeWellnessData(),
          loadWellnessHistory(14),
          loadStudySessionsHistory(14)
        ])
      } catch (error) {
        console.error('Error loading metrics:', error)
      }
    }
    
    loadAllMetrics()
  }, [user, loadMoodData, initializeWellnessData, loadWellnessHistory, loadStudySessionsHistory])

  const moodSeries = useMemo(() => {
    const byDate = new Map()
    moodLogs.forEach((m) => {
      const d = new Date(m.timestamp?.toDate?.() || m.timestamp).toDateString()
      const arr = byDate.get(d) || []
      arr.push(m.mood)
      byDate.set(d, arr)
    })
    const days = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      const key = d.toDateString()
      const vals = byDate.get(key) || []
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
      return { 
        day: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), 
        mood: Math.round(avg * 10) / 10 || 0
      }
    })
    return days
  }, [moodLogs])

  const wellnessBars = useMemo(() => {
    const historyData = wellnessHistory && wellnessHistory.length > 0 
      ? wellnessHistory.slice(-7) 
      : []
    
    return historyData.map((d) => ({
      day: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
      water: Math.round((d.waterIntake || 0) / 250), // Convert to glasses
      steps: Math.round((d.steps || 0) / 1000), // Convert to thousands
      sleep: d.sleepHours || 0,
      calories: Math.round((d.calories || 0) / 100) // Convert to hundreds
    }))
  }, [wellnessHistory])

  const studyArea = useMemo(() => {
    const byDate = new Map()
    studySessions.forEach((s) => {
      const d = new Date(s.timestamp?.toDate?.() || s.timestamp).toDateString()
      byDate.set(d, (byDate.get(d) || 0) + (s.duration || 0))
    })
    const days = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      const key = d.toDateString()
      return { 
        day: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), 
        minutes: byDate.get(key) || 0 
      }
    })
    return days
  }, [studySessions])

  const wellnessPie = useMemo(() => {
    // Use current day values or latest from history
    const currentData = wellnessHistory && wellnessHistory.length > 0 
      ? wellnessHistory[wellnessHistory.length - 1] 
      : { waterIntake: waterIntake, steps: steps, sleepHours: sleepHours, calories: calories }
    
    const goals = { water: 2000, steps: 10000, sleep: 8, calories: 2000 }
    
    return [
      { 
        name: 'Water', 
        value: Math.min(100, Math.round(((currentData.waterIntake || 0) / goals.water) * 100)),
        actual: currentData.waterIntake || 0,
        goal: goals.water
      },
      { 
        name: 'Steps', 
        value: Math.min(100, Math.round(((currentData.steps || 0) / goals.steps) * 100)),
        actual: currentData.steps || 0,
        goal: goals.steps
      },
      { 
        name: 'Sleep', 
        value: Math.min(100, Math.round(((currentData.sleepHours || 0) / goals.sleep) * 100)),
        actual: currentData.sleepHours || 0,
        goal: goals.sleep
      },
      { 
        name: 'Calories', 
        value: Math.min(100, Math.round(((currentData.calories || 0) / goals.calories) * 100)),
        actual: currentData.calories || 0,
        goal: goals.calories
      }
    ]
  }, [wellnessHistory, waterIntake, calories, steps, sleepHours])

  // Calculate some quick stats
  const totalStudyTime = useMemo(() => {
    return studySessions.reduce((total, session) => total + (session.duration || 0), 0)
  }, [studySessions])

  const averageMood = useMemo(() => {
    if (moodLogs.length === 0) return 0
    const sum = moodLogs.reduce((total, log) => total + (log.mood || 0), 0)
    return Math.round((sum / moodLogs.length) * 10) / 10
  }, [moodLogs])

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

  const cardBase = `rounded-2xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`
  const titleCls = `${darkMode ? 'text-white' : 'text-gray-800'} text-sm font-semibold`

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatter ? formatter(entry.value) : entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
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

        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Header KPIs */}
          <motion.section id="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[{
              label: 'Level', value: level, accent: 'from-violet-600 to-purple-600'
            }, {
              label: 'XP', value: xp.toLocaleString(), accent: 'from-blue-600 to-cyan-600'
            }, {
              label: 'Shine', value: `${shinePoints} ✨`, accent: 'from-amber-500 to-yellow-500'
            }, {
              label: 'Avg Mood', value: averageMood ? `${averageMood}/5` : 'No data', accent: 'from-pink-500 to-rose-500'
            }].map((kpi, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`${cardBase} p-4 overflow-hidden relative`}>
                <div className={`absolute inset-0 opacity-10 bg-gradient-to-r ${kpi.accent}`} />
                <div className="relative">
                  <div className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} text-xs`}>{kpi.label}</div>
                  <div className={`${darkMode ? 'text-white' : 'text-gray-900'} text-2xl font-bold mt-1`}>{kpi.value}</div>
                </div>
              </motion.div>
            ))}
          </motion.section>

          {/* Mood Metrics */}
          <motion.section id="mood" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div whileHover={{ scale: 1.01 }} className={`${cardBase} p-6 lg:col-span-2`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={titleCls}>Mood Trend (last 14 days)</h3>
                <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                  {moodLogs.length} entries
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodSeries} margin={{ left: -20, right: 10, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="day" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis domain={[0, 5]} allowDecimals={true} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <Tooltip content={<CustomTooltip formatter={(value) => `${value}/5`} />} />
                    <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }} className={`${cardBase} p-6`}>
              <h3 className={titleCls}>Today's Goal Progress</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={wellnessPie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                      {wellnessPie.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip formatter={(value, name, props) => `${value}% (${props.payload.actual}/${props.payload.goal})`} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.section>

          {/* Wellness Metrics */}
          <motion.section id="wellness" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div whileHover={{ scale: 1.01 }} className={`${cardBase} p-6`}>
              <h3 className={titleCls}>Steps (K) vs Sleep (hrs) - Last 7 days</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wellnessBars} margin={{ left: -20, right: 10, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="day" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis yAxisId="left" orientation="left" stroke="#10b981" />
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar yAxisId="left" dataKey="steps" fill="#10b981" radius={[6,6,0,0]} name="Steps (K)" />
                    <Bar yAxisId="right" dataKey="sleep" fill="#3b82f6" radius={[6,6,0,0]} name="Sleep (hrs)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }} className={`${cardBase} p-6`}>
              <h3 className={titleCls}>Water (glasses) & Calories (100s) - Last 7 days</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={wellnessBars} margin={{ left: -20, right: 10, top: 10 }}>
                    <defs>
                      <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="day" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="water" stroke="#8b5cf6" fill="url(#grad1)" strokeWidth={2} name="Water (glasses)" />
                    <Area type="monotone" dataKey="calories" stroke="#f59e0b" fill="url(#grad2)" strokeWidth={2} name="Calories (100s)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.section>

          {/* Study Metrics */}
          <motion.section id="study" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-1 gap-6">
            <motion.div whileHover={{ scale: 1.01 }} className={`${cardBase} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={titleCls}>Study Time (minutes, last 14 days)</h3>
                <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                  Total: {Math.round(totalStudyTime)}m
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={studyArea} margin={{ left: -20, right: 10, top: 10 }}>
                    <defs>
                      <linearGradient id="grad3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="day" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <Tooltip content={<CustomTooltip formatter={(value) => `${value} min`} />} />
                    <Area type="monotone" dataKey="minutes" stroke="#10b981" fill="url(#grad3)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.section>

          {/* Goals anchor for sidebar */}
          <motion.section id="goals" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="grid grid-cols-1 gap-6">
            <div className={`${cardBase} p-6`}>
              <h3 className={titleCls}>Goals Analytics</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mt-1`}>
                Track your progress towards personal and academic goals.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {Math.round((totalStudyTime / 60) * 10) / 10}h
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Study Time
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {moodLogs.length}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Mood Logs
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Reports Anchor */}
          <motion.section id="reports" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 gap-6">
            <div className={`${cardBase} p-6`}>
              <h3 className={titleCls}>Reports & Insights</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mt-1`}>
                Detailed analytics and personalized insights coming soon.
              </p>
              <div className="mt-4 space-y-2">
                {['Weekly Summary', 'Monthly Progress', 'Goal Achievement', 'Wellness Trends'].map((report, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-2 rounded ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{report}</span>
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Coming Soon</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        </motion.main>
      </div>
    </div>
  )
}
