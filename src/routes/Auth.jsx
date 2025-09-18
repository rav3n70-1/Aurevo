import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { auth, googleProvider, githubProvider } from '../lib/firebase'
import { signInWithRedirect, getRedirectResult } from 'firebase/auth'
import toast from 'react-hot-toast'

async function unregisterServiceWorkersAndClearCaches() {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map(reg => reg.unregister()))
    }
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map(k => caches.delete(k)))
    }
  } catch (e) {
    // ignore
  }
}

export default function Auth() {
  const { provider } = useParams()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        await unregisterServiceWorkersAndClearCaches()

        // If already authenticated (e.g., race), go to dashboard
        if (auth.currentUser) {
          navigate('/dashboard', { replace: true })
          return
        }

        const result = await getRedirectResult(auth)
        if (result && result.user) {
          toast.success(`Welcome, ${result.user.displayName || result.user.email || 'User'}!`)
          navigate('/dashboard', { replace: true })
          return
        }

        if (provider === 'google') {
          await signInWithRedirect(auth, googleProvider)
        } else if (provider === 'github') {
          await signInWithRedirect(auth, githubProvider)
        } else {
          toast.error('Unsupported provider')
          navigate('/login', { replace: true })
        }
      } catch (error) {
        console.error('Auth redirect error:', error)
        const code = error?.code
        if (code === 'auth/unauthorized-domain') {
          toast.error('This domain is not authorized. Please contact support.')
        } else if (code === 'auth/invalid-api-key') {
          toast.error('Invalid Firebase configuration. Please check API key.')
        } else if (code === 'auth/account-exists-with-different-credential') {
          toast.error('An account already exists with the same email address')
        } else if (code === 'auth/network-request-failed') {
          toast.error('Network error. Please check your connection and try again.')
        } else if (code !== 'auth/no-auth-event') {
          toast.error(`Sign-in failed: ${error.message}`)
        }
        navigate('/login', { replace: true })
      } finally {
        if (isMounted) setProcessing(false)
      }
    })()
    return () => { isMounted = false }
  }, [provider, navigate])

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
        <p>Signing you in...</p>
      </div>
    </div>
  )
} 