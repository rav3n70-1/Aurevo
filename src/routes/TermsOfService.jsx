import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FileText, Users, Shield, AlertTriangle, Scale, Mail, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../store'

export default function TermsOfService() {
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
            <FileText className="text-violet-500" size={32} />
            <h1 className="text-3xl font-bold">Terms of Service</h1>
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
              <Scale className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold m-0">Agreement to Terms</h2>
            </div>
            <p className="m-0 text-base">
              By accessing and using Aurevo, you accept and agree to be bound by the terms and provisions 
              of this agreement. Please read these terms carefully before using our service.
            </p>
          </div>

          {/* Service Description */}
          <section className={`rounded-xl border p-6 mb-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-green-500" size={24} />
              <h2 className="text-xl font-semibold m-0">Service Description</h2>
            </div>
            
            <p className="text-base">
              Aurevo is a comprehensive wellness and academic companion application that provides:
            </p>
            <ul className="space-y-1 mt-3">
              <li>Mood and emotional tracking tools</li>
              <li>Wellness monitoring (water, sleep, exercise, nutrition)</li>
              <li>Academic productivity features (Pomodoro, flashcards, study tracking)</li>
              <li>Goal setting and progress analytics</li>
              <li>Gamification and motivation systems</li>
              <li>Multi-language support and accessibility features</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section className={`rounded-xl border p-6 mb-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-purple-500" size={24} />
              <h2 className="text-xl font-semibold m-0">User Accounts & Responsibilities</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Account Creation</h3>
                <ul className="space-y-1">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>One account per person; sharing accounts is prohibited</li>
                  <li>You must be at least 13 years old to use Aurevo</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Acceptable Use</h3>
                <ul className="space-y-1">
                  <li>Use Aurevo for personal wellness and academic purposes only</li>
                  <li>Do not attempt to reverse engineer or hack the application</li>
                  <li>Respect other users and maintain appropriate conduct</li>
                  <li>Do not upload harmful, illegal, or inappropriate content</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Prohibited Activities</h3>
                <ul className="space-y-1">
                  <li>Sharing false or misleading information</li>
                  <li>Attempting to access other users' data</li>
                  <li>Using automated systems to interact with the service</li>
                  <li>Violating any applicable laws or regulations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data & Privacy */}
          <section className={`rounded-xl border p-6 mb-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-indigo-500" size={24} />
              <h2 className="text-xl font-semibold m-0">Data Ownership & Privacy</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium mb-1">Your Data</h3>
                <p className="text-base m-0">
                  You retain ownership of all personal data you provide to Aurevo. We act as a 
                  data processor to help you track and analyze your wellness and academic progress.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Data Use</h3>
                <p className="text-base m-0">
                  Your data is used solely for providing app functionality, generating insights, 
                  and improving your experience. See our <Link to="/privacy" className="text-violet-500">Privacy Policy</Link> for details.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Data Security</h3>
                <p className="text-base m-0">
                  We implement industry-standard security measures to protect your data, including 
                  encryption, secure storage, and access controls.
                </p>
              </div>
            </div>
          </section>

          {/* Service Availability */}
          <section className={`rounded-xl border p-6 mb-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-orange-500" size={24} />
              <h2 className="text-xl font-semibold m-0">Service Availability & Limitations</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium mb-1">Service Availability</h3>
                <p className="text-base m-0">
                  We strive to provide reliable service but cannot guarantee 100% uptime. 
                  Maintenance, updates, and technical issues may temporarily affect availability.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Medical Disclaimer</h3>
                <p className="text-base m-0">
                  Aurevo is not a medical device or health monitoring system. It provides 
                  general wellness tracking and should not replace professional medical advice, 
                  diagnosis, or treatment.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Educational Purpose</h3>
                <p className="text-base m-0">
                  Academic features are designed to support learning but are not substitutes 
                  for formal education or professional academic guidance.
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className={`rounded-xl border p-6 mb-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-red-500" size={24} />
              <h2 className="text-xl font-semibold m-0">Intellectual Property</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium mb-1">Our Content</h3>
                <p className="text-base m-0">
                  Aurevo's design, code, features, and content are protected by intellectual 
                  property laws. You may not copy, modify, or distribute our proprietary content.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Your Content</h3>
                <p className="text-base m-0">
                  You retain rights to content you create (journal entries, notes, etc.). 
                  By using Aurevo, you grant us license to process this content to provide services.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Third-Party Content</h3>
                <p className="text-base m-0">
                  Some features integrate with third-party services (Google, GitHub). 
                  Their terms and policies apply to content from those sources.
                </p>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section className={`rounded-xl border p-6 mb-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-yellow-500" size={24} />
              <h2 className="text-xl font-semibold m-0">Account Termination</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium mb-1">Voluntary Termination</h3>
                <p className="text-base m-0">
                  You may delete your account at any time through the Settings page. 
                  This will permanently remove all your data from our systems.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Involuntary Termination</h3>
                <p className="text-base m-0">
                  We may suspend or terminate accounts that violate these terms, 
                  engage in harmful activities, or pose security risks.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Data After Termination</h3>
                <p className="text-base m-0">
                  Upon account deletion, your data is permanently removed within 30 days. 
                  We recommend exporting important data before termination.
                </p>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className={`rounded-xl border p-6 mb-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="text-gray-500" size={24} />
              <h2 className="text-xl font-semibold m-0">Limitation of Liability</h2>
            </div>
            
            <p className="text-base">
              Aurevo is provided "as is" without warranties. We are not liable for:
            </p>
            <ul className="space-y-1 mt-3">
              <li>Data loss due to technical issues or user error</li>
              <li>Decisions made based on app insights or recommendations</li>
              <li>Service interruptions or performance issues</li>
              <li>Third-party service failures or security breaches</li>
              <li>Indirect, incidental, or consequential damages</li>
            </ul>
          </section>

          {/* Changes to Terms */}
          <section className={`rounded-xl border p-6 mb-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-teal-500" size={24} />
              <h2 className="text-xl font-semibold m-0">Changes to Terms</h2>
            </div>
            
            <p className="text-base m-0">
              We may update these Terms of Service periodically. Material changes will be 
              communicated through the app and via email. Continued use after updates 
              constitutes acceptance of the revised terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className={`rounded-xl border p-6 mb-6 ${
            darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold m-0">Contact Us</h2>
            </div>
            
            <p className="text-base">
              Questions about these Terms of Service? Contact us at:
            </p>
            <div className="mt-3 space-y-1">
              <p className="text-base m-0 font-medium">legal@aurevo.app</p>
              <p className="text-base m-0 font-medium">support@aurevo.app</p>
              <p className="text-sm text-gray-500 m-0 mt-2">
                We respond to legal inquiries within 72 hours.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className={`rounded-xl border p-6 ${
            darkMode ? 'bg-violet-900/20 border-violet-500/30' : 'bg-violet-50 border-violet-200'
          }`}>
            <h2 className="text-xl font-semibold mb-3">Governing Law</h2>
            <p className="text-base m-0">
              These Terms of Service are governed by applicable international laws and regulations. 
              Any disputes will be resolved through binding arbitration. By using Aurevo, you 
              agree to these terms and waive the right to participate in class-action lawsuits.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  )
}
