
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Configure auth providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/photoslibrary.readonly');

export const githubProvider = new GithubAuthProvider();

// Firestore collections
export const COLLECTIONS = {
  USERS: 'users',
  MOOD_LOGS: 'moodLogs',
  JOURNAL_ENTRIES: 'journalEntries',
  WELLNESS_DATA: 'wellnessData',
  TASKS: 'tasks',
  GOALS: 'goals',
  STUDY_SESSIONS: 'studySessions',
  FLASHCARDS: 'flashcards',
  STREAK_DATA: 'streakData',
  NOTIFICATIONS: 'notifications',
  USER_PROGRESS: 'userProgress'
};

// Utility functions for Firestore paths
export const getUserDocPath = (userId) => `${COLLECTIONS.USERS}/${userId}`;
export const getUserSubcollectionPath = (userId, subcollection) => 
  `${COLLECTIONS.USERS}/${userId}/${subcollection}`;

export default app;
