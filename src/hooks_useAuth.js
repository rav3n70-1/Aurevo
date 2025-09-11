
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from './lib/firebase';
import { useAppStore } from './store';
import toast from 'react-hot-toast';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const { user, setUser, initializeUserProfile, setLoading: setGlobalLoading } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setGlobalLoading(true);
        
        if (firebaseUser) {
          // User is signed in
          setUser(firebaseUser);
          
          // Initialize user profile in Firestore
          await initializeUserProfile(firebaseUser.uid);
          
        } else {
          // User is signed out
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
  }, [setUser, initializeUserProfile, setGlobalLoading]);

  return { user, loading };
}

export async function signInGoogle() {
  try {
    // Check if Firebase is properly initialized
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    toast.success(`Welcome, ${result.user.displayName || 'User'}!`);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      toast.error('Sign-in was cancelled');
    } else if (error.code === 'auth/popup-blocked') {
      toast.error('Pop-up was blocked. Please allow pop-ups and try again.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      // Silent fail - user cancelled
      return null;
    } else if (error.code === 'auth/unauthorized-domain') {
      toast.error('This domain is not authorized. Please contact support.');
    } else if (error.code === 'auth/invalid-api-key') {
      toast.error('Invalid Firebase configuration. Please check API key.');
    } else if (error.code === 'auth/configuration-not-found') {
      toast.error('Firebase configuration error. Please check project setup.');
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
    // Check if Firebase is properly initialized
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    
    const result = await signInWithPopup(auth, githubProvider);
    toast.success(`Welcome, ${result.user.displayName || result.user.email || 'User'}!`);
    return result.user;
  } catch (error) {
    console.error('GitHub sign-in error:', error);
    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      toast.error('Sign-in was cancelled');
    } else if (error.code === 'auth/popup-blocked') {
      toast.error('Pop-up was blocked. Please allow pop-ups and try again.');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      toast.error('An account already exists with the same email address');
    } else if (error.code === 'auth/cancelled-popup-request') {
      // Silent fail - user cancelled
      return null;
    } else if (error.code === 'auth/unauthorized-domain') {
      toast.error('This domain is not authorized. Please contact support.');
    } else if (error.code === 'auth/invalid-api-key') {
      toast.error('Invalid Firebase configuration. Please check API key.');
    } else if (error.code === 'auth/configuration-not-found') {
      toast.error('Firebase configuration error. Please check project setup.');
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
