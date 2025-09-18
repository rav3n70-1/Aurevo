
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from './lib/firebase';
import { useAppStore } from './store';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const { user, setUser, initializeUserProfile, setLoading: setGlobalLoading } = useAppStore();
  const navigate = useNavigate?.() || (() => {});
  const location = useLocation?.();

  // Process redirect result after returning from provider sign-in
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          toast.success(`Welcome, ${result.user.displayName || result.user.email || 'User'}!`);
          if (location && (location.pathname === '/login' || location.pathname.startsWith('/auth/'))) {
            navigate('/dashboard', { replace: true });
          }
        }
      } catch (error) {
        if (error && error.code === 'auth/no-auth-event') return;
        console.error('Auth redirect handling error:', error);
        if (error.code === 'auth/unauthorized-domain') {
          toast.error('This domain is not authorized. Please contact support.');
        } else if (error.code === 'auth/invalid-api-key') {
          toast.error('Invalid Firebase configuration. Please check API key.');
        } else if (error.code === 'auth/account-exists-with-different-credential') {
          toast.error('An account already exists with the same email address');
        } else if (error.code === 'auth/network-request-failed') {
          toast.error('Network error. Please check your connection and try again.');
        } else {
          toast.error(`Sign-in failed: ${error.message}`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [navigate, location]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setGlobalLoading(true);
        if (firebaseUser) {
          setUser(firebaseUser);
          await initializeUserProfile(firebaseUser.uid);
          if (location && (location.pathname === '/login' || location.pathname.startsWith('/auth/'))) {
            navigate('/dashboard', { replace: true });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        toast.error('Authentication error occurred');
      } finally {
        setLoading(false);
        setGlobalLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, initializeUserProfile, setGlobalLoading, navigate, location]);

  return { user, loading };
}

export async function signInGoogle() {
  try {
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    await signInWithRedirect(auth, googleProvider);
    return null;
  } catch (error) {
    console.error('Google sign-in error:', error);
    if (error.code === 'auth/unauthorized-domain') {
      toast.error('This domain is not authorized. Please contact support.');
    } else if (error.code === 'auth/invalid-api-key') {
      toast.error('Invalid Firebase configuration. Please check API key.');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      toast.error('An account already exists with the same email address');
    } else if (error.code === 'auth/network-request-failed') {
      toast.error('Network error. Please check your connection and try again.');
    } else {
      toast.error(`Sign-in failed: ${error.message}`);
    }
    throw error;
  }
}

export async function signInGithub() {
  try {
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    await signInWithRedirect(auth, githubProvider);
    return null;
  } catch (error) {
    console.error('GitHub sign-in error:', error);
    if (error.code === 'auth/unauthorized-domain') {
      toast.error('This domain is not authorized. Please contact support.');
    } else if (error.code === 'auth/invalid-api-key') {
      toast.error('Invalid Firebase configuration. Please check API key.');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      toast.error('An account already exists with the same email address');
    } else if (error.code === 'auth/network-request-failed') {
      toast.error('Network error. Please check your connection and try again.');
    } else {
      toast.error(`Sign-in failed: ${error.message}`);
    }
    throw error;
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    toast.success('Signed out successfully');
  } catch (error) {
    console.error('Sign-out error:', error);
    toast.error('Failed to sign out');
    throw error;
  }
}
