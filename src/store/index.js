import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, getDocs, limit, deleteDoc } from 'firebase/firestore';
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
            // Sync to Firebase after state update
            setTimeout(() => get().syncProfile(), 100);
            return { 
              xp: newXP, 
              level: newLevel, 
              shinePoints: state.shinePoints + (newLevel * 10)
            };
          }
          
          // Sync to Firebase after state update
          setTimeout(() => get().syncProfile(), 100);
          return { xp: newXP, level: newLevel };
        }),
        addShinePoints: (points) => set((state) => {
          setTimeout(() => get().syncProfile(), 100);
          return { shinePoints: state.shinePoints + points };
        }),
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
          notifications: state.notifications,
          // Include gamification data in local storage
          xp: state.xp,
          level: state.level,
          shinePoints: state.shinePoints,
          streaks: state.streaks,
          currentAvatar: state.currentAvatar
        })
      }
    )
  )
);

// Subscribe to XP changes and sync
useAppStore.subscribe(
  (state) => state.xp,
  () => {
    // Debounce sync to avoid too many writes
    clearTimeout(useAppStore.syncTimeout);
    useAppStore.syncTimeout = setTimeout(() => {
      useAppStore.getState().syncProfile();
    }, 1000);
  }
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
      // Enforce 1-hour cooldown between mood logs
      const now = new Date();
      let lastLogTs = null;
      const state = get();
      if (state.moodLogs && state.moodLogs.length > 0) {
        const mostRecent = state.moodLogs[0];
        lastLogTs = mostRecent.timestamp?.toDate?.() || new Date(mostRecent.timestamp);
      } else {
        // If local state empty, check Firestore for the latest entry
        let latestQuery = query(
          collection(db, COLLECTIONS.MOOD_LOGS),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        let latestSnap;
        try {
          latestSnap = await getDocs(latestQuery);
        } catch (indexError) {
          // Fallback without orderBy
          latestQuery = query(
            collection(db, COLLECTIONS.MOOD_LOGS),
            where('userId', '==', user.uid),
            limit(10)
          );
          latestSnap = await getDocs(latestQuery);
        }
        if (!latestSnap.empty) {
          // Find most recent manually if we couldn't sort in query
          let mostRecent = latestSnap.docs[0].data();
          latestSnap.docs.forEach(doc => {
            const data = doc.data();
            const ts = data.timestamp?.toDate?.() || new Date(data.timestamp);
            const currentTs = mostRecent.timestamp?.toDate?.() || new Date(mostRecent.timestamp);
            if (ts > currentTs) mostRecent = data;
          });
          lastLogTs = mostRecent.timestamp?.toDate?.() || new Date(mostRecent.timestamp);
        }
      }

      if (lastLogTs) {
        const diffMs = now - lastLogTs;
        const oneHourMs = 60 * 60 * 1000;
        if (diffMs < oneHourMs) {
          const minutesLeft = Math.ceil((oneHourMs - diffMs) / (60 * 1000));
          toast.error(`Please wait ${minutesLeft} more minute(s) before logging again.`);
          return;
        }
      }

      const moodLog = {
        userId: user.uid,
        mood: moodData.mood,
        intensity: moodData.intensity,
        notes: moodData.notes || '',
        timestamp: now,
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
      
      set({ moodLogs, journalEntries });
      
    } catch (error) {
      console.error('Error loading mood data:', error);
      
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
      let existingQuery = query(
        collection(db, COLLECTIONS.WELLNESS_DATA),
        where('userId', '==', user.uid),
        where('date', '==', today),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      
      let existingSnapshot;
      try {
        existingSnapshot = await getDocs(existingQuery);
      } catch (indexError) {
        // Fallback without orderBy
        existingQuery = query(
          collection(db, COLLECTIONS.WELLNESS_DATA),
          where('userId', '==', user.uid),
          where('date', '==', today),
          limit(1)
        );
        existingSnapshot = await getDocs(existingQuery);
      }
      
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
      let wellnessQuery = query(
        collection(db, COLLECTIONS.WELLNESS_DATA),
        where('userId', '==', user.uid),
        where('date', '==', today),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      
      let snapshot;
      try {
        snapshot = await getDocs(wellnessQuery);
      } catch (indexError) {
        // Fallback without orderBy
        wellnessQuery = query(
          collection(db, COLLECTIONS.WELLNESS_DATA),
          where('userId', '==', user.uid),
          where('date', '==', today),
          limit(1)
        );
        snapshot = await getDocs(wellnessQuery);
      }
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
        // Fallback to simple query without orderBy if index is missing
        q = query(
          collection(db, COLLECTIONS.WELLNESS_DATA),
          where('userId', '==', user.uid),
          limit(days * 5) // fetch more since we can't sort
        );
        snapshot = await getDocs(q);
      }
      
      const rows = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
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
      
      set({ wellnessHistory: result });
      
    } catch (e) {
      console.error('Error loading wellness history:', e);
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
      
      // Add notification for completed study session
      useNotificationStore.getState().addNotification({
        type: 'study',
        title: 'Study Session Complete',
        message: `Great job! You completed a ${sessionData.duration}-minute session on ${sessionData.subject}.`,
        xpGained: xpGained
      });
      
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
      // Try with orderBy first (requires index)
      let tasksQuery = query(
        collection(db, COLLECTIONS.TASKS),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      
      let snapshot;
      try {
        snapshot = await getDocs(tasksQuery);
              } catch (indexError) {
          // Fallback without orderBy
        tasksQuery = query(
          collection(db, COLLECTIONS.TASKS),
          where('userId', '==', user.uid),
          limit(100)
        );
        snapshot = await getDocs(tasksQuery);
      }
      
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in JS if we couldn't sort in Firestore
      tasks.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bTime - aTime;
      });
      
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
        // Fallback to simple query without orderBy if index is missing
        q = query(
          collection(db, COLLECTIONS.STUDY_SESSIONS),
          where('userId', '==', user.uid),
          limit(days * 15) // fetch more since we can't sort
        );
        snapshot = await getDocs(q);
      }
      
      const rows = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by timestamp in JavaScript if we couldn't sort in Firestore
      rows.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return bTime - aTime;
      });
      
      set({ studySessions: rows });
      
    } catch (e) {
      console.error('Error loading study sessions history:', e);
      // Provide empty array as fallback
      set({ studySessions: [] });
      toast.error('Study sessions loaded with limited data');
    } finally {
      set({ isLoading: false });
    }
  },

  // Goals
  addGoal: async (goalData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    try {
      const newGoal = {
        userId: user.uid,
        title: goalData.title,
        description: goalData.description || '',
        category: goalData.category || 'general',
        priority: goalData.priority || 'medium',
        progress: Math.max(0, Math.min(100, goalData.progress ?? 0)),
        deadline: goalData.deadline || null,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        completed: false,
        completedAt: null,
        subGoals: goalData.subGoals?.filter(sg => sg.trim()) || [],
        timeEstimate: goalData.timeEstimate || 30,
        streak: 0,
        lastProgressUpdate: new Date(),
        milestones: [],
        tags: goalData.tags || []
      };
      const docRef = await addDoc(collection(db, COLLECTIONS.GOALS), newGoal);
      set((state) => ({ goals: [{ id: docRef.id, ...newGoal }, ...state.goals] }));
      
      // Award XP for creating goal
      const xpReward = 15;
      useAppStore.getState().addXP(xpReward);
      toast.success(`Goal created successfully! +${xpReward} XP`);
      
      // Check for achievement (first goal, 5 goals, 10 goals)
      const { goals } = get();
      const totalGoals = goals.length;
      if (totalGoals === 1) {
        useAppStore.getState().addShinePoints(50);
        toast.success('🎉 First Goal Achievement! +50 Shine Points');
      } else if (totalGoals === 5) {
        useAppStore.getState().addShinePoints(100);
        toast.success('🏆 Goal Creator Achievement! +100 Shine Points');
      } else if (totalGoals === 10) {
        useAppStore.getState().addShinePoints(200);
        toast.success('🌟 Goal Master Achievement! +200 Shine Points');
      }
      
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to add goal');
    }
  },

  updateGoal: async (goalId, updates) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
        subGoals: updates.subGoals?.filter(sg => sg.trim()) || updates.subGoals
      };
      await updateDoc(doc(db, COLLECTIONS.GOALS, goalId), updateData);
      set((state) => ({
        goals: state.goals.map(goal =>
          goal.id === goalId ? { ...goal, ...updateData } : goal
        )
      }));
      toast.success('Goal updated successfully!');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  },

  deleteGoal: async (goalId) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.GOALS, goalId));
      set((state) => ({
        goals: state.goals.filter(goal => goal.id !== goalId)
      }));
      toast.success('Goal deleted successfully!');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  },

  toggleGoalComplete: async (goalId) => {
    const { goals } = get();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    try {
      const isCompleting = !goal.completed;
      const updateData = {
        completed: isCompleting,
        completedAt: isCompleting ? new Date() : null,
        progress: isCompleting ? 100 : goal.progress,
        updatedAt: new Date()
      };
      
      await updateDoc(doc(db, COLLECTIONS.GOALS, goalId), updateData);
      set((state) => ({
        goals: state.goals.map(g =>
          g.id === goalId ? { ...g, ...updateData } : g
        )
      }));
      
      if (isCompleting) {
        // Award XP based on priority and complexity
        const baseXP = goal.priority === 'high' ? 100 : goal.priority === 'medium' ? 50 : 25;
        const subGoalBonus = (goal.subGoals?.length || 0) * 5;
        const timeBonus = goal.timeEstimate > 60 ? 25 : goal.timeEstimate > 30 ? 15 : 5;
        const totalXP = baseXP + subGoalBonus + timeBonus;
        
        useAppStore.getState().addXP(totalXP);
        useAppStore.getState().addShinePoints(totalXP / 2);
        toast.success(`🎉 Goal completed! +${totalXP} XP, +${Math.floor(totalXP/2)} Shine Points`);
        
        // Check for completion streaks and achievements
        const completedGoals = goals.filter(g => g.completed).length + 1;
        if (completedGoals % 5 === 0) {
          const achievementXP = completedGoals * 10;
          useAppStore.getState().addXP(achievementXP);
          toast.success(`🏆 ${completedGoals} Goals Milestone! +${achievementXP} XP`);
        }
      } else {
        toast.success('Goal marked as incomplete');
      }
    } catch (error) {
      console.error('Error toggling goal completion:', error);
      toast.error('Failed to update goal');
    }
  },

  updateGoalProgress: async (goalId, progress) => {
    try {
      const progressValue = Math.max(0, Math.min(100, progress));
      const { goals } = get();
      const goal = goals.find(g => g.id === goalId);
      const oldProgress = goal?.progress || 0;
      
      const updateData = {
        progress: progressValue,
        updatedAt: new Date(),
        lastProgressUpdate: new Date(),
        // Auto-complete if progress reaches 100%
        ...(progressValue === 100 && {
          completed: true,
          completedAt: new Date()
        }),
        // Update milestones
        ...(progressValue >= 25 && oldProgress < 25 && {
          milestones: [...(goal?.milestones || []), { milestone: 25, achievedAt: new Date() }]
        }),
        ...(progressValue >= 50 && oldProgress < 50 && {
          milestones: [...(goal?.milestones || []), { milestone: 50, achievedAt: new Date() }]
        }),
        ...(progressValue >= 75 && oldProgress < 75 && {
          milestones: [...(goal?.milestones || []), { milestone: 75, achievedAt: new Date() }]
        })
      };
      
      await updateDoc(doc(db, COLLECTIONS.GOALS, goalId), updateData);
      set((state) => ({
        goals: state.goals.map(goal =>
          goal.id === goalId ? { ...goal, ...updateData } : goal
        )
      }));
      
      // XP rewards for milestones
      if (progressValue >= 25 && oldProgress < 25) {
        useAppStore.getState().addXP(10);
        toast.success('🎯 25% Milestone! +10 XP');
      }
      if (progressValue >= 50 && oldProgress < 50) {
        useAppStore.getState().addXP(20);
        toast.success('🎯 Halfway There! +20 XP');
      }
      if (progressValue >= 75 && oldProgress < 75) {
        useAppStore.getState().addXP(30);
        toast.success('🎯 Almost Done! +30 XP');
      }
      
      if (progressValue === 100 && oldProgress < 100) {
        // Full completion rewards handled in toggleGoalComplete
        const baseXP = goal?.priority === 'high' ? 100 : goal?.priority === 'medium' ? 50 : 25;
        const subGoalBonus = (goal?.subGoals?.length || 0) * 5;
        const timeBonus = (goal?.timeEstimate || 0) > 60 ? 25 : (goal?.timeEstimate || 0) > 30 ? 15 : 5;
        const totalXP = baseXP + subGoalBonus + timeBonus;
        
        useAppStore.getState().addXP(totalXP);
        useAppStore.getState().addShinePoints(Math.floor(totalXP / 2));
        toast.success(`🎉 Goal completed! +${totalXP} XP, +${Math.floor(totalXP/2)} Shine Points`);
      } else if (progressValue > oldProgress) {
        toast.success('Progress updated!');
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
      toast.error('Failed to update progress');
    }
  },

  // Get goal insights and analytics
  getGoalInsights: () => {
    const { goals } = get();
    const completed = goals.filter(g => g.completed);
    const active = goals.filter(g => !g.completed);
    
    const avgCompletionTime = completed.length > 0 
      ? completed.reduce((sum, g) => {
          if (!g.completedAt || !g.createdAt) return sum;
          const created = g.createdAt?.toDate?.() || new Date(g.createdAt);
          const completedDate = g.completedAt?.toDate?.() || new Date(g.completedAt);
          const days = Math.ceil((completedDate - created) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / completed.length
      : 0;

    const categoryStats = CATEGORIES.map(cat => ({
      category: cat.value,
      label: cat.label,
      icon: cat.icon,
      total: goals.filter(g => g.category === cat.value).length,
      completed: goals.filter(g => g.category === cat.value && g.completed).length,
      avgProgress: goals.filter(g => g.category === cat.value).reduce((sum, g) => sum + (g.progress || 0), 0) / Math.max(1, goals.filter(g => g.category === cat.value).length)
    })).filter(stat => stat.total > 0);

    return {
      totalGoals: goals.length,
      completionRate: goals.length > 0 ? (completed.length / goals.length * 100) : 0,
      avgCompletionTime: Math.round(avgCompletionTime),
      categoryStats,
      currentStreak: 0, // Can implement streak calculation
      longestStreak: 0, // Can implement streak calculation
      upcomingDeadlines: active.filter(g => g.deadline).sort((a, b) => {
        const aDate = new Date(a.deadline?.toDate?.() || a.deadline);
        const bDate = new Date(b.deadline?.toDate?.() || b.deadline);
        return aDate - bDate;
      }).slice(0, 5)
    };
  },

  loadGoals: async () => {
    const { user } = useAppStore.getState();
    if (!user) return;
    set({ isLoading: true });
    try {
      // Try with orderBy first (requires index)
      let goalsQuery = query(
        collection(db, COLLECTIONS.GOALS),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      
      let snapshot;
      try {
        snapshot = await getDocs(goalsQuery);
              } catch (indexError) {
          // Fallback without orderBy
        goalsQuery = query(
          collection(db, COLLECTIONS.GOALS),
          where('userId', '==', user.uid),
          limit(100)
        );
        snapshot = await getDocs(goalsQuery);
      }
      
      const goals = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort in JS if we couldn't sort in Firestore
      goals.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || a.timestamp?.toDate?.() || new Date(a.createdAt || a.timestamp);
        const bTime = b.createdAt?.toDate?.() || b.timestamp?.toDate?.() || new Date(b.createdAt || b.timestamp);
        return bTime - aTime;
      });
      
      set({ goals });
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load goals');
    } finally {
      set({ isLoading: false });
    }
  }
}));

// Notification management store with persistence
export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      
      // Initialize with sample notifications if none exist
      initializeNotifications: () => {
        const { notifications } = get();
        if (notifications.length === 0) {
          set({
            notifications: [
              {
                id: 1,
                type: 'achievement',
                title: 'Welcome to Aurevo!',
                message: 'Start your learning journey and unlock achievements as you progress.',
                timestamp: new Date(Date.now() - 300000), // 5 minutes ago
                read: false,
                actionable: true,
                action: 'Get Started'
              },
              {
                id: 2,
                type: 'system',
                title: 'Tip: Set Your Study Goals',
                message: 'Visit Settings to customize your daily study goals and preferences.',
                timestamp: new Date(Date.now() - 600000), // 10 minutes ago
                read: false,
                actionable: true,
                action: 'Open Settings'
              }
            ]
          });
        }
      },

  addNotification: (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    }
    set(state => ({
      notifications: [newNotification, ...state.notifications]
    }))
  },

  markAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    }))
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(notification => ({ ...notification, read: true }))
    }))
  },

  deleteNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(notification => notification.id !== id)
    }))
  },

  clearAllNotifications: () => {
    set({ notifications: [] })
  },

  getUnreadCount: () => {
    const { notifications } = get()
    return notifications.filter(n => !n.read).length
  }
}),
{
  name: 'notification-storage',
  partialize: (state) => ({ 
    notifications: (state.notifications || []).map(n => ({
      ...n,
      timestamp: n.timestamp instanceof Date ? n.timestamp.getTime() : n.timestamp
    }))
  }),
  onRehydrateStorage: () => {
    return (state, error) => {
      if (error) {
        // Silent fail on notification rehydration error
        return;
      }
      if (state?.notifications) {
        state.notifications = state.notifications.map(n => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    };
  }
}
));

// Auto-sync store data to Firebase (commented out - causing issues)
// TODO: Implement proper subscription when needed
// useAppStore.subscribe(
//   (state) => state.xp,
//   () => {
//     const store = useAppStore.getState();
//     if (store.user && store.userProfile) {
//       // Debounce the sync to avoid too many writes
//       setTimeout(() => {
//         store.syncProfile();
//       }, 2000);
//     }
//   }
// );

// Daily achievement checker (commented out - not currently used)
// export const checkDailyAchievements = () => {
//   const appStore = useAppStore.getState();
//   const wellnessStore = useWellnessStore.getState();
//   const moodStore = useMoodStore.getState();
//   const taskStore = useTaskStore.getState();
//   
//   const today = new Date().toDateString();
//   
//   // Check if mood was logged today
//   const moodLoggedToday = moodStore.moodLogs.some(log => {
//     const logDate = new Date(log.timestamp?.toDate?.() || log.timestamp).toDateString();
//     return logDate === today;
//   });
//   
//   // Check water goal achievement
//   const waterGoalMet = wellnessStore.waterIntake >= wellnessStore.dailyWaterGoal;
//   
//   // Check if study session happened today
//   const studiedToday = taskStore.studySessions.some(session => {
//     const sessionDate = new Date(session.timestamp?.toDate?.() || session.timestamp).toDateString();
//     return sessionDate === today;
//   });
//   
//   // Check if user hit step goal
//   const stepGoalMet = wellnessStore.steps >= 10000;
//   
//   // Award bonus XP for daily completions
//   let bonusXP = 0;
//   let achievements = [];
//   
//   if (moodLoggedToday && waterGoalMet && studiedToday) {
//     bonusXP += 25;
//     achievements.push('Daily Triple Crown');
//   }
//   
//   if (moodLoggedToday && waterGoalMet && studiedToday && stepGoalMet) {
//     bonusXP += 50;
//     achievements.push('Perfect Wellness Day');
//   }
//   
//   if (bonusXP > 0) {
//     appStore.addXP(bonusXP);
//     appStore.addShinePoints(Math.floor(bonusXP / 10));
//     
//     // Show achievement notification
//     if (achievements.length > 0) {
//       toast.success(`🏆 ${achievements.join(', ')} achieved! +${bonusXP} XP`);
//     }
//   }
// }; 