import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, Shield, FileText, Mail, Github, Globe } from 'lucide-react'
import { useAppStore } from '../store'

export default function Footer({ className = "" }) {
  const { darkMode } = useAppStore()

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`border-t mt-auto py-8 ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      } ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="text-white" size={18} />
              </div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Aurevo
              </h3>
            </div>
            <p className={`text-sm mb-4 max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Empowering your journey of growth, learning, and well-being through comprehensive 
              mood tracking, wellness monitoring, and academic excellence tools.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/aurevo"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Github size={20} />
              </a>
              <a
                href="mailto:support@aurevo.app"
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Mail size={20} />
              </a>
              <div className={`p-2 rounded-lg ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <Globe size={20} />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Features
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/mood" 
                  className={`text-sm transition-colors ${
                    darkMode 
                      ? 'text-gray-400 hover:text-violet-400' 
                      : 'text-gray-600 hover:text-violet-600'
                  }`}
                >
                  Mood Tracking
                </Link>
              </li>
              <li>
                <Link 
                  to="/wellness" 
                  className={`text-sm transition-colors ${
                    darkMode 
                      ? 'text-gray-400 hover:text-violet-400' 
                      : 'text-gray-600 hover:text-violet-600'
                  }`}
                >
                  Wellness Monitor
                </Link>
              </li>
              <li>
                <Link 
                  to="/study" 
                  className={`text-sm transition-colors ${
                    darkMode 
                      ? 'text-gray-400 hover:text-violet-400' 
                      : 'text-gray-600 hover:text-violet-600'
                  }`}
                >
                  Study Tools
                </Link>
              </li>
              <li>
                <Link 
                  to="/goals" 
                  className={`text-sm transition-colors ${
                    darkMode 
                      ? 'text-gray-400 hover:text-violet-400' 
                      : 'text-gray-600 hover:text-violet-600'
                  }`}
                >
                  Goal Setting
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/privacy" 
                  className={`text-sm transition-colors flex items-center gap-2 ${
                    darkMode 
                      ? 'text-gray-400 hover:text-violet-400' 
                      : 'text-gray-600 hover:text-violet-600'
                  }`}
                >
                  <Shield size={14} />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className={`text-sm transition-colors flex items-center gap-2 ${
                    darkMode 
                      ? 'text-gray-400 hover:text-violet-400' 
                      : 'text-gray-600 hover:text-violet-600'
                  }`}
                >
                  <FileText size={14} />
                  Terms of Service
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@aurevo.app"
                  className={`text-sm transition-colors flex items-center gap-2 ${
                    darkMode 
                      ? 'text-gray-400 hover:text-violet-400' 
                      : 'text-gray-600 hover:text-violet-600'
                  }`}
                >
                  <Mail size={14} />
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`mt-8 pt-6 border-t flex flex-col md:flex-row justify-between items-center ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            © {new Date().getFullYear()} Aurevo. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Made with ❤️ for your wellness journey
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
