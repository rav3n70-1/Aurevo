import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import toast from 'react-hot-toast';

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
        unlockedAvatars: ['default'],
        currentAvatar: 'default',
        
        // Actions
        setUser: (user) => set({ user }),
        setUserProfile: (profile) => set({ userProfile: profile }),
        setLoading: (isLoading) => set({ isLoading }),
        setLanguage: (language) => set({ language }),
        toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
        toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
        
        // Gamification actions
        addXP: (points) => set((state) => {
          const newXP = state.xp + points;
          const newLevel = Math.floor(newXP / 1000) + 1;
          const leveledUp = newLevel > state.level;
          
          if (leveledUp) {
            toast.success(`🎉 Level up! You reached level ${newLevel}!`);
            // Award shine points for leveling up
            return { 
              xp: newXP, 
              level: newLevel, 
              shinePoints: state.shinePoints + (newLevel * 10)
            };
          }
          
          return { xp: newXP, level: newLevel };
        }),
        addShinePoints: (points) => set((state) => ({ shinePoints: state.shinePoints + points })),
        updateStreak: (type, count) => set((state) => ({
          streaks: { ...state.streaks, [type]: count }
        })),
        unlockAvatar: (avatarId) => set((state) => ({
          unlockedAvatars: [...new Set([...state.unlockedAvatars, avatarId])]
        })),
        setCurrentAvatar: (avatarId) => set({ currentAvatar: avatarId }),
        
        // Initialize user profile
        initializeUserProfile: async (userId) => {
          try {
            const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
            if (userDoc.exists()) {
              const profile = userDoc.data();
              set({ 
                userProfile: profile,
                xp: profile.gamification?.xp || 0,
                level: profile.gamification?.level || 1,
                shinePoints: profile.gamification?.shinePoints || 0,
                streaks: profile.gamification?.streaks || { mood: 0, water: 0, study: 0, exercise: 0 },
                unlockedAvatars: profile.gamification?.unlockedAvatars || ['default'],
                currentAvatar: profile.gamification?.currentAvatar || 'default',
                language: profile.settings?.language || 'en',
                darkMode: profile.settings?.darkMode || false,
                notifications: profile.settings?.notifications !== false
              });
              return profile;
            } else {
              // Create new user profile
              const newProfile = {
                userId,
                createdAt: new Date(),
                settings: {
                  language: get().language || 'en',
                  darkMode: get().darkMode || false,
                  notifications: get().notifications !== false
                },
                gamification: {
                  xp: 0,
                  level: 1,
                  shinePoints: 0,
                  streaks: { mood: 0, water: 0, study: 0, exercise: 0 },
                  unlockedAvatars: ['default'],
                  currentAvatar: 'default'
                },
                wellness: {
                  dailyWaterGoal: 2000,
                  dailyCalorieGoal: 2000,
                  dailyStepGoal: 10000,
                  dailySleepGoal: 8
                }
              };
              await setDoc(doc(db, COLLECTIONS.USERS, userId), newProfile);
              set({ userProfile: newProfile });
              toast.success('Welcome to Aurevo! Your profile has been created.');
              return newProfile;
            }
          } catch (error) {
            console.error('Error initializing user profile:', error);
            toast.error('Failed to load user profile');
            return null;
          }
        },
        
        // Sync profile to Firebase
        syncProfile: async () => {
          const { user, userProfile, xp, level, shinePoints, streaks, currentAvatar, language, darkMode, notifications } = get();
          if (!user || !userProfile) return;
          
          try {
            await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
              'gamification.xp': xp,
              'gamification.level': level,
              'gamification.shinePoints': shinePoints,
              'gamification.streaks': streaks,
              'gamification.currentAvatar': currentAvatar,
              'settings.language': language,
              'settings.darkMode': darkMode,
              'settings.notifications': notifications,
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
  isLoading: false,
  
  setCurrentMood: (mood) => set({ currentMood: mood }),
  setLoading: (isLoading) => set({ isLoading }),
  
  logMood: async (moodData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    set({ isLoading: true });
    try {
      const moodLog = {
        userId: user.uid,
        mood: moodData.mood,
        intensity: moodData.intensity,
        notes: moodData.notes || '',
        timestamp: new Date(),
        tags: moodData.tags || []
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.MOOD_LOGS), moodLog);
      set((state) => ({ 
        moodLogs: [{ id: docRef.id, ...moodLog }, ...state.moodLogs]
      }));
      
      // Add XP for mood logging
      useAppStore.getState().addXP(10);
      toast.success('Mood logged successfully! +10 XP');
      
    } catch (error) {
      console.error('Error logging mood:', error);
      toast.error('Failed to log mood. Please try again.');
    } finally {
      set({ isLoading: false });
    }
  },
  
  addJournalEntry: async (entryData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    set({ isLoading: true });
    try {
      const journalEntry = {
        userId: user.uid,
        content: entryData.content,
        mood: entryData.mood,
        timestamp: new Date(),
        isEncrypted: entryData.isEncrypted || false,
        tags: entryData.tags || []
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.JOURNAL_ENTRIES), journalEntry);
      set((state) => ({ 
        journalEntries: [{ id: docRef.id, ...journalEntry }, ...state.journalEntries]
      }));
      
      // Add XP for journaling
      useAppStore.getState().addXP(20);
      toast.success('Journal entry added! +20 XP');
      
    } catch (error) {
      console.error('Error adding journal entry:', error);
      toast.error('Failed to add journal entry. Please try again.');
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadMoodData: async () => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    set({ isLoading: true });
    try {
      const moodQuery = query(
        collection(db, COLLECTIONS.MOOD_LOGS),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const journalQuery = query(
        collection(db, COLLECTIONS.JOURNAL_ENTRIES),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(50)
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
      toast.error('Failed to load mood data');
    } finally {
      set({ isLoading: false });
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
  isLoading: false,
  
  setLoading: (isLoading) => set({ isLoading }),
  
  updateWaterIntake: (amount) => {
    set((state) => {
      const newIntake = Math.max(0, state.waterIntake + amount);
      if (newIntake >= state.dailyWaterGoal && state.waterIntake < state.dailyWaterGoal) {
        useAppStore.getState().addXP(50); // Bonus for reaching goal
        useAppStore.getState().addShinePoints(10);
        toast.success('🎉 Water goal achieved! +50 XP, +10 Shine Points');
      }
      return { waterIntake: newIntake };
    });
  },
  
  updateCalories: (calories) => set({ calories: Math.max(0, calories) }),
  updateSteps: (steps) => set({ steps: Math.max(0, steps) }),
  updateSleep: (hours) => set({ sleepHours: Math.max(0, hours) }),
  
  resetDailyData: () => set({ waterIntake: 0, calories: 0, steps: 0, sleepHours: 0 }),
  
  saveWellnessData: async () => {
    const { user } = useAppStore.getState();
    const { waterIntake, calories, steps, sleepHours } = get();
    if (!user) return;
    
    try {
      const today = new Date().toDateString();
      const wellnessData = {
        userId: user.uid,
        date: today,
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
  },
  
  loadWellnessData: async () => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    set({ isLoading: true });
    try {
      const today = new Date().toDateString();
      const wellnessQuery = query(
        collection(db, COLLECTIONS.WELLNESS_DATA),
        where('userId', '==', user.uid),
        where('date', '==', today),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(wellnessQuery);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        set({
          waterIntake: data.waterIntake || 0,
          calories: data.calories || 0,
          steps: data.steps || 0,
          sleepHours: data.sleepHours || 0
        });
      }
    } catch (error) {
      console.error('Error loading wellness data:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));

// Task and goal management store
export const useTaskStore = create((set, get) => ({
  tasks: [],
  goals: [],
  studySessions: [],
  isLoading: false,
  
  setLoading: (isLoading) => set({ isLoading }),
  
  addTask: async (taskData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    set({ isLoading: true });
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
      set((state) => ({ 
        tasks: [{ id: docRef.id, ...task }, ...state.tasks] 
      }));
      
      toast.success('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    } finally {
      set({ isLoading: false });
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
      toast.success('Task completed! +25 XP');
      
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
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
      
      const docRef = await addDoc(collection(db, COLLECTIONS.STUDY_SESSIONS), session);
      set((state) => ({ 
        studySessions: [{ id: docRef.id, ...session }, ...state.studySessions] 
      }));
      
      // Add XP based on duration
      const xpGained = Math.floor(sessionData.duration / 5) * 5; // 5 XP per 5 minutes
      useAppStore.getState().addXP(xpGained);
      toast.success(`Study session logged! +${xpGained} XP`);
      
    } catch (error) {
      console.error('Error adding study session:', error);
      toast.error('Failed to log study session');
    }
  },
  
  loadTasks: async () => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    set({ isLoading: true });
    try {
      const tasksQuery = query(
        collection(db, COLLECTIONS.TASKS),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(tasksQuery);
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      set({ tasks });
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));

// Auto-sync store data to Firebase
useAppStore.subscribe(
  (state) => state.xp,
  () => {
    const store = useAppStore.getState();
    if (store.user && store.userProfile) {
      // Debounce the sync to avoid too many writes
      setTimeout(() => {
        store.syncProfile();
      }, 2000);
    }
  }
); 