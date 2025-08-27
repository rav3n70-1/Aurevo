import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Plus, 
  Timer, 
  Brain, 
  BookOpen, 
  Target,
  Clock,
  X,
  Zap
} from 'lucide-react'
import { useAppStore } from '../store'

const QUICK_ACTIONS = [
  { id: 'pomodoro', icon: Timer, label: 'Start Pomodoro', color: 'bg-red-500 hover:bg-red-400' },
  { id: 'quiz', icon: Brain, label: 'Quick Quiz', color: 'bg-purple-500 hover:bg-purple-400' },
  { id: 'notes', icon: BookOpen, label: 'Add Note', color: 'bg-blue-500 hover:bg-blue-400' },
  { id: 'manual', icon: Clock, label: 'Log Time', color: 'bg-green-500 hover:bg-green-400' }
]

export default function StudyFAB() {
  const { t } = useTranslation()
  const { darkMode } = useAppStore()
  
  const [isOpen, setIsOpen] = useState(false)

  const handleActionClick = (actionId) => {
    // Handle different actions based on ID
    switch (actionId) {
      case 'pomodoro':
        // Scroll to or trigger pomodoro
        document.querySelector('[data-component="pomodoro"]')?.scrollIntoView({ behavior: 'smooth' })
        break
      case 'quiz':
        // Scroll to or trigger quiz mode
        document.querySelector('[data-component="quiz"]')?.scrollIntoView({ behavior: 'smooth' })
        break
      case 'notes':
        // Trigger note creation
        document.querySelector('[data-action="create-note"]')?.click()
        break
      case 'manual':
        // Trigger manual study logger
        document.querySelector('[data-action="log-study"]')?.click()
        break
    }
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {QUICK_ACTIONS.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, scale: 0, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    x: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0, 
                    x: 20,
                    transition: { delay: (QUICK_ACTIONS.length - index - 1) * 0.05 }
                  }}
                  onClick={() => handleActionClick(action.id)}
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full shadow-lg text-white transition-all duration-300 ${action.color}`}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium whitespace-nowrap">
                    {action.label}
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          darkMode 
            ? 'bg-purple-600 hover:bg-purple-500 text-white' 
            : 'bg-purple-500 hover:bg-purple-400 text-white'
        }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Plus size={24} />
        </motion.div>
      </motion.button>

      {/* Background Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/10 -z-10"
          />
        )}
      </AnimatePresence>
    </div>
  )
} 