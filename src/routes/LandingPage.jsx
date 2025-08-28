import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { 
  BookOpen, 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Users, 
  Star, 
  ChevronRight,
  Play,
  CheckCircle,
  Zap,
  Heart,
  Award,
  Globe,
  ArrowRight,
  X,
  Shield,
  FileText,
  Sparkles,
  GraduationCap,
  BarChart3,
  Timer,
  Lightbulb
} from 'lucide-react'
import { useAppStore } from '../store'
import Footer from '../components/Footer'

export default function LandingPage() {
  const { t } = useTranslation()
  const { darkMode, toggleDarkMode } = useAppStore()
  const [showTermsPopup, setShowTermsPopup] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)

  // Check if terms were previously accepted
  useEffect(() => {
    const accepted = localStorage.getItem('termsAccepted')
    if (accepted === 'true') {
      setTermsAccepted(true)
    } else {
      // Show popup after 2 seconds
      const timer = setTimeout(() => setShowTermsPopup(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptTerms = () => {
    setTermsAccepted(true)
    setShowTermsPopup(false)
    localStorage.setItem('termsAccepted', 'true')
  }

  const features = [
    {
      icon: <Brain className="text-violet-500" size={32} />,
      title: "AI-Powered Learning",
      description: "Smart flashcards with spaced repetition and adaptive difficulty"
    },
    {
      icon: <Timer className="text-blue-500" size={32} />,
      title: "Focus Sessions",
      description: "Pomodoro timer with study tracking and productivity insights"
    },
    {
      icon: <BarChart3 className="text-green-500" size={32} />,
      title: "Progress Analytics",
      description: "Detailed insights into your learning patterns and achievements"
    },
    {
      icon: <Target className="text-red-500" size={32} />,
      title: "Goal Management",
      description: "Set and track academic goals with milestone celebrations"
    }
  ]

  const stats = [
    { number: "10K+", label: "Active Students" },
    { number: "1M+", label: "Study Sessions" },
    { number: "95%", label: "Improved Grades" },
    { number: "4.9★", label: "User Rating" }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      quote: "Aurevo transformed my study habits. The AI flashcards helped me ace my algorithms course!",
      avatar: "👩‍💻"
    },
    {
      name: "Marcus Johnson",
      role: "Medical Student",
      quote: "The mood tracking feature helped me maintain balance during intense study periods.",
      avatar: "👨‍⚕️"
    },
    {
      name: "Aisha Patel",
      role: "Engineering Student",
      quote: "Best study companion ever! The progress analytics keep me motivated.",
      avatar: "👩‍🔬"
    }
  ]

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-lg transition-colors ${
        darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'
      } border-b`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Aurevo
              </h1>
            </motion.div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={toggleDarkMode}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-lg ${
                  darkMode ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {darkMode ? '☀️' : '🌙'}
              </motion.button>
              
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Sign In
                </motion.button>
              </Link>
              
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 mb-6">
                <Sparkles className="text-violet-500" size={16} />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  #1 Study Companion App
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Master Your
                <span className="block bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                  Academic Journey
                </span>
              </h1>
              
              <p className={`text-xl leading-relaxed mb-8 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Transform your study habits with AI-powered tools, mood tracking, and 
                comprehensive wellness monitoring. Join thousands of students achieving 
                academic excellence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                  >
                    Start Learning Free
                    <ArrowRight size={20} />
                  </motion.button>
                </Link>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full sm:w-auto px-8 py-4 border-2 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800' 
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Play size={20} />
                  Watch Demo
                </motion.button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-violet-500">{stat.number}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Main Card */}
              <div className={`relative rounded-3xl p-8 shadow-2xl ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                    {features[currentFeature].icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{features[currentFeature].title}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {features[currentFeature].description}
                    </p>
                  </div>
                </div>
                
                {/* Feature Indicators */}
                <div className="flex gap-2 mb-6">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentFeature ? 'bg-violet-500 w-8' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Mock Study Interface */}
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Focus Session</span>
                      <span className="text-violet-500 font-mono">25:00</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Daily Goal</span>
                      <span className="text-green-500">80% Complete</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Award className="text-white" size={24} />
              </motion.div>
              
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <TrendingUp className="text-white" size={24} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 ${
        darkMode ? 'bg-gray-800/50' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to 
              <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                {" "}Excel
              </span>
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Comprehensive study tools designed to boost your academic performance and well-being
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-2xl transition-all ${
                  darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-lg'
                }`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">What Students Say</h2>
            <p className={`text-xl max-w-2xl mx-auto ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Join thousands of students who've transformed their academic journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl ${
                  darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'
                }`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${
        darkMode ? 'bg-gradient-to-r from-violet-900/50 to-purple-900/50' : 'bg-gradient-to-r from-violet-50 to-purple-50'
      }`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Studies?
            </h2>
            <p className={`text-xl mb-8 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Join thousands of students who've already improved their grades with Aurevo
            </p>
            
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg"
              >
                Start Your Journey Today
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Terms Popup */}
      <AnimatePresence>
        {showTermsPopup && !termsAccepted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className={`w-full max-w-2xl p-6 rounded-t-2xl ${
                darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Shield className="text-violet-500" size={24} />
                  <h3 className="text-lg font-semibold">Privacy & Terms</h3>
                </div>
                <button
                  onClick={() => setShowTermsPopup(false)}
                  className={`p-1 rounded-lg ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
              
              <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                By using Aurevo, you agree to our Terms of Service and Privacy Policy. 
                We're committed to protecting your data and providing a safe learning environment.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={handleAcceptTerms}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-lg transition-all"
                >
                  Accept & Continue
                </motion.button>
                
                <div className="flex gap-3">
                  <Link
                    to="/privacy"
                    className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      darkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Shield size={16} />
                    Privacy
                  </Link>
                  
                  <Link
                    to="/terms"
                    className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      darkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <FileText size={16} />
                    Terms
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
