
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
          
          toast.success('Welcome back!');
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
    const result = await signInWithPopup(auth, googleProvider);
    toast.success(`Welcome, ${result.user.displayName}!`);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    
    if (error.code === 'auth/popup-closed-by-user') {
      toast.error('Sign-in was cancelled');
    } else if (error.code === 'auth/popup-blocked') {
      toast.error('Pop-up was blocked. Please allow pop-ups and try again.');
    } else {
      toast.error('Failed to sign in with Google');
    }
    
    throw error;
  }
}

export async function signInGithub() {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    toast.success(`Welcome, ${result.user.displayName || result.user.email}!`);
    return result.user;
  } catch (error) {
    console.error('GitHub sign-in error:', error);
    
    if (error.code === 'auth/popup-closed-by-user') {
      toast.error('Sign-in was cancelled');
    } else if (error.code === 'auth/popup-blocked') {
      toast.error('Pop-up was blocked. Please allow pop-ups and try again.');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      toast.error('An account already exists with the same email address');
    } else {
      toast.error('Failed to sign in with GitHub');
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
