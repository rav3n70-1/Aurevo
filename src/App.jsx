
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import Login from './routes/Login'
import Dashboard from './routes/Dashboard'
import Onboarding from './routes/Onboarding'
import Mood from './routes/Mood'
import Wellness from './routes/Wellness'
import Study from './routes/Study'
import Goals from './routes/Goals'
import Reports from './routes/Reports'
import Profile from './routes/Profile'
import Settings from './routes/Settings'
import PrivacyPolicy from './routes/PrivacyPolicy'
import TermsOfService from './routes/TermsOfService'
import LandingPage from './routes/LandingPage'
import { useAuth } from './hooks_useAuth'
import { useAppStore, useNotificationStore, useMoodStore, useWellnessStore, useTaskStore } from './store'
import { useEffect } from 'react'
import './i18n'

export default function App() {
  const { user, loading } = useAuth()
  const { darkMode } = useAppStore()
  const { initializeNotifications } = useNotificationStore()
  const { loadMoodData } = useMoodStore()
  const { initializeWellnessData } = useWellnessStore()
  const { loadStudySessionsHistory } = useTaskStore()
  const { t } = useTranslation()

  // Initialize notifications when app starts
  useEffect(() => {
    initializeNotifications()
  }, [])

  // Load core data once user is available to keep dashboard/sidebar stats consistent
  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        await Promise.all([
          loadMoodData(),
          initializeWellnessData(),
          loadStudySessionsHistory(14)
        ])
      } catch (e) {
        console.error('Failed to initialize core data:', e)
      }
    })()
  }, [user, loadMoodData, initializeWellnessData, loadStudySessionsHistory])

  if (loading) {
    return (
      <div className={`h-screen grid place-items-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-600'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/onboarding" element={user ? <Onboarding /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/mood" element={user ? <Mood /> : <Navigate to="/login" />} />
          <Route path="/wellness" element={user ? <Wellness /> : <Navigate to="/login" />} />
          <Route path="/study" element={user ? <Study /> : <Navigate to="/login" />} />
          <Route path="/goals" element={user ? <Goals /> : <Navigate to="/login" />} />
          <Route path="/reports" element={user ? <Reports /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: darkMode ? '#1f2937' : '#ffffff',
              color: darkMode ? '#f9fafb' : '#111827',
              border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff'
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff'
              }
            }
          }}
        />
      </div>
    </div>
  )
}
