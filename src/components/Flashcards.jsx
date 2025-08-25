
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Brain, 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  Plus, 
  RotateCcw,
  CheckCircle,
  XCircle,
  Star,
  BookOpen,
  Shuffle,
  TrendingUp
} from 'lucide-react'
import { useAppStore } from '../store'

const DIFFICULTY_LEVELS = {
  EASY: { name: 'Easy', interval: 1, color: 'text-green-500' },
  MEDIUM: { name: 'Medium', interval: 3, color: 'text-yellow-500' },
  HARD: { name: 'Hard', interval: 7, color: 'text-red-500' }
}

const SAMPLE_FLASHCARDS = [
  {
    id: 1,
    question: 'What is overfitting in machine learning?',
    answer: 'Overfitting occurs when a model learns the training data too well, including noise and outliers, making it perform poorly on unseen data.',
    category: 'Machine Learning',
    difficulty: 'MEDIUM',
    lastReviewed: null,
    correctCount: 0,
    incorrectCount: 0
  },
  {
    id: 2,
    question: 'Define precision in classification metrics',
    answer: 'Precision = TP / (TP + FP). It measures the proportion of positive predictions that were actually correct.',
    category: 'Data Science',
    difficulty: 'EASY',
    lastReviewed: null,
    correctCount: 0,
    incorrectCount: 0
  },
  {
    id: 3,
    question: 'What is the difference between supervised and unsupervised learning?',
    answer: 'Supervised learning uses labeled data to train models for prediction, while unsupervised learning finds patterns in unlabeled data.',
    category: 'Machine Learning',
    difficulty: 'EASY',
    lastReviewed: null,
    correctCount: 0,
    incorrectCount: 0
  },
  {
    id: 4,
    question: 'Explain gradient descent algorithm',
    answer: 'Gradient descent is an optimization algorithm that finds the minimum of a function by iteratively moving towards the steepest descent direction.',
    category: 'Algorithms',
    difficulty: 'HARD',
    lastReviewed: null,
    correctCount: 0,
    incorrectCount: 0
  }
]

export default function Flashcards() {
  const { t } = useTranslation()
  const { darkMode, addXP } = useAppStore()
  
  const [flashcards, setFlashcards] = useState(SAMPLE_FLASHCARDS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyMode, setStudyMode] = useState('normal') // 'normal', 'spaced', 'shuffle'
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCard, setNewCard] = useState({ question: '', answer: '', category: '', difficulty: 'MEDIUM' })
  const [stats, setStats] = useState({ studied: 0, correct: 0, streak: 0 })
  const [categories, setCategories] = useState(['Machine Learning', 'Data Science', 'Algorithms'])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showUpload, setShowUpload] = useState(false)

  const currentCard = flashcards[currentIndex]
  const filteredCards = selectedCategory === 'All' 
    ? flashcards 
    : flashcards.filter(card => card.category === selectedCategory)

  // Spaced repetition logic
  const getCardsForReview = () => {
    const now = new Date()
    return flashcards.filter(card => {
      if (!card.lastReviewed) return true
      const daysSince = Math.floor((now - new Date(card.lastReviewed)) / (1000 * 60 * 60 * 24))
      const difficulty = DIFFICULTY_LEVELS[card.difficulty]
      return daysSince >= difficulty.interval
    })
  }

  const updateCardPerformance = (cardId, isCorrect) => {
    setFlashcards(prev => prev.map(card => {
      if (card.id === cardId) {
        const updated = {
          ...card,
          lastReviewed: new Date().toISOString(),
          correctCount: isCorrect ? card.correctCount + 1 : card.correctCount,
          incorrectCount: isCorrect ? card.incorrectCount : card.incorrectCount + 1
        }
        
        // Adjust difficulty based on performance
        const accuracy = updated.correctCount / (updated.correctCount + updated.incorrectCount)
        if (accuracy > 0.8 && updated.difficulty !== 'EASY') {
          updated.difficulty = 'EASY'
        } else if (accuracy < 0.5 && updated.difficulty !== 'HARD') {
          updated.difficulty = 'HARD'
        }
        
        return updated
      }
      return card
    }))

    // Update stats
    setStats(prev => ({
      studied: prev.studied + 1,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      streak: isCorrect ? prev.streak + 1 : 0
    }))

    // Add XP
    addXP(isCorrect ? 15 : 5)
  }

  const nextCard = () => {
    setShowAnswer(false)
    if (studyMode === 'shuffle') {
      setCurrentIndex(Math.floor(Math.random() * filteredCards.length))
    } else {
      setCurrentIndex((prev) => (prev + 1) % filteredCards.length)
    }
  }

  const prevCard = () => {
    setShowAnswer(false)
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length)
  }

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer)
  }

  const createFlashcard = () => {
    if (newCard.question && newCard.answer) {
      const card = {
        id: Date.now(),
        ...newCard,
        lastReviewed: null,
        correctCount: 0,
        incorrectCount: 0
      }
      
      setFlashcards(prev => [...prev, card])
      
      // Add category if new
      if (!categories.includes(newCard.category)) {
        setCategories(prev => [...prev, newCard.category])
      }
      
      setNewCard({ question: '', answer: '', category: '', difficulty: 'MEDIUM' })
      setShowCreateForm(false)
      addXP(10)
    }
  }

  const FlashcardComponent = () => (
    <motion.div
      key={currentCard?.id}
      initial={{ rotateY: 90 }}
      animate={{ rotateY: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative w-full h-80 rounded-xl cursor-pointer ${
        darkMode ? 'bg-gray-700' : 'bg-white'
      } shadow-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
      onClick={toggleAnswer}
    >
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        {/* Card Header */}
        <div className="flex justify-between items-start">
          <span className={`text-xs px-2 py-1 rounded ${
            darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            {currentCard?.category}
          </span>
          <span className={`text-xs ${DIFFICULTY_LEVELS[currentCard?.difficulty]?.color}`}>
            {DIFFICULTY_LEVELS[currentCard?.difficulty]?.name}
          </span>
        </div>

        {/* Card Content */}
        <div className="flex-1 flex items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {!showAnswer ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}
              >
                {currentCard?.question}
              </motion.div>
            ) : (
              <motion.div
                key="answer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {currentCard?.answer}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card Footer */}
        <div className="flex justify-between items-center">
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {currentIndex + 1} / {filteredCards.length}
          </span>
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Click to {showAnswer ? 'hide' : 'reveal'} answer
          </span>
        </div>
      </div>
    </motion.div>
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
          <Brain className="text-purple-500" size={20} />
          {t('flashcards')}
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              darkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-500' 
                : 'bg-blue-500 text-white hover:bg-blue-400'
            }`}
          >
            <Upload size={14} />
          </button>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              darkMode 
                ? 'bg-purple-600 text-white hover:bg-purple-500' 
                : 'bg-purple-500 text-white hover:bg-purple-400'
            }`}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-3 gap-4 p-4 rounded-lg ${
        darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            {stats.studied}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Studied
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
            {stats.studied > 0 ? Math.round((stats.correct / stats.studied) * 100) : 0}%
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Accuracy
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
            {stats.streak}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Streak
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select
            value={studyMode}
            onChange={(e) => setStudyMode(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="normal">Normal</option>
            <option value="spaced">Spaced Repetition</option>
            <option value="shuffle">Shuffle</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {getCardsForReview().length} due for review
          </span>
        </div>
      </div>

      {/* Flashcard */}
      {currentCard && <FlashcardComponent />}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevCard}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            darkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {/* Answer Buttons */}
        {showAnswer && (
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => {
                updateCardPerformance(currentCard.id, false)
                nextCard()
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-400 transition-colors"
            >
              <XCircle size={16} />
              Incorrect
            </motion.button>
            
            <motion.button
              onClick={() => {
                updateCardPerformance(currentCard.id, true)
                nextCard()
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-400 transition-colors"
            >
              <CheckCircle size={16} />
              Correct
            </motion.button>
          </div>
        )}

        <button
          onClick={nextCard}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            darkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-lg border space-y-4 ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Create New Flashcard
            </h4>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Question"
                value={newCard.question}
                onChange={(e) => setNewCard(prev => ({ ...prev, question: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              
              <textarea
                placeholder="Answer"
                value={newCard.answer}
                onChange={(e) => setNewCard(prev => ({ ...prev, answer: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Category"
                  value={newCard.category}
                  onChange={(e) => setNewCard(prev => ({ ...prev, category: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                
                <select
                  value={newCard.difficulty}
                  onChange={(e) => setNewCard(prev => ({ ...prev, difficulty: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                    <option key={key} value={key}>{level.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={createFlashcard}
                className="flex-1 py-2 rounded-lg bg-green-500 text-white hover:bg-green-400 transition-colors"
              >
                Create Card
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md p-6 rounded-xl ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {t('uploadPDF')}
              </h3>
              
              <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
                darkMode ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <Upload size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Drop PDF files here or click to browse
                </p>
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  AI will generate flashcards from your documents
                </p>
              </div>
              
              <button
                onClick={() => setShowUpload(false)}
                className="w-full mt-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Study Tip */}
      <div className={`p-3 rounded-lg ${
        darkMode ? 'bg-purple-900/20' : 'bg-purple-50'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Star className="text-purple-500" size={16} />
          <span className={`text-sm font-medium ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
            Study Tip
          </span>
        </div>
        <p className={`text-xs ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>
          {studyMode === 'spaced' 
            ? "Spaced repetition helps you remember information longer. Focus on cards due for review!"
            : showAnswer
            ? "Be honest about your performance. This helps the system adapt to your learning pace."
            : "Try to recall the answer before revealing it. Active recall strengthens memory formation."
          }
        </p>
      </div>
    </div>
  )
}
