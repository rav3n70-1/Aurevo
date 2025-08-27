import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award,
  BarChart3,
  PieChart,
  Activity,
  Flame,
  Clock,
  BookOpen
} from 'lucide-react'
import { useAppStore, useTaskStore } from '../store'

// Generate sample data for the last 30 days
const generateSampleData = () => {
  const data = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Random study time between 0-240 minutes with some realistic patterns
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const baseTime = isWeekend ? 120 : 180
    const variance = Math.random() * 120
    const studyTime = Math.max(0, Math.floor(baseTime + variance - 60))
    
    data.push({
      date: date.toISOString().split('T')[0],
      studyTime,
      sessions: Math.ceil(studyTime / 45),
      subjects: studyTime > 0 ? ['Math', 'Science', 'History'].slice(0, Math.ceil(Math.random() * 3)) : []
    })
  }
  
  return data
}

const SAMPLE_SUBJECT_DATA = [
  { subject: 'Mathematics', hours: 24.5, sessions: 18, color: 'bg-blue-500' },
  { subject: 'Computer Science', hours: 21.2, sessions: 15, color: 'bg-purple-500' },
  { subject: 'Physics', hours: 18.8, sessions: 12, color: 'bg-green-500' },
  { subject: 'Chemistry', hours: 15.3, sessions: 10, color: 'bg-red-500' },
  { subject: 'Literature', hours: 12.7, sessions: 8, color: 'bg-yellow-500' }
]

export default function StudyProgressChart() {
  const { t } = useTranslation()
  const { darkMode } = useAppStore()
  const { studySessions } = useTaskStore()
  
  const [timeRange, setTimeRange] = useState('30') // 7, 30, 90 days
  const [viewType, setViewType] = useState('heatmap') // heatmap, bars, subjects
  const [dailyData, setDailyData] = useState(generateSampleData())

  // Process real study sessions if available
  useEffect(() => {
    if (studySessions && studySessions.length > 0) {
      const processedData = processStudySessions(studySessions, parseInt(timeRange))
      setDailyData(processedData)
    }
  }, [studySessions, timeRange])

  const processStudySessions = (sessions, days) => {
    const data = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const daysSessions = sessions.filter(session => {
        const sessionDate = new Date(session.timestamp?.toDate?.() || session.timestamp)
        return sessionDate.toISOString().split('T')[0] === dateStr
      })
      
      const studyTime = daysSessions.reduce((total, session) => total + session.duration, 0)
      const subjects = [...new Set(daysSessions.map(session => session.subject))]
      
      data.push({
        date: dateStr,
        studyTime,
        sessions: daysSessions.length,
        subjects
      })
    }
    
    return data
  }

  const getIntensityColor = (minutes) => {
    if (minutes === 0) return darkMode ? 'bg-gray-800' : 'bg-gray-100'
    if (minutes < 30) return darkMode ? 'bg-green-900/50' : 'bg-green-200'
    if (minutes < 60) return darkMode ? 'bg-green-700/70' : 'bg-green-300'
    if (minutes < 120) return darkMode ? 'bg-green-600' : 'bg-green-400'
    if (minutes < 180) return darkMode ? 'bg-green-500' : 'bg-green-500'
    return darkMode ? 'bg-green-400' : 'bg-green-600'
  }

  const getStreakData = () => {
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    // Calculate current streak (from today backwards)
    for (let i = dailyData.length - 1; i >= 0; i--) {
      if (dailyData[i].studyTime > 0) {
        if (i === dailyData.length - 1) currentStreak++
        else if (currentStreak > 0) currentStreak++
        else break
      } else if (i === dailyData.length - 1) {
        break
      }
    }
    
    // Calculate longest streak
    for (const day of dailyData) {
      if (day.studyTime > 0) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }
    
    return { currentStreak, longestStreak }
  }

  const getTotalStats = () => {
    const totalTime = dailyData.reduce((sum, day) => sum + day.studyTime, 0)
    const totalSessions = dailyData.reduce((sum, day) => sum + day.sessions, 0)
    const activeDays = dailyData.filter(day => day.studyTime > 0).length
    const avgDaily = activeDays > 0 ? totalTime / parseInt(timeRange) : 0
    
    return { totalTime, totalSessions, activeDays, avgDaily }
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`
    }
    return `${mins}m`
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getDayName = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const stats = getTotalStats()
  const streakData = getStreakData()
  const maxDailyTime = Math.max(...dailyData.map(d => d.studyTime))

  const HeatmapView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Study Heatmap - Last {timeRange} Days
        </h4>
        <div className="flex items-center gap-2 text-xs">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Less</span>
          <div className="flex gap-1">
            {[0, 30, 60, 120, 180].map(minutes => (
              <div key={minutes} className={`w-3 h-3 rounded ${getIntensityColor(minutes)}`} />
            ))}
          </div>
          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>More</span>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={`text-xs text-center py-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {day}
          </div>
        ))}
        
        {dailyData.map((day, index) => (
          <motion.div
            key={day.date}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.01 }}
            className={`aspect-square rounded cursor-pointer transition-all duration-200 hover:scale-110 ${
              getIntensityColor(day.studyTime)
            }`}
            title={`${formatDate(day.date)}: ${formatTime(day.studyTime)}`}
          />
        ))}
      </div>
    </div>
  )

  const BarChartView = () => (
    <div className="space-y-4">
      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Daily Study Time
      </h4>
      
      <div className="flex items-end justify-between h-40 gap-1">
        {dailyData.slice(-14).map((day, index) => (
          <motion.div
            key={day.date}
            initial={{ height: 0 }}
            animate={{ height: `${(day.studyTime / maxDailyTime) * 100}%` }}
            transition={{ delay: index * 0.05, duration: 0.6 }}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div className={`w-full rounded-t transition-colors ${
              day.studyTime > 0 
                ? darkMode ? 'bg-blue-500' : 'bg-blue-600'
                : darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`} />
            <div className="text-xs text-center">
              <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {getDayName(day.date)}
              </div>
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {formatTime(day.studyTime)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const SubjectsView = () => (
    <div className="space-y-4">
      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Study Time by Subject
      </h4>
      
      <div className="space-y-3">
        {SAMPLE_SUBJECT_DATA.map((subject, index) => (
          <motion.div
            key={subject.subject}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded ${subject.color}`} />
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {subject.subject}
                </span>
              </div>
              <div className="text-right">
                <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {subject.hours}h
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {subject.sessions} sessions
                </div>
              </div>
            </div>
            
            <div className={`h-2 rounded-full overflow-hidden ${
              darkMode ? 'bg-gray-600' : 'bg-gray-200'
            }`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(subject.hours / 25) * 100}%` }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                className={`h-full ${subject.color}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  return (
    <div className={`rounded-2xl shadow-sm border p-6 space-y-6 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-lg flex items-center gap-2 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <TrendingUp className="text-blue-500" size={20} />
          Study Progress
        </h3>
        
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
          </select>
          
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="heatmap">Heatmap</option>
            <option value="bars">Bar Chart</option>
            <option value="subjects">By Subject</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
        >
          <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {formatTime(stats.totalTime)}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Total Time
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
        >
          <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
          <div className={`text-lg font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
            {streakData.currentStreak}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Current Streak
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
        >
          <Target className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
            {formatTime(stats.avgDaily)}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Daily Average
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
        >
          <Award className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <div className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            {streakData.longestStreak}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Best Streak
          </div>
        </motion.div>
      </div>

      {/* Chart View */}
      <motion.div
        key={viewType}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {viewType === 'heatmap' && <HeatmapView />}
        {viewType === 'bars' && <BarChartView />}
        {viewType === 'subjects' && <SubjectsView />}
      </motion.div>

      {/* Achievement Indicators */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500" size={16} />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {streakData.currentStreak} day streak
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-500" size={16} />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {stats.activeDays}/{timeRange} active days
            </span>
          </div>
        </div>
        
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {Math.round((stats.activeDays / parseInt(timeRange)) * 100)}% consistency
        </div>
      </div>
    </div>
  )
} 