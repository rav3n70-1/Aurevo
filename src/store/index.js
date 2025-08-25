import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';

// Main app store
export const useAppStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // User & Auth
        user: null,
        userProfile: null,
        isLoading: false,
        
        // App Settings
        language: 'en',
        darkMode: false,
        notifications: true,
        
        // Gamification
        xp: 0,
        level: 1,
        shinePoints: 0,
        streaks: {
          mood: 0,
          water: 0,
          study: 0,
          exercise: 0
        },
        unlockedAvatars: [],
        currentAvatar: 'default',
        
        // Actions
        setUser: (user) => set({ user }),
        setUserProfile: (profile) => set({ userProfile }),
        setLoading: (isLoading) => set({ isLoading }),
        setLanguage: (language) => set({ language }),
        toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
        toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
        
        // Gamification actions
        addXP: (points) => set((state) => {
          const newXP = state.xp + points;
          const newLevel = Math.floor(newXP / 1000) + 1;
          return { xp: newXP, level: newLevel };
        }),
        addShinePoints: (points) => set((state) => ({ shinePoints: state.shinePoints + points })),
        updateStreak: (type, count) => set((state) => ({
          streaks: { ...state.streaks, [type]: count }
        })),
        unlockAvatar: (avatarId) => set((state) => ({
          unlockedAvatars: [...state.unlockedAvatars, avatarId]
        })),
        setCurrentAvatar: (avatarId) => set({ currentAvatar: avatarId }),
        
        // Initialize user profile
        initializeUserProfile: async (userId) => {
          try {
            const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
            if (userDoc.exists()) {
              const profile = userDoc.data();
              set({ userProfile: profile });
              return profile;
            } else {
              // Create new user profile
              const newProfile = {
                userId,
                createdAt: new Date(),
                settings: {
                  language: 'en',
                  darkMode: false,
                  notifications: true
                },
                gamification: {
                  xp: 0,
                  level: 1,
                  shinePoints: 0,
                  streaks: { mood: 0, water: 0, study: 0, exercise: 0 },
                  unlockedAvatars: ['default'],
                  currentAvatar: 'default'
                }
              };
              await setDoc(doc(db, COLLECTIONS.USERS, userId), newProfile);
              set({ userProfile: newProfile });
              return newProfile;
            }
          } catch (error) {
            console.error('Error initializing user profile:', error);
            return null;
          }
        },
        
        // Sync profile to Firebase
        syncProfile: async () => {
          const { user, userProfile, xp, level, shinePoints, streaks, currentAvatar } = get();
          if (!user || !userProfile) return;
          
          try {
            await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
              'gamification.xp': xp,
              'gamification.level': level,
              'gamification.shinePoints': shinePoints,
              'gamification.streaks': streaks,
              'gamification.currentAvatar': currentAvatar,
              lastUpdated: new Date()
            });
          } catch (error) {
            console.error('Error syncing profile:', error);
          }
        }
      }),
      {
        name: 'aurevo-app-store',
        partialize: (state) => ({
          language: state.language,
          darkMode: state.darkMode,
          notifications: state.notifications
        })
      }
    )
  )
);

// Mood tracking store
export const useMoodStore = create((set, get) => ({
  moodLogs: [],
  journalEntries: [],
  currentMood: null,
  
  setCurrentMood: (mood) => set({ currentMood: mood }),
  
  logMood: async (moodData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const moodLog = {
        userId: user.uid,
        mood: moodData.mood,
        intensity: moodData.intensity,
        notes: moodData.notes || '',
        timestamp: new Date(),
        tags: moodData.tags || []
      };
      
      await addDoc(collection(db, COLLECTIONS.MOOD_LOGS), moodLog);
      set((state) => ({ moodLogs: [moodLog, ...state.moodLogs] }));
      
      // Add XP for mood logging
      useAppStore.getState().addXP(10);
      
    } catch (error) {
      console.error('Error logging mood:', error);
    }
  },
  
  addJournalEntry: async (entryData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const journalEntry = {
        userId: user.uid,
        content: entryData.content,
        mood: entryData.mood,
        timestamp: new Date(),
        isEncrypted: entryData.isEncrypted || false,
        tags: entryData.tags || []
      };
      
      await addDoc(collection(db, COLLECTIONS.JOURNAL_ENTRIES), journalEntry);
      set((state) => ({ journalEntries: [journalEntry, ...state.journalEntries] }));
      
      // Add XP for journaling
      useAppStore.getState().addXP(20);
      
    } catch (error) {
      console.error('Error adding journal entry:', error);
    }
  },
  
  loadMoodData: async () => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const moodQuery = query(
        collection(db, COLLECTIONS.MOOD_LOGS),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      const journalQuery = query(
        collection(db, COLLECTIONS.JOURNAL_ENTRIES),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      const [moodSnapshot, journalSnapshot] = await Promise.all([
        getDocs(moodQuery),
        getDocs(journalQuery)
      ]);
      
      const moodLogs = moodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const journalEntries = journalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      set({ moodLogs, journalEntries });
      
    } catch (error) {
      console.error('Error loading mood data:', error);
    }
  }
}));

// Wellness tracking store
export const useWellnessStore = create((set, get) => ({
  waterIntake: 0,
  dailyWaterGoal: 2000,
  calories: 0,
  steps: 0,
  sleepHours: 0,
  
  updateWaterIntake: (amount) => {
    set((state) => {
      const newIntake = Math.max(0, state.waterIntake + amount);
      if (newIntake >= state.dailyWaterGoal && state.waterIntake < state.dailyWaterGoal) {
        useAppStore.getState().addXP(50); // Bonus for reaching goal
      }
      return { waterIntake: newIntake };
    });
  },
  
  updateCalories: (calories) => set({ calories }),
  updateSteps: (steps) => set({ steps }),
  updateSleep: (hours) => set({ sleepHours: hours }),
  
  resetDailyData: () => set({ waterIntake: 0, calories: 0, steps: 0, sleepHours: 0 }),
  
  saveWellnessData: async () => {
    const { user } = useAppStore.getState();
    const { waterIntake, calories, steps, sleepHours } = get();
    if (!user) return;
    
    try {
      const wellnessData = {
        userId: user.uid,
        date: new Date().toDateString(),
        waterIntake,
        calories,
        steps,
        sleepHours,
        timestamp: new Date()
      };
      
      await addDoc(collection(db, COLLECTIONS.WELLNESS_DATA), wellnessData);
    } catch (error) {
      console.error('Error saving wellness data:', error);
    }
  }
}));

// Task and goal management store
export const useTaskStore = create((set, get) => ({
  tasks: [],
  goals: [],
  studySessions: [],
  
  addTask: async (taskData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const task = {
        userId: user.uid,
        title: taskData.title,
        description: taskData.description || '',
        category: taskData.category || 'general',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate,
        completed: false,
        createdAt: new Date(),
        recurring: taskData.recurring || false,
        recurringPattern: taskData.recurringPattern || null
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.TASKS), task);
      set((state) => ({ tasks: [...state.tasks, { id: docRef.id, ...task }] }));
      
    } catch (error) {
      console.error('Error adding task:', error);
    }
  },
  
  completeTask: async (taskId) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.TASKS, taskId), { 
        completed: true,
        completedAt: new Date()
      });
      
      set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        )
      }));
      
      // Add XP for task completion
      useAppStore.getState().addXP(25);
      
    } catch (error) {
      console.error('Error completing task:', error);
    }
  },
  
  addStudySession: async (sessionData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const session = {
        userId: user.uid,
        subject: sessionData.subject,
        duration: sessionData.duration,
        type: sessionData.type || 'study',
        notes: sessionData.notes || '',
        timestamp: new Date()
      };
      
      await addDoc(collection(db, COLLECTIONS.STUDY_SESSIONS), session);
      set((state) => ({ studySessions: [session, ...state.studySessions] }));
      
      // Add XP based on duration
      useAppStore.getState().addXP(Math.floor(sessionData.duration / 5));
      
    } catch (error) {
      console.error('Error adding study session:', error);
    }
  }
}));

// Auto-sync store data to Firebase
useAppStore.subscribe(
  (state) => state.xp,
  () => {
    const store = useAppStore.getState();
    if (store.user && store.userProfile) {
      store.syncProfile();
    }
  }
); 