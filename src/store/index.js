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
      console.log('Loading mood data for user:', user.uid);
      
      // Try the optimized queries first (requires indexes)
      let moodQuery = query(
        collection(db, COLLECTIONS.MOOD_LOGS),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      let journalQuery = query(
        collection(db, COLLECTIONS.JOURNAL_ENTRIES),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      let moodSnapshot, journalSnapshot;
      
      try {
        [moodSnapshot, journalSnapshot] = await Promise.all([
          getDocs(moodQuery),
          getDocs(journalQuery)
        ]);
      } catch (indexError) {
        console.warn('Mood data indexes not available, falling back to simple queries:', indexError.message);
        
        // Fallback to simple queries without orderBy if indexes are missing
        moodQuery = query(
          collection(db, COLLECTIONS.MOOD_LOGS),
          where('userId', '==', user.uid),
          limit(150)
        );
        
        journalQuery = query(
          collection(db, COLLECTIONS.JOURNAL_ENTRIES),
          where('userId', '==', user.uid),
          limit(75)
        );
        
        [moodSnapshot, journalSnapshot] = await Promise.all([
          getDocs(moodQuery),
          getDocs(journalQuery)
        ]);
      }
      
      let moodLogs = moodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      let journalEntries = journalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort by timestamp in JavaScript if we couldn't sort in Firestore
      moodLogs.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return bTime - aTime;
      });
      
      journalEntries.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return bTime - aTime;
      });
      
      console.log('Loaded mood data:', moodLogs.length, 'mood logs,', journalEntries.length, 'journal entries');
      set({ moodLogs, journalEntries });
      
    } catch (error) {
      console.error('Error loading mood data:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Provide empty arrays as fallback
      set({ moodLogs: [], journalEntries: [] });
      toast.error('Mood data loaded with limited data');
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
  wellnessHistory: [], // array of { date, waterIntake, calories, steps, sleepHours }
  
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
      
      // Check if entry for today already exists
      const existingQuery = query(
        collection(db, COLLECTIONS.WELLNESS_DATA),
        where('userId', '==', user.uid),
        where('date', '==', today),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        // Update existing entry
        const docId = existingSnapshot.docs[0].id;
        await updateDoc(doc(db, COLLECTIONS.WELLNESS_DATA, docId), wellnessData);
      } else {
        // Create new entry
        await addDoc(collection(db, COLLECTIONS.WELLNESS_DATA), wellnessData);
      }
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
      } else {
        // No data for today, keep current values or reset
        console.log('No wellness data found for today');
      }
    } catch (error) {
      console.error('Error loading wellness data:', error);
      toast.error('Failed to load wellness data');
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadWellnessHistory: async (days = 7) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    set({ isLoading: true });
    try {
      console.log('Loading wellness history for user:', user.uid, 'days:', days);
      
      // Try the optimized query first (requires index)
      let q = query(
        collection(db, COLLECTIONS.WELLNESS_DATA),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(days * 3) // fetch more then trim by last N unique days
      );
      
      let snapshot;
      try {
        snapshot = await getDocs(q);
      } catch (indexError) {
        console.warn('Composite index not available, falling back to simple query:', indexError.message);
        
        // Fallback to simple query without orderBy if index is missing
        q = query(
          collection(db, COLLECTIONS.WELLNESS_DATA),
          where('userId', '==', user.uid),
          limit(days * 5) // fetch more since we can't sort
        );
        snapshot = await getDocs(q);
      }
      
      const rows = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('Fetched wellness data:', rows.length, 'entries');
      
      // Sort by timestamp in JavaScript if we couldn't sort in Firestore
      rows.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return bTime - aTime;
      });
      
      // Group by date and take latest per day
      const byDate = new Map();
      for (const r of rows) {
        if (!byDate.has(r.date)) byDate.set(r.date, r);
      }
      
      // Build last N days array, including today
      const result = [];
      const today = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toDateString();
        const entry = byDate.get(key);
        
        // If it's today and no entry exists, use current store values
        if (i === 0 && !entry) {
          const { waterIntake, calories, steps, sleepHours } = get();
          result.push({
            date: key,
            waterIntake: waterIntake || 0,
            calories: calories || 0,
            steps: steps || 0,
            sleepHours: sleepHours || 0
          });
        } else {
          result.push({
            date: key,
            waterIntake: entry?.waterIntake || 0,
            calories: entry?.calories || 0,
            steps: entry?.steps || 0,
            sleepHours: entry?.sleepHours || 0
          });
        }
      }
      
      console.log('Processed wellness history:', result.length, 'days');
      set({ wellnessHistory: result });
      
    } catch (e) {
      console.error('Error loading wellness history:', e);
      console.error('Error code:', e.code);
      console.error('Error message:', e.message);
      
      // Provide a fallback empty history instead of failing completely
      const result = [];
      const today = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toDateString();
        
        // If it's today, use current store values
        if (i === 0) {
          const { waterIntake, calories, steps, sleepHours } = get();
          result.push({
            date: key,
            waterIntake: waterIntake || 0,
            calories: calories || 0,
            steps: steps || 0,
            sleepHours: sleepHours || 0
          });
        } else {
          result.push({
            date: key,
            waterIntake: 0,
            calories: 0,
            steps: 0,
            sleepHours: 0
          });
        }
      }
      
      set({ wellnessHistory: result });
      toast.error('Wellness history loaded with limited data');
    } finally {
      set({ isLoading: false });
    }
  },

  // Initialize wellness data for new users
  initializeWellnessData: async () => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      await get().loadWellnessData();
      await get().loadWellnessHistory(14);
    } catch (error) {
      console.error('Error initializing wellness data:', error);
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
  },

  loadStudySessionsHistory: async (days = 7) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    set({ isLoading: true });
    try {
      console.log('Loading study sessions history for user:', user.uid, 'days:', days);
      
      // Try the optimized query first (requires index)
      let q = query(
        collection(db, COLLECTIONS.STUDY_SESSIONS),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(days * 10)
      );
      
      let snapshot;
      try {
        snapshot = await getDocs(q);
      } catch (indexError) {
        console.warn('Study sessions index not available, falling back to simple query:', indexError.message);
        
        // Fallback to simple query without orderBy if index is missing
        q = query(
          collection(db, COLLECTIONS.STUDY_SESSIONS),
          where('userId', '==', user.uid),
          limit(days * 15) // fetch more since we can't sort
        );
        snapshot = await getDocs(q);
      }
      
      const rows = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('Fetched study sessions:', rows.length, 'entries');
      
      // Sort by timestamp in JavaScript if we couldn't sort in Firestore
      rows.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return bTime - aTime;
      });
      
      set({ studySessions: rows });
      
    } catch (e) {
      console.error('Error loading study sessions history:', e);
      console.error('Error code:', e.code);
      console.error('Error message:', e.message);
      
      // Provide empty array as fallback
      set({ studySessions: [] });
      toast.error('Study sessions loaded with limited data');
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

// Daily achievement checker
export const checkDailyAchievements = () => {
  const appStore = useAppStore.getState();
  const wellnessStore = useWellnessStore.getState();
  const moodStore = useMoodStore.getState();
  const taskStore = useTaskStore.getState();
  
  const today = new Date().toDateString();
  
  // Check if mood was logged today
  const moodLoggedToday = moodStore.moodLogs.some(log => {
    const logDate = new Date(log.timestamp?.toDate?.() || log.timestamp).toDateString();
    return logDate === today;
  });
  
  // Check water goal achievement
  const waterGoalMet = wellnessStore.waterIntake >= wellnessStore.dailyWaterGoal;
  
  // Check if study session happened today
  const studiedToday = taskStore.studySessions.some(session => {
    const sessionDate = new Date(session.timestamp?.toDate?.() || session.timestamp).toDateString();
    return sessionDate === today;
  });
  
  // Check if user hit step goal
  const stepGoalMet = wellnessStore.steps >= 10000;
  
  // Award bonus XP for daily completions
  let bonusXP = 0;
  let achievements = [];
  
  if (moodLoggedToday && waterGoalMet && studiedToday) {
    bonusXP += 25;
    achievements.push('Daily Triple Crown');
  }
  
  if (moodLoggedToday && waterGoalMet && studiedToday && stepGoalMet) {
    bonusXP += 50;
    achievements.push('Perfect Wellness Day');
  }
  
  if (bonusXP > 0) {
    appStore.addXP(bonusXP);
    appStore.addShinePoints(Math.floor(bonusXP / 10));
    
    // Show achievement notification
    if (achievements.length > 0) {
      toast.success(`🏆 ${achievements.join(', ')} achieved! +${bonusXP} XP`);
    }
  }
  
  return {
    moodLoggedToday,
    waterGoalMet,
    studiedToday,
    stepGoalMet,
    bonusXP,
    achievements
  };
}; 