
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

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing Firebase environment variables:', missingVars);
  throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Configure auth providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/photoslibrary.readonly');

// Set custom parameters for better UX
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const githubProvider = new GithubAuthProvider();

// Set custom parameters for GitHub
githubProvider.setCustomParameters({
  allow_signup: 'true'
});

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
  USER_PROGRESS: 'userProgress',
  // New collections for advanced features
  HABITS: 'habits',
  GOAL_DEPENDENCIES: 'goalDependencies',
  GOAL_COMMENTS: 'goalComments',
  GOAL_ATTACHMENTS: 'goalAttachments',
  FOCUS_SESSIONS: 'focusSessions',
  ACHIEVEMENTS: 'achievements',
  TEMPLATES: 'templates',
  OKRS: 'okrs',
  CALENDAR_EVENTS: 'calendarEvents',
  REMINDERS: 'reminders',
  SHARED_GOALS: 'sharedGoals',
  GOAL_VERSIONS: 'goalVersions',
  CUSTOM_FIELDS: 'customFields',
  AUTOMATION_RULES: 'automationRules',
  // Social
  POSTS: 'posts',
  POST_COMMENTS: 'postComments'
};

// Utility functions for Firestore paths
export const getUserDocPath = (userId) => `${COLLECTIONS.USERS}/${userId}`;
export const getUserSubcollectionPath = (userId, subcollection) => 
  `${COLLECTIONS.USERS}/${userId}/${subcollection}`;

export default app;
