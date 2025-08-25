
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Mic, 
  MicOff, 
  Save, 
  Play, 
  Pause, 
  Calendar,
  TrendingUp,
  Heart,
  MessageCircle,
  Sparkles
} from 'lucide-react'
import { useMoodStore } from '../store'
import { useAppStore } from '../store'

const moodEmojis = [
  { emoji: '😭', label: 'Terrible', value: 1, color: 'text-red-500' },
  { emoji: '😞', label: 'Sad', value: 2, color: 'text-orange-500' },
  { emoji: '😐', label: 'Neutral', value: 3, color: 'text-yellow-500' },
  { emoji: '🙂', label: 'Good', value: 4, color: 'text-green-500' },
  { emoji: '😄', label: 'Great', value: 5, color: 'text-emerald-500' }
]

const moodIntensityLevels = [
  { level: 1, label: 'Very Low', color: 'bg-gray-300' },
  { level: 2, label: 'Low', color: 'bg-blue-300' },
  { level: 3, label: 'Moderate', color: 'bg-yellow-300' },
  { level: 4, label: 'High', color: 'bg-orange-300' },
  { level: 5, label: 'Very High', color: 'bg-red-300' }
]

const emotionalSupportMessages = [
  'emotionalSupport.growth',
  'emotionalSupport.progress', 
  'emotionalSupport.strength',
  'emotionalSupport.journey',
  'emotionalSupport.rest'
]

export default function MoodTracker() {
  const { t } = useTranslation()
  const { darkMode, addXP } = useAppStore()
  const { currentMood, setCurrentMood, logMood, moodLogs } = useMoodStore()
  
  const [selectedMood, setSelectedMood] = useState(null)
  const [intensity, setIntensity] = useState(3)
  const [notes, setNotes] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [showMoodTree, setShowMoodTree] = useState(false)
  const [supportMessage, setSupportMessage] = useState('')
  const [showSupportMessage, setShowSupportMessage] = useState(false)
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  // Show random support message
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMessage = emotionalSupportMessages[Math.floor(Math.random() * emotionalSupportMessages.length)]
      setSupportMessage(t(randomMessage))
      setShowSupportMessage(true)
      
      setTimeout(() => {
        setShowSupportMessage(false)
      }, 5000)
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [t])

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleMoodSelection = (mood) => {
    setSelectedMood(mood)
    setCurrentMood(mood)
  }

  const handleSubmit = async () => {
    if (!selectedMood) return

    const moodData = {
      mood: selectedMood.value,
      intensity,
      notes,
      audioBlob,
      tags: ['daily-log']
    }

    await logMood(moodData)
    
    // Reset form
    setSelectedMood(null)
    setIntensity(3)
    setNotes('')
    setAudioBlob(null)
    
    // Show congratulatory message
    setSupportMessage(t('moodLogged'))
    setShowSupportMessage(true)
    setTimeout(() => setShowSupportMessage(false), 3000)
  }

  // Mood Tree Visualization
  const MoodTree = () => {
    const recentMoods = moodLogs.slice(0, 7).reverse() // Last 7 days
    const averageMood = recentMoods.length > 0 
      ? recentMoods.reduce((sum, log) => sum + log.mood, 0) / recentMoods.length 
      : 3

    const treeGrowth = Math.min(100, (averageMood / 5) * 100)
    const treeColor = averageMood >= 4 ? 'text-green-500' : averageMood >= 3 ? 'text-yellow-500' : 'text-orange-500'

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-center p-6 rounded-xl ${
          darkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-green-50 to-blue-50'
        }`}
      >
        <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Your Mood Tree 🌱
        </h4>
        
        <div className="relative">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${treeGrowth}px` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`mx-auto w-2 ${treeColor === 'text-green-500' ? 'bg-green-500' : treeColor === 'text-yellow-500' ? 'bg-yellow-500' : 'bg-orange-500'} rounded-full`}
          />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={`text-6xl ${treeColor} mt-2`}
          >
            {treeGrowth >= 80 ? '🌳' : treeGrowth >= 60 ? '🌿' : treeGrowth >= 40 ? '🌱' : '🌰'}
          </motion.div>
        </div>
        
        <div className="mt-4 space-y-2">
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Tree Health: {Math.round(treeGrowth)}%
          </p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Based on your last 7 mood logs
          </p>
        </div>
        
        {/* Mood history visualization */}
        <div className="flex justify-center gap-1 mt-4">
          {recentMoods.map((log, index) => (
            <div
              key={index}
              className={`w-2 h-8 rounded-full ${
                log.mood >= 4 ? 'bg-green-400' : 
                log.mood >= 3 ? 'bg-yellow-400' : 
                'bg-orange-400'
              }`}
              title={`Day ${index + 1}: ${moodEmojis.find(m => m.value === log.mood)?.emoji || '😐'}`}
            />
          ))}
        </div>
      </motion.div>
    )
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
          <Heart className="text-pink-500" size={20} />
          {t('moodTitle')}
        </h3>
        
        <button
          onClick={() => setShowMoodTree(!showMoodTree)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            darkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <TrendingUp size={16} />
          Mood Tree
        </button>
      </div>

      {/* Support Message */}
      <AnimatePresence>
        {showSupportMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border-l-4 border-violet-500 ${
              darkMode ? 'bg-violet-900/20' : 'bg-violet-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="text-violet-500" size={16} />
              <p className={`text-sm italic ${darkMode ? 'text-violet-300' : 'text-violet-700'}`}>
                {supportMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood Tree */}
      {showMoodTree && <MoodTree />}

      {/* Mood Selection */}
      <div className="space-y-4">
        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {t('howAreYouFeeling')}
        </h4>
        
        <div className="flex justify-between gap-2">
          {moodEmojis.map((mood) => (
            <motion.button
              key={mood.value}
              onClick={() => handleMoodSelection(mood)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                selectedMood?.value === mood.value
                  ? darkMode ? 'bg-violet-600/30 ring-2 ring-violet-500' : 'bg-violet-100 ring-2 ring-violet-400'
                  : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-3xl mb-1">{mood.emoji}</span>
              <span className={`text-xs ${mood.color}`}>{mood.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Intensity Slider */}
      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {t('moodIntensity')}: {moodIntensityLevels[intensity - 1].label}
          </h4>
          
          <div className="flex items-center gap-2">
            {moodIntensityLevels.map((level) => (
              <button
                key={level.level}
                onClick={() => setIntensity(level.level)}
                className={`flex-1 h-8 rounded-lg transition-all ${
                  intensity >= level.level ? level.color : 
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Notes and Voice Journal */}
      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          {/* Text Notes */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('addNotes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('addNotes')}
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Voice Journal */}
          <div className="space-y-3">
            <label className={`block text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('voiceJournal')}
            </label>
            
            <div className="flex items-center gap-3">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isRecording
                    ? 'bg-red-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              
              {audioBlob && (
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Voice note recorded
                  </span>
                  <button
                    onClick={() => {
                      const audio = new Audio(URL.createObjectURL(audioBlob))
                      audio.play()
                    }}
                    className={`p-2 rounded-lg ${
                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Play size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Save size={16} />
            {t('logMood')}
          </button>
        </motion.div>
      )}

      {/* Recent Moods Summary */}
      {moodLogs.length > 0 && (
        <div className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Recent Moods
          </h4>
          <div className="flex gap-2">
            {moodLogs.slice(0, 7).map((log, index) => {
              const moodEmoji = moodEmojis.find(m => m.value === log.mood)
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center p-2 rounded-lg ${
                    darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                  title={new Date(log.timestamp?.toDate?.() || log.timestamp).toLocaleDateString()}
                >
                  <span className="text-lg">{moodEmoji?.emoji || '😐'}</span>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(log.timestamp?.toDate?.() || log.timestamp).toLocaleDateString('en', { weekday: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
