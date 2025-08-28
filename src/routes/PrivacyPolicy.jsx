import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Shield, Lock, Eye, Database, Mail, Globe, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../store'

export default function PrivacyPolicy() {
  const { t } = useTranslation()
  const { darkMode } = useAppStore()

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-gray-900'
    }`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            to="/"
            className={`inline-flex items-center gap-2 mb-6 text-sm ${
              darkMode ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-700'
            }`}
          >
            <ArrowLeft size={16} />
            Back to Aurevo
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-violet-500" size={32} />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`prose prose-lg max-w-none ${
            darkMode ? 'prose-invert' : ''
          }`}
        >
          <div className={`rounded-2xl border p-6 mb-8 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-green-500" size={24} />
              <h2 className="text-xl font-semibold m-0">Your Privacy Matters</h2>
            </div>
            <p className="m-0 text-base">
              Aurevo is committed to protecting your privacy and ensuring your personal data is handled with care. 
              This policy explains how we collect, use, and protect your information.
            </p>
          </div>

          {/* Information We Collect */}
          <section className={`rounded-xl border p-6 mb-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold m-0">Information We Collect</h2>
            </div>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Account Information</h3>
            <ul className="space-y-1">
              <li>Email address (from Google/GitHub OAuth)</li>
              <li>Display name and profile picture</li>
              <li>Authentication tokens (stored securely)</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Activity Data</h3>
            <ul className="space-y-1">
              <li>Mood tracking entries and emotional wellness data</li>
              <li>Study sessions, focus time, and academic progress</li>
              <li>Wellness metrics (water intake, sleep, exercise)</li>
              <li>Goals, tasks, and personal objectives</li>
              <li>Flashcards and learning materials</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Technical Information</h3>
            <ul className="space-y-1">
              <li>Device type and browser information</li>
              <li>App usage analytics (anonymized)</li>
              <li>Error logs for debugging purposes</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className={`rounded-xl border p-6 mb-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-purple-500" size={24} />
              <h2 className="text-xl font-semibold m-0">How We Use Your Information</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium mb-1">Core App Functionality</h3>
                <p className="text-base m-0">
                  Your data is used to provide personalized tracking, analytics, and recommendations 
                  within the Aurevo app.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Progress Analytics</h3>
                <p className="text-base m-0">
                  We analyze your activity patterns to provide insights and help you achieve your goals.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Service Improvement</h3>
                <p className="text-base m-0">
                  Anonymized usage data helps us improve app features and user experience.
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className={`rounded-xl border p-6 mb-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-red-500" size={24} />
              <h2 className="text-xl font-semibold m-0">Data Security & Storage</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium mb-1">Secure Infrastructure</h3>
                <p className="text-base m-0">
                  All data is stored on Google Firebase with enterprise-grade security, encryption at rest, 
                  and secure data transmission (HTTPS/TLS).
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Access Control</h3>
                <p className="text-base m-0">
                  Your data is accessible only to you. We implement strict Firestore security rules 
                  ensuring users can only access their own information.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Data Encryption</h3>
                <p className="text-base m-0">
                  Sensitive information like journal entries are encrypted before storage using 
                  industry-standard encryption methods.
                </p>
              </div>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className={`rounded-xl border p-6 mb-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="text-orange-500" size={24} />
              <h2 className="text-xl font-semibold m-0">Third-Party Services</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium mb-1">Authentication</h3>
                <ul className="space-y-1 m-0">
                  <li>Google OAuth (Google Sign-In)</li>
                  <li>GitHub OAuth (GitHub Sign-In)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Cloud Storage (Optional)</h3>
                <ul className="space-y-1 m-0">
                  <li>Google Drive API (for backup/restore)</li>
                  <li>Google Photos API (for study materials)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Analytics</h3>
                <ul className="space-y-1 m-0">
                  <li>Firebase Analytics (anonymized usage data)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className={`rounded-xl border p-6 mb-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-indigo-500" size={24} />
              <h2 className="text-xl font-semibold m-0">Your Rights & Control</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium mb-1">Data Access</h3>
                <p className="text-base m-0">
                  You can view and export all your data through the app's Settings page.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Data Deletion</h3>
                <p className="text-base m-0">
                  You can delete your account and all associated data at any time through Settings.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Data Portability</h3>
                <p className="text-base m-0">
                  Export your data in JSON format for use with other applications.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Privacy Controls</h3>
                <p className="text-base m-0">
                  Control what data is collected and how it's used through granular privacy settings.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className={`rounded-xl border p-6 mb-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="text-teal-500" size={24} />
              <h2 className="text-xl font-semibold m-0">Contact Us</h2>
            </div>
            
            <p className="text-base m-0">
              If you have questions about this Privacy Policy or your data, please contact us at:
            </p>
            <div className="mt-3">
              <p className="text-base m-0 font-medium">privacy@aurevo.app</p>
              <p className="text-sm text-gray-500 m-0 mt-1">
                We'll respond to privacy inquiries within 48 hours.
              </p>
            </div>
          </section>

          {/* Updates */}
          <section className={`rounded-xl border p-6 ${
            darkMode ? 'bg-violet-900/20 border-violet-500/30' : 'bg-violet-50 border-violet-200'
          }`}>
            <h2 className="text-xl font-semibold mb-3">Policy Updates</h2>
            <p className="text-base m-0">
              We may update this Privacy Policy periodically. Material changes will be communicated 
              through the app and via email. Continued use of Aurevo after updates constitutes 
              acceptance of the revised policy.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  )
}
