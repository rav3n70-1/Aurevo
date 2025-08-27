import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Clock, 
  BookOpen, 
  Plus, 
  Calendar, 
  Target,
  Save,
  X,
  Timer,
  Zap
} from 'lucide-react'
import { useAppStore, useTaskStore } from '../store'

const STUDY_SUBJECTS = [
  'Mathematics', 'Science', 'History', 'Literature', 'Computer Science',
  'Physics', 'Chemistry', 'Biology', 'Philosophy', 'Languages',
  'Art', 'Music', 'Economics', 'Psychology', 'Engineering'
]

const QUICK_DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240]

export default function ManualStudyLogger() {
  const { t } = useTranslation()
  const { darkMode, addXP } = useAppStore()
  const { addStudySession } = useTaskStore()
  
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    duration: 60,
    notes: '',
    type: 'manual',
    date: new Date().toISOString().split('T')[0]
  })
  const [isLogging, setIsLogging] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.subject || !formData.duration) return

    setIsLogging(true)
    
    try {
      await addStudySession({
        subject: formData.subject,
        duration: formData.duration,
        notes: formData.notes,
        type: formData.type,
        timestamp: new Date(formData.date)
      })

      // Show success animation
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      
      // Reset form
      setFormData({
        subject: '',
        duration: 60,
        notes: '',
        type: 'manual',
        date: new Date().toISOString().split('T')[0]
      })
      
      setTimeout(() => setIsOpen(false), 1500)
    } catch (error) {
      console.error('Error logging study session:', error)
    } finally {
      setIsLogging(false)
    }
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`
    }
    return `${mins}m`
  }

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
          darkMode 
            ? 'border-purple-500/50 bg-purple-900/20 hover:border-purple-400 hover:bg-purple-900/30' 
            : 'border-purple-300 bg-purple-50 hover:border-purple-400 hover:bg-purple-100'
        }`}
      >
        <div className="flex items-center justify-center gap-3">
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-600' : 'bg-purple-500'}`}>
            <Plus className="text-white" size={20} />
          </div>
          <div className="text-left">
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Log Study Time
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manually add completed study sessions
            </p>
          </div>
        </div>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 overflow-y-auto"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md mx-auto my-4 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              {/* Header */}
              <div className="sticky top-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-inherit rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-purple-600' : 'bg-purple-500'}`}>
                      <Clock className="text-white" size={16} />
                    </div>
                    <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Log Study Session
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <X size={18} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                  </button>
                </div>
              </div>

              {/* Success Animation */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center bg-green-500/90 rounded-2xl z-10"
                  >
                    <div className="text-center text-white">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center"
                      >
                        <Zap size={24} />
                      </motion.div>
                      <h3 className="text-lg font-bold mb-1">Session Logged!</h3>
                      <p className="text-green-100 text-sm">
                        +{Math.floor(formData.duration / 5) * 5} XP earned
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Subject Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <BookOpen size={14} className="inline mr-1" />
                    Study Subject
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {STUDY_SUBJECTS.slice(0, 6).map((subject) => (
                      <motion.button
                        key={subject}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, subject }))}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          formData.subject === subject
                            ? darkMode 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-purple-500 text-white'
                            : darkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {subject}
                      </motion.button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Or type custom subject..."
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Duration Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Timer size={14} className="inline mr-1" />
                    Study Duration
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {QUICK_DURATIONS.map((minutes) => (
                      <motion.button
                        key={minutes}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, duration: minutes }))}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                          formData.duration === minutes
                            ? darkMode 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-blue-500 text-white'
                            : darkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {formatDuration(minutes)}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="5"
                      max="480"
                      step="5"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className={`text-sm font-bold min-w-[50px] ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {formatDuration(formData.duration)}
                    </span>
                  </div>
                </div>

                {/* Date and Notes Row */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <Calendar size={14} className="inline mr-1" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <Target size={14} className="inline mr-1" />
                      Notes (Optional)
                    </label>
                    <textarea
                      placeholder="What did you accomplish?"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!formData.subject || !formData.duration || isLogging}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    !formData.subject || !formData.duration || isLogging
                      ? darkMode 
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : darkMode 
                        ? 'bg-purple-600 text-white hover:bg-purple-500' 
                        : 'bg-purple-500 text-white hover:bg-purple-400'
                  }`}
                >
                  {isLogging ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span className="text-sm">Logging...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span className="text-sm">Log Session (+{Math.floor(formData.duration / 5) * 5} XP)</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 