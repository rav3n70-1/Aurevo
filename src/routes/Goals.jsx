import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore } from '../store'
import { Target, Plus, Calendar, TrendingUp, Award, CheckCircle } from 'lucide-react'

export default function Goals() {
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
                  Goals & Objectives
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Set, track, and achieve your personal and academic goals.
                </p>
              </div>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
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
              { label: 'Active Goals', value: '8', icon: Target, color: 'text-blue-500' },
              { label: 'Completed', value: '23', icon: CheckCircle, color: 'text-green-500' },
              { label: 'This Month', value: '5', icon: Calendar, color: 'text-purple-500' }
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
              {[
                {
                  title: "Complete Data Science Course",
                  category: "Learning",
                  progress: 75,
                  deadline: "Dec 15, 2024",
                  color: "blue"
                },
                {
                  title: "Maintain 30-day Study Streak",
                  category: "Habit",
                  progress: 87,
                  deadline: "Nov 30, 2024",
                  color: "green"
                },
                {
                  title: "Improve Programming Skills",
                  category: "Career",
                  progress: 45,
                  deadline: "Jan 1, 2025",
                  color: "purple"
                },
                {
                  title: "Read 12 Books This Year",
                  category: "Personal",
                  progress: 83,
                  deadline: "Dec 31, 2024",
                  color: "orange"
                }
              ].map((goal, index) => (
                <div
                  key={index}
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
                          goal.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          goal.color === 'green' ? 'bg-green-100 text-green-600' :
                          goal.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {goal.category}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Due: {goal.deadline}
                        </span>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${
                      goal.color === 'blue' ? 'text-blue-500' :
                      goal.color === 'green' ? 'text-green-500' :
                      goal.color === 'purple' ? 'text-purple-500' :
                      'text-orange-500'
                    }`}>
                      {goal.progress}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-200'
                  }`}>
                    <div
                      className={`h-full rounded-full ${
                        goal.color === 'blue' ? 'bg-blue-500' :
                        goal.color === 'green' ? 'bg-green-500' :
                        goal.color === 'purple' ? 'bg-purple-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
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
                {[
                  { name: 'Health & Fitness', count: 3, color: 'text-green-500' },
                  { name: 'Academic', count: 2, color: 'text-blue-500' },
                  { name: 'Career', count: 2, color: 'text-purple-500' },
                  { name: 'Personal Development', count: 1, color: 'text-orange-500' }
                ].map((category, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {category.name}
                      </span>
                      <span className={`text-sm font-bold ${category.color}`}>
                        {category.count} goals
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
                {[
                  { title: 'Consistency Champion', desc: '7-day study streak', date: '2 days ago', icon: '🔥' },
                  { title: 'Early Bird', desc: 'Morning study sessions', date: '5 days ago', icon: '🌅' },
                  { title: 'Milestone Master', desc: 'Completed 5 goals', date: '1 week ago', icon: '🎯' }
                ].map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{achievement.icon}</span>
                      <div>
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {achievement.desc}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {achievement.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.main>
      </div>
    </div>
  )
} 