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
import { useAppStore } from '../store'
import { BarChart3, Download, Calendar, TrendingUp } from 'lucide-react'

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444']

const mockData = {
  weeklyProgress: [
    { day: 'Mon', mood: 4, study: 120, water: 8, steps: 8500 },
    { day: 'Tue', mood: 3, study: 90, water: 6, steps: 7200 },
    { day: 'Wed', mood: 5, study: 150, water: 9, steps: 9800 },
    { day: 'Thu', mood: 4, study: 105, water: 7, steps: 8100 },
    { day: 'Fri', mood: 4, study: 135, water: 8, steps: 9200 },
    { day: 'Sat', mood: 5, study: 180, water: 10, steps: 12000 },
    { day: 'Sun', mood: 3, study: 60, water: 5, steps: 5500 }
  ],
  categoryBreakdown: [
    { name: 'Study Time', value: 35, color: '#8b5cf6' },
    { name: 'Wellness', value: 25, color: '#10b981' },
    { name: 'Mood Tracking', value: 20, color: '#f59e0b' },
    { name: 'Goals', value: 20, color: '#3b82f6' }
  ]
}

export default function Reports() {
  const { t } = useTranslation()
  const { darkMode, isLoading } = useAppStore()

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
                  Progress Reports
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Analyze your patterns, track improvements, and celebrate achievements.
                </p>
              </div>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}>
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Average Mood', value: '4.1/5', trend: '+0.3', color: 'text-pink-500' },
              { label: 'Study Hours', value: '18.5h', trend: '+2.1h', color: 'text-purple-500' },
              { label: 'Goals Met', value: '87%', trend: '+12%', color: 'text-green-500' },
              { label: 'Streak Days', value: '23', trend: '+5', color: 'text-orange-500' }
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl border shadow-sm p-4 ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="text-center">
                  <p className={`text-lg font-bold ${metric.color}`}>
                    {metric.value}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {metric.label}
                  </p>
                  <p className={`text-xs font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {metric.trend} this week
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Weekly Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-2xl border shadow-sm p-6 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Weekly Activity Overview
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData.weeklyProgress}>
                  <defs>
                    <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="day" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      background: darkMode ? '#1f2937' : '#ffffff', 
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="study" 
                    stroke="#8b5cf6" 
                    fill="url(#studyGrad)" 
                    strokeWidth={2}
                    name="Study Minutes"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Activity Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className={`rounded-2xl border shadow-sm p-6 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Activity Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={mockData.categoryBreakdown} 
                      dataKey="value" 
                      nameKey="name" 
                      innerRadius={60} 
                      outerRadius={100}
                      paddingAngle={5}
                    >
                      {mockData.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: darkMode ? '#1f2937' : '#ffffff', 
                        border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className={`rounded-2xl border shadow-sm p-6 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Daily Habits Tracking
              </h3>
              <div className="space-y-4">
                {[
                  { habit: 'Morning Exercise', streak: 12, completion: 86 },
                  { habit: 'Study Session', streak: 8, completion: 71 },
                  { habit: 'Mood Logging', streak: 23, completion: 95 },
                  { habit: 'Water Goal', streak: 5, completion: 78 }
                ].map((habit, index) => (
                  <div key={index} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {habit.habit}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                          🔥{habit.streak}
                        </span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {habit.completion}%
                        </span>
                      </div>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${
                      darkMode ? 'bg-gray-600' : 'bg-gray-200'
                    }`}>
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${habit.completion}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Insights & Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`rounded-2xl border shadow-sm p-6 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              AI-Powered Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  type: 'Pattern',
                  insight: 'Your study sessions are most productive on Saturdays (3+ hours average)',
                  icon: '📊',
                  color: 'blue'
                },
                {
                  type: 'Recommendation',
                  insight: 'Consider scheduling more study time on weekends to boost weekly totals',
                  icon: '💡',
                  color: 'green'
                },
                {
                  type: 'Achievement',
                  insight: 'You\'ve maintained a 23-day mood tracking streak - keep it up!',
                  icon: '🏆',
                  color: 'yellow'
                },
                {
                  type: 'Alert',
                  insight: 'Tuesday mood scores tend to be lower - try adding self-care activities',
                  icon: '⚠️',
                  color: 'orange'
                }
              ].map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <div>
                      <h4 className={`font-medium text-sm ${
                        insight.color === 'blue' ? 'text-blue-500' :
                        insight.color === 'green' ? 'text-green-500' :
                        insight.color === 'yellow' ? 'text-yellow-500' :
                        'text-orange-500'
                      }`}>
                        {insight.type}
                      </h4>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {insight.insight}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.main>
      </div>
    </div>
  )
} 