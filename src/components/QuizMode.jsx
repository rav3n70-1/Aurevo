import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Brain, 
  Clock, 
  Trophy, 
  Target,
  CheckCircle,
  XCircle,
  Star,
  RotateCcw,
  Play,
  Pause,
  Zap,
  Award,
  Flame
} from 'lucide-react'
import { useAppStore } from '../store'

const SAMPLE_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'What is the primary cause of overfitting in machine learning?',
    options: [
      'Too little training data',
      'Model is too complex for the dataset size',
      'Learning rate is too high',
      'Not enough epochs'
    ],
    correctAnswer: 1,
    explanation: 'Overfitting occurs when the model is too complex relative to the amount of training data, causing it to memorize noise rather than learn patterns.',
    difficulty: 'medium',
    category: 'Machine Learning'
  },
  {
    id: 2,
    question: 'Which metric is best for evaluating imbalanced classification datasets?',
    options: [
      'Accuracy',
      'F1-Score',
      'Mean Squared Error',
      'R-squared'
    ],
    correctAnswer: 1,
    explanation: 'F1-Score balances precision and recall, making it ideal for imbalanced datasets where accuracy can be misleading.',
    difficulty: 'medium',
    category: 'Data Science'
  },
  {
    id: 3,
    question: 'What is the time complexity of Quick Sort in the average case?',
    options: [
      'O(n)',
      'O(n log n)',
      'O(n²)',
      'O(log n)'
    ],
    correctAnswer: 1,
    explanation: 'Quick Sort has an average time complexity of O(n log n) due to the divide-and-conquer approach with logarithmic recursion depth.',
    difficulty: 'hard',
    category: 'Algorithms'
  },
  {
    id: 4,
    question: 'Which of the following is NOT a type of machine learning?',
    options: [
      'Supervised Learning',
      'Unsupervised Learning',
      'Reinforcement Learning',
      'Deterministic Learning'
    ],
    correctAnswer: 3,
    explanation: 'Deterministic Learning is not a recognized type of machine learning. The three main types are supervised, unsupervised, and reinforcement learning.',
    difficulty: 'easy',
    category: 'Machine Learning'
  }
]

const DIFFICULTY_COLORS = {
  easy: { bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-500' },
  medium: { bg: 'bg-yellow-500', text: 'text-yellow-500', ring: 'ring-yellow-500' },
  hard: { bg: 'bg-red-500', text: 'text-red-500', ring: 'ring-red-500' }
}

export default function QuizMode() {
  const { t } = useTranslation()
  const { darkMode, addXP } = useAppStore()
  
  const [isActive, setIsActive] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isAnswered, setIsAnswered] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [userAnswers, setUserAnswers] = useState([])
  const [shuffledQuestions, setShuffledQuestions] = useState([])

  const currentQuestion = shuffledQuestions[currentQuestionIndex]
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer

  // Timer effect
  useEffect(() => {
    if (!isActive || isAnswered || quizComplete) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, isAnswered, quizComplete])

  const startQuiz = () => {
    const shuffled = [...SAMPLE_QUIZ_QUESTIONS].sort(() => Math.random() - 0.5)
    setShuffledQuestions(shuffled)
    setIsActive(true)
    setCurrentQuestionIndex(0)
    setScore(0)
    setStreak(0)
    setTimeLeft(30)
    setQuizComplete(false)
    setUserAnswers([])
    setSelectedAnswer(null)
    setShowResult(false)
    setIsAnswered(false)
  }

  const handleAnswerSelect = (answerIndex) => {
    if (isAnswered) return
    
    setSelectedAnswer(answerIndex)
    setIsAnswered(true)
    setShowResult(true)
    
    const correct = answerIndex === currentQuestion.correctAnswer
    const timeBonus = Math.floor(timeLeft / 5) * 2 // Bonus points for speed
    const difficultyMultiplier = currentQuestion.difficulty === 'hard' ? 3 : currentQuestion.difficulty === 'medium' ? 2 : 1
    const points = correct ? (10 * difficultyMultiplier + timeBonus) : 0
    
    if (correct) {
      setScore(prev => prev + points)
      setStreak(prev => prev + 1)
      addXP(points)
    } else {
      setStreak(0)
    }

    setUserAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      correct,
      points,
      timeSpent: 30 - timeLeft
    }])
  }

  const handleTimeUp = () => {
    if (isAnswered) return
    
    setIsAnswered(true)
    setShowResult(true)
    setStreak(0)
    
    setUserAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedAnswer: null,
      correct: false,
      points: 0,
      timeSpent: 30
    }])
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setIsAnswered(false)
      setTimeLeft(30)
    } else {
      setQuizComplete(true)
    }
  }

  const resetQuiz = () => {
    setIsActive(false)
    setQuizComplete(false)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setStreak(0)
    setTimeLeft(30)
    setIsAnswered(false)
    setUserAnswers([])
    setShuffledQuestions([])
  }

  const getScoreGrade = () => {
    const percentage = (score / (shuffledQuestions.length * 15)) * 100 // Assuming average 15 points per question
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-500', emoji: '🌟' }
    if (percentage >= 80) return { grade: 'A', color: 'text-green-400', emoji: '⭐' }
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-500', emoji: '👍' }
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-500', emoji: '👌' }
    return { grade: 'D', color: 'text-red-500', emoji: '📚' }
  }

  if (!isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl shadow-sm border p-8 text-center ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="mb-6"
        >
          <Brain className="w-16 h-16 mx-auto text-purple-500" />
        </motion.div>
        
        <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Quiz Mode
        </h3>
        <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Test your knowledge with timed multiple-choice questions. Earn bonus points for speed and accuracy!
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {SAMPLE_QUIZ_QUESTIONS.length}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Questions
            </div>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className={`text-lg font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
              30s
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Per Question
            </div>
          </div>
        </div>
        
        <motion.button
          onClick={startQuiz}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-8 py-4 rounded-xl font-semibold flex items-center gap-3 mx-auto ${
            darkMode 
              ? 'bg-purple-600 text-white hover:bg-purple-500' 
              : 'bg-purple-500 text-white hover:bg-purple-400'
          }`}
        >
          <Play size={20} />
          Start Quiz
        </motion.button>
      </motion.div>
    )
  }

  if (quizComplete) {
    const finalGrade = getScoreGrade()
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl shadow-sm border p-8 text-center ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="mb-6"
        >
          <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
        </motion.div>
        
        <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Quiz Complete! {finalGrade.emoji}
        </h3>
        
        <div className={`text-4xl font-bold mb-2 ${finalGrade.color}`}>
          {score} points
        </div>
        <div className={`text-lg font-semibold mb-6 ${finalGrade.color}`}>
          Grade: {finalGrade.grade}
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {userAnswers.filter(a => a.correct).length}/{shuffledQuestions.length}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Correct
            </div>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className={`text-lg font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
              {Math.max(...userAnswers.map(a => a.points), 0)}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Best Score
            </div>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {Math.round(userAnswers.reduce((sum, a) => sum + a.timeSpent, 0) / userAnswers.length)}s
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Avg Time
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <motion.button
            onClick={startQuiz}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
              darkMode 
                ? 'bg-purple-600 text-white hover:bg-purple-500' 
                : 'bg-purple-500 text-white hover:bg-purple-400'
            }`}
          >
            <RotateCcw size={16} />
            Try Again
          </motion.button>
          <motion.button
            onClick={resetQuiz}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-lg font-semibold ${
              darkMode 
                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Exit
          </motion.button>
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
        <div className="flex items-center gap-3">
          <Brain className="text-purple-500" size={20} />
          <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Quiz Mode
          </h3>
          <span className={`px-2 py-1 rounded text-xs ${
            DIFFICULTY_COLORS[currentQuestion?.difficulty]?.bg
          } text-white`}>
            {currentQuestion?.difficulty}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500" size={16} />
            <span className={`font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
              {streak}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="text-yellow-500" size={16} />
            <span className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {score}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
          </span>
          <span className={`text-sm font-mono ${
            timeLeft <= 10 ? 'text-red-500' : darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {timeLeft}s
          </span>
        </div>
        
        <div className={`h-2 rounded-full overflow-hidden ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
          />
        </div>
        
        <div className={`h-1 rounded-full overflow-hidden ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <motion.div
            animate={{ width: `${(timeLeft / 30) * 100}%` }}
            transition={{ duration: 0.1 }}
            className={`h-full ${
              timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 20 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
          />
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={currentQuestion?.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {currentQuestion?.category}
          </div>
          <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {currentQuestion?.question}
          </h4>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion?.options.map((option, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                isAnswered
                  ? index === currentQuestion.correctAnswer
                    ? 'bg-green-500/20 border border-green-500'
                    : selectedAnswer === index
                    ? 'bg-red-500/20 border border-red-500'
                    : darkMode 
                      ? 'bg-gray-700/30 border border-gray-600' 
                      : 'bg-gray-100 border border-gray-200'
                  : darkMode 
                    ? 'bg-gray-700/50 border border-gray-600 hover:bg-gray-700 hover:border-gray-500' 
                    : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                  isAnswered
                    ? index === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-500 text-white'
                      : selectedAnswer === index
                      ? 'border-red-500 bg-red-500 text-white'
                      : darkMode ? 'border-gray-500' : 'border-gray-300'
                    : darkMode ? 'border-gray-500' : 'border-gray-300'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className={`${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {option}
                </span>
                {isAnswered && index === currentQuestion.correctAnswer && (
                  <CheckCircle className="text-green-500 ml-auto" size={20} />
                )}
                {isAnswered && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                  <XCircle className="text-red-500 ml-auto" size={20} />
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-lg border ${
                isCorrect
                  ? darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                  : darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle className="text-green-500" size={16} />
                ) : (
                  <XCircle className="text-red-500" size={16} />
                )}
                <span className={`font-semibold ${
                  isCorrect 
                    ? darkMode ? 'text-green-300' : 'text-green-700'
                    : darkMode ? 'text-red-300' : 'text-red-700'
                }`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
                {isCorrect && (
                  <span className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                    (+{10 * (currentQuestion.difficulty === 'hard' ? 3 : currentQuestion.difficulty === 'medium' ? 2 : 1) + Math.floor(timeLeft / 5) * 2} points)
                  </span>
                )}
              </div>
              <p className={`text-sm ${
                isCorrect 
                  ? darkMode ? 'text-green-200' : 'text-green-600'
                  : darkMode ? 'text-red-200' : 'text-red-600'
              }`}>
                {currentQuestion?.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Button */}
        {showResult && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={nextQuestion}
            className={`w-full py-3 rounded-lg font-semibold ${
              darkMode 
                ? 'bg-purple-600 text-white hover:bg-purple-500' 
                : 'bg-purple-500 text-white hover:bg-purple-400'
            }`}
          >
            {currentQuestionIndex < shuffledQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </motion.button>
        )}
      </motion.div>
    </div>
  )
} 