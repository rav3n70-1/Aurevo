
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Github, Chrome, Languages, Sun, Moon } from 'lucide-react'
import { signInGoogle, signInGithub } from '../hooks_useAuth'
import { useAppStore } from '../store'

const languageOptions = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' }
]

export default function Login() {
  const { t, i18n } = useTranslation()
  const { darkMode, toggleDarkMode, language, setLanguage } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInGoogle()
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setIsLoading(true)
    try {
      await signInGithub()
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode)
    i18n.changeLanguage(langCode)
    setShowLanguages(false)
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
        : 'bg-gradient-to-br from-violet-100 via-sky-100 to-rose-100'
    }`}>
      {/* Language and Theme Controls */}
      <div className="fixed top-4 right-4 flex items-center gap-3 z-50">
        <div className="relative">
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            className={`p-3 rounded-xl backdrop-blur-lg transition-all duration-200 ${
              darkMode 
                ? 'bg-gray-800/50 text-white hover:bg-gray-700/50' 
                : 'bg-white/50 text-gray-700 hover:bg-white/70'
            }`}
          >
            <Languages size={20} />
          </button>
          
          {showLanguages && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`absolute right-0 mt-2 py-2 rounded-xl backdrop-blur-lg min-w-48 ${
                darkMode ? 'bg-gray-800/90' : 'bg-white/90'
              }`}
            >
              {languageOptions.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                    language === lang.code
                      ? darkMode ? 'bg-purple-600/50' : 'bg-violet-100'
                      : darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                    {lang.name}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </div>
        
        <button
          onClick={toggleDarkMode}
          className={`p-3 rounded-xl backdrop-blur-lg transition-all duration-200 ${
            darkMode 
              ? 'bg-gray-800/50 text-yellow-400 hover:bg-gray-700/50' 
              : 'bg-white/50 text-gray-700 hover:bg-white/70'
          }`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className={`w-full max-w-md backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8 ${
          darkMode 
            ? 'bg-gray-800/50 border border-gray-700/50' 
            : 'bg-white/70 border border-white/20'
        }`}
      >
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center"
          >
            <span className="text-2xl text-white">✨</span>
          </motion.div>
          
          <div>
            <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent`}>
              Aurevo
            </h1>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Life + Academic Companion
            </p>
          </div>
        </div>

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`text-center p-4 rounded-xl ${
            darkMode ? 'bg-gray-700/30' : 'bg-white/30'
          }`}
        >
          <p className={`text-sm italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            "{t('emotionalSupport.growth')}"
          </p>
        </motion.div>

        {/* Sign In Buttons */}
        <div className="space-y-4">
          <motion.button 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 ${
              darkMode
                ? 'bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50'
                : 'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50'
            }`}
          >
            <Chrome size={20} />
            {isLoading ? t('loading') : t('loginWithGoogle')}
          </motion.button>
          
          <motion.button 
            onClick={handleGithubSignIn}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 ${
              darkMode
                ? 'border border-gray-600 text-white hover:bg-gray-700/50'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Github size={20} />
            {isLoading ? t('loading') : t('loginWithGithub')}
          </motion.button>
        </div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-4 pt-4"
        >
          {[
            { icon: '🎯', label: 'Mood Tracking' },
            { icon: '💧', label: 'Wellness' },
            { icon: '📚', label: 'Study Tools' },
            { icon: '🏆', label: 'Gamification' }
          ].map((feature, index) => (
            <div
              key={feature.label}
              className={`text-center p-3 rounded-lg ${
                darkMode ? 'bg-gray-700/30' : 'bg-white/30'
              }`}
            >
              <div className="text-xl mb-1">{feature.icon}</div>
              <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {feature.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Privacy Notice */}
        <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </motion.div>
    </div>
  )
}
