import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, getDocs, limit, deleteDoc, serverTimestamp, arrayUnion, arrayRemove, startAfter } from 'firebase/firestore';
import { db, COLLECTIONS, storage } from '../lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  savedViews: [],
  
  setLoading: (isLoading) => set({ isLoading }),
  
  // Saved views helpers
  saveView: async ({ name, query }) => {
    const view = { id: Date.now().toString(), name, query, createdAt: new Date() };
    set((state) => ({ savedViews: [view, ...state.savedViews] }));
    toast.success('View saved');
  },
  
  applyView: (viewId) => {
    const { savedViews } = get();
    const v = savedViews.find(x => x.id === viewId);
    return v || null;
  },
  
  filterGoalsByQuery: (query) => {
    const { goals } = get();
    if (!query) return goals;
    const terms = query.split(/\s+/).filter(Boolean);
    return goals.filter(g => {
      return terms.every(term => {
        const [k, v] = term.split(':');
        if (!v) {
          return (g.title||'').toLowerCase().includes(k.toLowerCase()) || (g.description||'').toLowerCase().includes(k.toLowerCase());
        }
        switch (k) {
          case 'tag': return (g.tags||[]).includes(v);
          case 'status': return (g.status || (g.completed ? 'completed' : 'not_started')) === v;
          case 'priority': return (g.priority||'').toLowerCase() === v.toLowerCase();
          default: return true;
        }
      });
    });
  },
  
  // Export helpers
  exportGoalsToCSV: () => {
    const { goals } = get();
    const headers = ['id','title','description','progress','status'];
    const rows = goals.map(g => [g.id, g.title, (g.description||'').replace(/\n/g,' '), g.progress||0, g.status|| (g.completed?'completed':'not_started')]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'goals.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
  
  exportGoalsToJSON: () => {
    const { goals } = get();
    const blob = new Blob([JSON.stringify(goals, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'goals.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
  
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
        // Roadmap fields
        status: goalData.status || 'not_started', // not_started | in_progress | blocked | completed
        blocked: false,
        blockedReason: '',
        startDate: goalData.startDate || null,
        endDate: goalData.endDate || null,
        estimatedDurationDays: goalData.estimatedDurationDays || 14,
        dependents: [],
        subGoals: goalData.subGoals?.filter(sg => sg.trim()) || [],
        timeEstimate: goalData.timeEstimate || 30,
        streak: 0,
        lastProgressUpdate: new Date(),
        milestones: [],
        tags: goalData.tags || [],
        dependencies: [], // New: for dependencies graph
        comments: [], // Collaboration stub
        attachments: [], // Files stub
        notes: goalData.notes || '',
        reminders: [],
        isTemplate: false,
        templateId: null
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

    // Derive categories from goals
    const categorySet = new Set(goals.map(g => g.category).filter(Boolean));
    const categoryStats = Array.from(categorySet).map(cat => {
      const inCat = goals.filter(g => g.category === cat);
      const total = inCat.length;
      const completedCount = inCat.filter(g => g.completed).length;
      const avgProgress = inCat.reduce((sum, g) => sum + (g.progress || 0), 0) / Math.max(1, total);
      return { category: cat, label: cat, total, completed: completedCount, avgProgress };
    }).filter(stat => stat.total > 0);

    // Velocity: completed goals last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000);
    const completedLast7 = completed.filter(g => (g.completedAt?.toDate?.() || new Date(g.completedAt)) >= sevenDaysAgo).length;
    // At-risk: active goals within 3 days of deadline and progress < 50
    const atRisk = active.filter(g => g.deadline && (new Date(g.deadline?.toDate?.() || g.deadline) - new Date()) < 3*24*60*60*1000 && (g.progress||0) < 50);

    return {
      totalGoals: goals.length,
      completionRate: goals.length > 0 ? (completed.length / goals.length * 100) : 0,
      avgCompletionTime: Math.round(avgCompletionTime),
      categoryStats,
      currentStreak: 0,
      longestStreak: 0,
      upcomingDeadlines: active.filter(g => g.deadline).sort((a, b) => {
        const aDate = new Date(a.deadline?.toDate?.() || a.deadline);
        const bDate = new Date(b.deadline?.toDate?.() || b.deadline);
        return aDate - bDate;
      }).slice(0, 5),
      velocity7d: completedLast7,
      atRisk: atRisk
    };
  },

  // Goal dependencies management
  updateDependencies: async (goalId, dependencyIds) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.GOALS, goalId), {
        dependencies: dependencyIds,
        updatedAt: new Date()
      });
      
      // Update dependent goals
      for (const depId of dependencyIds) {
        await updateDoc(doc(db, COLLECTIONS.GOALS, depId), {
          dependents: arrayUnion(goalId)
        });
      }
      
      set((state) => ({
        goals: state.goals.map(goal =>
          goal.id === goalId ? { ...goal, dependencies: dependencyIds } : goal
        )
      }));
      
      toast.success('Dependencies updated!');
    } catch (error) {
      console.error('Error updating dependencies:', error);
      toast.error('Failed to update dependencies');
    }
  },

  // Link and unlink goals (edges in dependency graph)
  linkGoals: async (goalId, dependsOnId) => {
    const { goals } = get();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const nextDeps = Array.from(new Set([...(goal.dependencies || []), dependsOnId]));
    await get().updateDependencies(goalId, nextDeps);
  },

  unlinkGoals: async (goalId, dependsOnId) => {
    const { goals } = get();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const nextDeps = (goal.dependencies || []).filter(id => id !== dependsOnId);
    await get().updateDependencies(goalId, nextDeps);
  },

  // Status and blocking helpers
  setGoalStatus: async (goalId, status) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.GOALS, goalId), {
        status,
        blocked: status === 'blocked',
        updatedAt: new Date()
      });
      set((state) => ({
        goals: state.goals.map(g => g.id === goalId ? { ...g, status, blocked: status === 'blocked' } : g)
      }));
      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  },

  blockGoal: async (goalId, reason = '') => {
    try {
      await updateDoc(doc(db, COLLECTIONS.GOALS, goalId), {
        status: 'blocked',
        blocked: true,
        blockedReason: reason,
        updatedAt: new Date()
      });
      set((state) => ({
        goals: state.goals.map(g => g.id === goalId ? { ...g, status: 'blocked', blocked: true, blockedReason: reason } : g)
      }));
      toast.success('Goal blocked');
    } catch (error) {
      console.error('Error blocking goal:', error);
      toast.error('Failed to block goal');
    }
  },

  unblockGoal: async (goalId) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.GOALS, goalId), {
        status: 'in_progress',
        blocked: false,
        blockedReason: '',
        updatedAt: new Date()
      });
      set((state) => ({
        goals: state.goals.map(g => g.id === goalId ? { ...g, status: 'in_progress', blocked: false, blockedReason: '' } : g)
      }));
      toast.success('Goal unblocked');
    } catch (error) {
      console.error('Error unblocking goal:', error);
      toast.error('Failed to unblock goal');
    }
  },

  // Roadmap data generator (for Gantt/timeline and graph views)
  getRoadmapData: () => {
    const { goals } = get();
    const nodes = goals.map(g => ({
      id: g.id,
      title: g.title,
      status: g.status || (g.completed ? 'completed' : 'not_started'),
      progress: g.progress || 0,
      startDate: g.startDate || g.createdAt,
      endDate: g.endDate || g.deadline,
      blocked: !!g.blocked
    }));
    const links = goals.flatMap(g => (g.dependencies || []).map(dep => ({ from: dep, to: g.id })));

    // Simple timeline items for Gantt-like rendering
    const timeline = nodes.map(n => {
      const start = n.startDate?.toDate?.() || (n.startDate ? new Date(n.startDate) : new Date());
      const end = n.endDate?.toDate?.() || (n.endDate ? new Date(n.endDate) : new Date(start.getTime() + (7 * 24 * 60 * 60 * 1000)));
      const durationDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      return { id: n.id, title: n.title, start, end, durationDays, progress: n.progress, status: n.status, blocked: n.blocked };
    });

    return { nodes, links, timeline };
  },

  // Check if goal can be started (all dependencies completed)
  canStartGoal: (goalId) => {
    const { goals } = get();
    const goal = goals.find(g => g.id === goalId);
    if (!goal || !goal.dependencies?.length) return true;
    
    return goal.dependencies.every(depId => {
      const depGoal = goals.find(g => g.id === depId);
      return depGoal?.completed;
    });
  },

  // Add tags to goal
  addTagsToGoal: async (goalId, tags) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.GOALS, goalId), {
        tags: arrayUnion(...tags),
        updatedAt: new Date()
      });
      
      set((state) => ({
        goals: state.goals.map(goal =>
          goal.id === goalId 
            ? { ...goal, tags: [...new Set([...(goal.tags || []), ...tags])] }
            : goal
        )
      }));
    } catch (error) {
      console.error('Error adding tags:', error);
    }
  },

  // Archive/unarchive goal
  archiveGoal: async (goalId, archive = true) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.GOALS, goalId), {
        isArchived: archive,
        archivedAt: archive ? new Date() : null,
        updatedAt: new Date()
      });
      
      set((state) => ({
        goals: state.goals.map(goal =>
          goal.id === goalId ? { ...goal, isArchived: archive } : goal
        )
      }));
      
      toast.success(`Goal ${archive ? 'archived' : 'unarchived'}!`);
    } catch (error) {
      console.error('Error archiving goal:', error);
      toast.error('Failed to archive goal');
    }
  },

  // Convert goal to habit
  convertToHabit: async (goalId) => {
    try {
      const { goals } = get();
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const habit = {
        title: goal.title,
        description: goal.description,
        category: goal.category,
        frequency: 'daily',
        targetValue: 1,
        unit: 'completion',
        color: '#8b5cf6',
        icon: '🔄'
      };
      
      await useHabitsStore.getState().addHabit(habit);
      toast.success('Goal converted to habit!');
    } catch (error) {
      console.error('Error converting to habit:', error);
      toast.error('Failed to convert to habit');
    }
  },

  // Create goal from template
  createFromTemplate: async (templateId) => {
    try {
      const template = useTemplatesStore.getState().templates.find(t => t.id === templateId);
      if (!template) return;

      // Create all goals from template
      for (const goalData of template.goals) {
        await get().addGoal({
          ...goalData,
          templateId: templateId,
          createdFromTemplate: true
        });
      }
      
      // Create associated habits if any
      for (const habitData of template.habits || []) {
        await useHabitsStore.getState().addHabit(habitData);
      }
      
      // Update template usage count
      await updateDoc(doc(db, COLLECTIONS.TEMPLATES, templateId), {
        usageCount: (template.usageCount || 0) + 1
      });
      
      toast.success('Goals created from template!');
    } catch (error) {
      console.error('Error creating from template:', error);
      toast.error('Failed to create from template');
    }
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

// Enhanced notification store for advanced features
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  reminders: [],
  isLoading: false,
  
  addNotification: (notification) => set((state) => ({
    notifications: [{
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      type: 'info',
      ...notification
    }, ...state.notifications],
    unreadCount: state.unreadCount + 1
  })),
  
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  
  // Added: compute unread count on demand to support existing components
  getUnreadCount: () => {
    const { notifications } = get();
    return notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0);
  },

  // Added: mark all notifications as read
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),

  // Added: delete a notification and adjust unread count
  deleteNotification: (id) => set((state) => {
    const notif = state.notifications.find(n => n.id === id);
    const nextList = state.notifications.filter(n => n.id !== id);
    const nextUnread = notif && !notif.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount;
    return { notifications: nextList, unreadCount: nextUnread };
  }),

  // Added: clear all notifications
  clearAllNotifications: () => set(() => ({
    notifications: [],
    unreadCount: 0
  })),

  // Smart reminders system
  createReminder: async (reminderData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const reminder = {
        userId: user.uid,
        goalId: reminderData.goalId,
        title: reminderData.title,
        message: reminderData.message,
        reminderType: reminderData.type || 'deadline',
        scheduledFor: reminderData.scheduledFor,
        priority: reminderData.priority || 'normal',
        quietHours: reminderData.quietHours || { start: '22:00', end: '07:00' },
        frequency: reminderData.frequency || 'once',
        isActive: true,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.REMINDERS), reminder);
      set((state) => ({
        reminders: [{ id: docRef.id, ...reminder }, ...state.reminders]
      }));
      
      toast.success('Reminder created!');
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error('Failed to create reminder');
    }
  },

  // Snooze a reminder notification by N minutes (local-only stub)
  snoozeNotification: (id, minutes = 30) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, snoozedUntil: new Date(Date.now() + minutes * 60000) } : n
    )
  })),

  // Update quiet hours for future reminders
  setQuietHours: (start = '22:00', end = '07:00') => set((state) => ({
    reminders: state.reminders.map(r => ({ ...r, quietHours: { start, end } }))
  })),
  
  initializeNotifications: () => {
    // Initialize notification system
    set({ notifications: [], unreadCount: 0 });
  }
}));

// Habits tracking store
export const useHabitsStore = create((set, get) => ({
  habits: [],
  habitLogs: [],
  streaks: {},
  isLoading: false,
  
  addHabit: async (habitData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const habit = {
        userId: user.uid,
        title: habitData.title,
        description: habitData.description || '',
        frequency: habitData.frequency || 'daily',
        category: habitData.category || 'general',
        targetValue: habitData.targetValue || 1,
        unit: habitData.unit || 'times',
        color: habitData.color || '#8b5cf6',
        icon: habitData.icon || '✅',
        // Recurring schedule fields
        schedule: habitData.schedule || { type: 'daily', daysOfWeek: [1,2,3,4,5,6,0], timeOfDay: '09:00' },
        quietHours: habitData.quietHours || { start: '22:00', end: '07:00' },
        nudgePolicy: habitData.nudgePolicy || { priority: 'normal', snoozeMinutes: 30 },
        isActive: true,
        createdAt: new Date(),
        streak: 0,
        longestStreak: 0,
        totalCompletions: 0
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.HABITS), habit);
      set((state) => ({ habits: [{ id: docRef.id, ...habit }, ...state.habits] }));
      
      useAppStore.getState().addXP(20);
      toast.success('Habit created! +20 XP');
    } catch (error) {
      console.error('Error adding habit:', error);
      toast.error('Failed to create habit');
    }
  },
  
  logHabit: async (habitId, value = 1) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const today = new Date().toDateString();
      const habitLog = {
        userId: user.uid,
        habitId,
        value,
        date: today,
        timestamp: new Date()
      };
      
      await addDoc(collection(db, COLLECTIONS.STREAK_DATA), habitLog);
      
      // Update habit streak
      const { habits } = get();
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        const newStreak = habit.streak + 1;
        const newLongestStreak = Math.max(habit.longestStreak || 0, newStreak);
        
        await updateDoc(doc(db, COLLECTIONS.HABITS, habitId), {
          streak: newStreak,
          longestStreak: newLongestStreak,
          totalCompletions: (habit.totalCompletions || 0) + 1,
          lastCompletedAt: new Date()
        });
        
        set((state) => ({
          habits: state.habits.map(h => 
            h.id === habitId 
              ? { ...h, streak: newStreak, longestStreak: newLongestStreak, totalCompletions: (h.totalCompletions || 0) + 1 }
              : h
          ),
          habitLogs: [habitLog, ...state.habitLogs]
        }));
        
        const xpReward = newStreak >= 7 ? 50 : newStreak >= 3 ? 25 : 10;
        useAppStore.getState().addXP(xpReward);
        toast.success(`Habit logged! ${newStreak} day streak! +${xpReward} XP`);
      }
    } catch (error) {
      console.error('Error logging habit:', error);
      toast.error('Failed to log habit');
    }
  },

  // Generate heatmap-ready data for past N days
  getHabitHeatmap: (habitId, days = 180) => {
    const { habitLogs } = get();
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    const byDate = new Map();
    for (const log of habitLogs.filter(l => l.habitId === habitId)) {
      const d = new Date(log.timestamp?.toDate?.() || log.timestamp);
      if (d >= start && d <= end) {
        const key = d.toISOString().slice(0,10);
        byDate.set(key, (byDate.get(key) || 0) + (log.value || 1));
      }
    }
    const results = [];
    for (let i = 0; i <= days; i++) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0,10);
      results.push({ date: key, count: byDate.get(key) || 0 });
    }
    return results;
  },

  // Determine next due date based on schedule
  getNextHabitOccurrence: (habitId, fromDate = new Date()) => {
    const { habits } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return null;
    const schedule = habit.schedule || { type: 'daily', daysOfWeek: [1,2,3,4,5,6,0], timeOfDay: '09:00' };
    const [hour, minute] = (schedule.timeOfDay || '09:00').split(':').map(Number);
    const start = new Date(fromDate);

    const isAllowedDay = (d) => schedule.daysOfWeek.includes(d.getDay());
    let candidate = new Date(start);
    candidate.setHours(hour, minute, 0, 0);
    if (candidate <= start || !isAllowedDay(candidate)) {
      // advance to next allowed day
      for (let i = 1; i <= 14; i++) {
        const next = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        next.setHours(hour, minute, 0, 0);
        if (isAllowedDay(next)) { candidate = next; break; }
      }
    }
    return candidate;
  },

  loadHabits: async () => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    set({ isLoading: true });
    try {
      const habitsQuery = query(
        collection(db, COLLECTIONS.HABITS),
        where('userId', '==', user.uid),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(habitsQuery);
      const habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ habits });
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));

// Focus sessions and Pomodoro store
export const useFocusStore = create((set, get) => ({
  focusSessions: [],
  currentSession: null,
  isActive: false,
  timeRemaining: 0,
  sessionType: 'focus', // focus, break, longBreak
  settings: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4
  },
  _timerId: null,
  
  _startTicker: () => {
    // Clear any existing ticker
    const state = get();
    if (state._timerId) {
      clearInterval(state._timerId);
    }
    const id = setInterval(() => {
      const { timeRemaining, isActive } = get();
      if (!isActive) return;
      if (timeRemaining <= 1) {
        clearInterval(get()._timerId);
        set({ _timerId: null });
        get().completeFocusSession();
      } else {
        set({ timeRemaining: timeRemaining - 1 });
      }
    }, 1000);
    set({ _timerId: id });
  },
  
  startFocusSession: async (goalId, duration = 25) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    const session = {
      id: Date.now(),
      userId: user.uid,
      goalId,
      duration: duration * 60, // Convert to seconds
      startTime: new Date(),
      status: 'active'
    };
    
    set({ 
      currentSession: session,
      isActive: true,
      timeRemaining: duration * 60,
      sessionType: 'focus'
    });
    get()._startTicker();
  },
  
  pauseSession: () => {
    const { _timerId, isActive } = get();
    if (_timerId) clearInterval(_timerId);
    set({ _timerId: null, isActive: false });
  },
  
  resumeSession: () => {
    const { currentSession, timeRemaining } = get();
    if (!currentSession || timeRemaining <= 0) return;
    set({ isActive: true });
    get()._startTicker();
  },
  
  stopSession: () => {
    const { _timerId } = get();
    if (_timerId) clearInterval(_timerId);
    set({ _timerId: null, currentSession: null, isActive: false, timeRemaining: 0 });
  },
  
  completeFocusSession: async () => {
    const { currentSession } = get();
    const { user } = useAppStore.getState();
    if (!currentSession || !user) return;
    
    try {
      const sessionData = {
        userId: user.uid,
        goalId: currentSession.goalId,
        duration: Math.floor((currentSession.duration - get().timeRemaining) / 60),
        startTime: currentSession.startTime,
        endTime: new Date(),
        type: 'focus',
        completed: true
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.FOCUS_SESSIONS), sessionData);
      
      // Update goal progress if linked
      if (currentSession.goalId) {
        const goals = useTaskStore.getState().goals;
        const goal = goals.find(g => g.id === currentSession.goalId);
        if (goal && goal.progress < 100) {
          const progressIncrease = Math.min(5, 100 - goal.progress);
          useTaskStore.getState().updateGoalProgress(currentSession.goalId, goal.progress + progressIncrease);
        }
      }
      
      set((state) => ({
        focusSessions: [{ id: docRef.id, ...sessionData }, ...state.focusSessions],
        currentSession: null,
        isActive: false,
        timeRemaining: 0,
        _timerId: state._timerId && (clearInterval(state._timerId), null)
      }));
      
      const xpReward = Math.floor(sessionData.duration / 5) * 5;
      useAppStore.getState().addXP(xpReward);
      toast.success(`Focus session complete! +${xpReward} XP`);
    } catch (error) {
      console.error('Error completing focus session:', error);
    }
  }
}));

// Templates marketplace store
export const useTemplatesStore = create((set, get) => ({
  templates: [],
  userTemplates: [],
  categories: ['productivity', 'health', 'learning', 'career', 'personal'],
  isLoading: false,
  
  createTemplate: async (templateData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const template = {
        userId: user.uid,
        title: templateData.title,
        description: templateData.description,
        category: templateData.category,
        goals: templateData.goals || [],
        habits: templateData.habits || [],
        isPublic: templateData.isPublic || false,
        tags: templateData.tags || [],
        createdAt: new Date(),
        usageCount: 0,
        rating: 0,
        reviews: []
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.TEMPLATES), template);
      set((state) => ({
        userTemplates: [{ id: docRef.id, ...template }, ...state.userTemplates]
      }));
      
      toast.success('Template created successfully!');
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  },
  
  loadPublicTemplates: async () => {
    try {
      const templatesQuery = query(
        collection(db, COLLECTIONS.TEMPLATES),
        where('isPublic', '==', true)
      );
      
      const snapshot = await getDocs(templatesQuery);
      const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ templates });
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }
}));

// OKRs (Objectives and Key Results) store
export const useOKRsStore = create((set, get) => ({
  objectives: [],
  keyResults: [],
  quarters: [],
  isLoading: false,
  
  createObjective: async (objectiveData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const objective = {
        userId: user.uid,
        title: objectiveData.title,
        description: objectiveData.description,
        quarter: objectiveData.quarter,
        year: objectiveData.year || new Date().getFullYear(),
        progress: 0,
        keyResultIds: [],
        createdAt: new Date(),
        isActive: true
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.OKRS), objective);
      set((state) => ({
        objectives: [{ id: docRef.id, ...objective }, ...state.objectives]
      }));
      
      useAppStore.getState().addXP(30);
      toast.success('Objective created! +30 XP');
    } catch (error) {
      console.error('Error creating objective:', error);
      toast.error('Failed to create objective');
    }
  },
  
  addKeyResult: async (objectiveId, keyResultData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const keyResult = {
        userId: user.uid,
        objectiveId,
        title: keyResultData.title,
        description: keyResultData.description,
        targetValue: keyResultData.targetValue,
        currentValue: keyResultData.currentValue || 0,
        unit: keyResultData.unit || 'points',
        progress: 0,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.OKRS), keyResult);
      
      // Update objective with new key result
      await updateDoc(doc(db, COLLECTIONS.OKRS, objectiveId), {
        keyResultIds: arrayUnion(docRef.id)
      });
      
      set((state) => ({
        keyResults: [{ id: docRef.id, ...keyResult }, ...state.keyResults],
        objectives: state.objectives.map(obj => 
          obj.id === objectiveId 
            ? { ...obj, keyResultIds: [...(obj.keyResultIds || []), docRef.id] }
            : obj
        )
      }));
      
      toast.success('Key Result added!');
    } catch (error) {
      console.error('Error adding key result:', error);
      toast.error('Failed to add key result');
    }
  }
}));

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

// Calendar integration store
export const useCalendarStore = create((set, get) => ({
  events: [],
  integrations: {
    google: false,
    outlook: false
  },
  
  syncWithCalendar: async (provider = 'google') => {
    // Calendar sync implementation would go here
    toast.success(`Calendar sync with ${provider} started`);
  },
  
  createCalendarEvent: async (goalId, eventData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const event = {
        userId: user.uid,
        goalId,
        title: eventData.title,
        description: eventData.description,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        isAllDay: eventData.isAllDay || false,
        recurrence: eventData.recurrence || null,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.CALENDAR_EVENTS), event);
      set((state) => ({
        events: [{ id: docRef.id, ...event }, ...state.events]
      }));
      
      toast.success('Calendar event created!');
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast.error('Failed to create event');
    }
  }
}));

// Collaboration store
export const useCollaborationStore = create((set, get) => ({
  comments: [],
  sharedGoals: [],
  collaborators: [],
  
  addComment: async (goalId, comment) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const commentData = {
        userId: user.uid,
        goalId,
        content: comment,
        timestamp: new Date(),
        mentions: comment.match(/@(\w+)/g) || []
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.GOAL_COMMENTS), commentData);
      set((state) => ({
        comments: [{ id: docRef.id, ...commentData }, ...state.comments]
      }));
      
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  },
  
  shareGoal: async (goalId, collaboratorEmail, permissions = 'view') => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const shareData = {
        goalId,
        ownerId: user.uid,
        collaboratorEmail,
        permissions, // view, edit, admin
        sharedAt: new Date(),
        isActive: true
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.SHARED_GOALS), shareData);
      set((state) => ({
        sharedGoals: [{ id: docRef.id, ...shareData }, ...state.sharedGoals]
      }));
      
      toast.success(`Goal shared with ${collaboratorEmail}!`);
    } catch (error) {
      console.error('Error sharing goal:', error);
      toast.error('Failed to share goal');
    }
  }
}));

// Attachments store
export const useAttachmentsStore = create((set, get) => ({
  attachments: [],
  uploadProgress: {},
  
  uploadAttachment: async (goalId, file) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      // Simulate file upload (would integrate with Firebase Storage)
      const attachment = {
        userId: user.uid,
        goalId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date(),
        url: URL.createObjectURL(file) // Temporary URL
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.GOAL_ATTACHMENTS), attachment);
      set((state) => ({
        attachments: [{ id: docRef.id, ...attachment }, ...state.attachments]
      }));
      
      toast.success('File attached successfully!');
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast.error('Failed to upload file');
    }
  }
}));

// Enhanced achievements store
export const useAchievementsStore = create((set, get) => ({
  achievements: [],
  badges: [],
  seasonalEvents: [],
  quests: [],
  
  unlockAchievement: async (achievementId, data) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const achievement = {
        userId: user.uid,
        achievementId,
        title: data.title,
        description: data.description,
        icon: data.icon,
        rarity: data.rarity || 'common',
        xpReward: data.xpReward || 0,
        shinePointsReward: data.shinePointsReward || 0,
        unlockedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.ACHIEVEMENTS), achievement);
      set((state) => ({
        achievements: [{ id: docRef.id, ...achievement }, ...state.achievements]
      }));
      
      if (achievement.xpReward) useAppStore.getState().addXP(achievement.xpReward);
      if (achievement.shinePointsReward) useAppStore.getState().addShinePoints(achievement.shinePointsReward);
      
      toast.success(`🏆 Achievement unlocked: ${achievement.title}!`);
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  }
}));

// Finance goals store
export const useFinanceStore = create((set, get) => ({
  financeGoals: [],
  transactions: [],
  budgets: [],
  
  createFinanceGoal: async (goalData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const financeGoal = {
        userId: user.uid,
        title: goalData.title,
        targetAmount: goalData.targetAmount,
        currentAmount: goalData.currentAmount || 0,
        currency: goalData.currency || 'USD',
        deadline: goalData.deadline,
        category: goalData.category, // saving, investment, debt, budget
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.GOALS), {
        ...financeGoal,
        type: 'finance',
        progress: goalData.currentAmount > 0 ? (goalData.currentAmount / goalData.targetAmount) * 100 : 0
      });
      
      set((state) => ({
        financeGoals: [{ id: docRef.id, ...financeGoal }, ...state.financeGoals]
      }));
      
      useAppStore.getState().addXP(25);
      toast.success('Finance goal created! +25 XP');
    } catch (error) {
      console.error('Error creating finance goal:', error);
      toast.error('Failed to create finance goal');
    }
  },
  
  updateFinanceProgress: async (goalId, amount) => {
    try {
      const { financeGoals } = get();
      const goal = financeGoals.find(g => g.id === goalId);
      if (!goal) return;
      
      const newAmount = goal.currentAmount + amount;
      const progress = Math.min(100, (newAmount / goal.targetAmount) * 100);
      
      await updateDoc(doc(db, COLLECTIONS.GOALS, goalId), {
        currentAmount: newAmount,
        progress,
        updatedAt: new Date()
      });
      
      set((state) => ({
        financeGoals: state.financeGoals.map(g =>
          g.id === goalId ? { ...g, currentAmount: newAmount, progress } : g
        )
      }));
      
      if (progress === 100) {
        useAppStore.getState().addXP(100);
        useAppStore.getState().addShinePoints(50);
        toast.success('🎉 Finance goal completed! +100 XP, +50 Shine Points');
      } else {
        toast.success('Progress updated!');
      }
    } catch (error) {
      console.error('Error updating finance progress:', error);
      toast.error('Failed to update progress');
    }
  }
}));

// Automation store
export const useAutomationStore = create((set, get) => ({
  rules: [],
  webhooks: [],
  
  createAutomationRule: async (ruleData) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    
    try {
      const rule = {
        userId: user.uid,
        name: ruleData.name,
        trigger: ruleData.trigger, // goal_completed, progress_milestone, deadline_approaching
        conditions: ruleData.conditions || [],
        actions: ruleData.actions || [], // send_notification, add_xp, create_task
        isActive: true,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.AUTOMATION_RULES), rule);
      set((state) => ({
        rules: [{ id: docRef.id, ...rule }, ...state.rules]
      }));
      
      toast.success('Automation rule created!');
    } catch (error) {
      console.error('Error creating automation rule:', error);
      toast.error('Failed to create automation rule');
    }
  }
}));

export const useSocialStore = create((set, get) => ({
  posts: [],
  comments: [],
  isLoading: false,
  pageSize: 10,
  lastDoc: null,
  hasMore: true,
  bookmarks: JSON.parse(localStorage.getItem('aurevo_post_bookmarks') || '[]'),

  saveBookmarks: (list) => {
    try { localStorage.setItem('aurevo_post_bookmarks', JSON.stringify(list)); } catch (e) {}
  },

  uploadMedia: async (file) => {
    const { user } = useAppStore.getState();
    if (!user || !file) return null;
    const path = `posts/${user.uid}/${Date.now()}_${file.name}`;
    const r = storageRef(storage, path);
    await uploadBytes(r, file);
    return await getDownloadURL(r);
  },

  createPost: async ({ content, mediaUrls = [], tags = [] }) => {
    const { user } = useAppStore.getState();
    if (!user || !content?.trim()) return;
    try {
      const post = {
        userId: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        avatar: user.photoURL || '',
        content: content.trim(),
        mediaUrls,
        tags,
        likes: [],
        pinned: false,
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, COLLECTIONS.POSTS), post);
      set((state) => ({ posts: [{ id: docRef.id, ...post }, ...state.posts ] }));
    } catch (e) {
      console.error('Error creating post:', e);
      toast.error('Failed to post');
    }
  },

  editPost: async (postId, updates) => {
    const p = get().posts.find(x => x.id === postId);
    if (!p) return;
    try {
      await updateDoc(doc(db, COLLECTIONS.POSTS, postId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      set((s) => ({ posts: s.posts.map(x => x.id === postId ? { ...x, ...updates } : x) }));
    } catch (e) { console.error('Error editing post:', e); }
  },

  togglePin: async (postId) => {
    const p = get().posts.find(x => x.id === postId);
    if (!p) return;
    try {
      await updateDoc(doc(db, COLLECTIONS.POSTS, postId), { pinned: !p.pinned });
      set((s) => ({ posts: s.posts.map(x => x.id === postId ? { ...x, pinned: !p.pinned } : x) }));
    } catch (e) { console.error('Error pinning post:', e); }
  },

  deletePost: async (postId) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.POSTS, postId));
      set((s) => ({ posts: s.posts.filter(x => x.id !== postId) }));
    } catch (e) { console.error('Error deleting post:', e); }
  },

  toggleLike: async (postId) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    const state = get();
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;
    const hasLiked = (post.likes || []).includes(user.uid);
    try {
      const newLikes = hasLiked 
        ? (post.likes || []).filter(id => id !== user.uid)
        : [ ...(post.likes || []), user.uid ];
      await updateDoc(doc(db, COLLECTIONS.POSTS, postId), { likes: newLikes });
      set((s) => ({ posts: s.posts.map(p => p.id === postId ? { ...p, likes: newLikes } : p) }));
    } catch (e) {
      console.error('Error toggling like:', e);
    }
  },

  toggleBookmark: (postId) => {
    const list = new Set(get().bookmarks);
    if (list.has(postId)) list.delete(postId); else list.add(postId);
    const next = Array.from(list);
    set({ bookmarks: next });
    get().saveBookmarks(next);
  },

  addCommentToPost: async (postId, content, parentId = null) => {
    const { user } = useAppStore.getState();
    if (!user || !content?.trim()) return;
    const post = get().posts.find(p => p.id === postId);
    const postOwnerId = post?.userId || null;
    try {
      const comment = {
        postId,
        postOwnerId,
        userId: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        avatar: user.photoURL || '',
        content: content.trim(),
        reactions: [],
        parentId,
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, COLLECTIONS.POST_COMMENTS), comment);
      set((state) => ({ comments: [{ id: docRef.id, ...comment }, ...state.comments] }));
    } catch (e) {
      console.error('Error adding comment:', e);
    }
  },

  toggleCommentReaction: async (commentId, reactionType) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    const c = get().comments.find(x => x.id === commentId);
    if (!c) return;
    const key = `${reactionType}:${user.uid}`;
    const existing = c.reactions || [];
    const has = existing.includes(key);
    try {
      const next = has ? existing.filter(x => x !== key) : [ ...existing, key ];
      await updateDoc(doc(db, COLLECTIONS.POST_COMMENTS, commentId), { reactions: next });
      set((s) => ({ comments: s.comments.map(x => x.id === commentId ? { ...x, reactions: next } : x) }));
    } catch (e) { console.error('Error reacting to comment:', e); }
  },

  editComment: async (commentId, content) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.POST_COMMENTS, commentId), { content, updatedAt: serverTimestamp() });
      set((s) => ({ comments: s.comments.map(x => x.id === commentId ? { ...x, content } : x) }));
    } catch (e) { console.error('Error editing comment:', e); }
  },

  deleteComment: async (commentId) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.POST_COMMENTS, commentId));
      set((s) => ({ comments: s.comments.filter(x => x.id !== commentId) }));
    } catch (e) { console.error('Error deleting comment:', e); }
  },

  // Helpers
  getTrendingTags: (limitCount = 10) => {
    const counts = new Map();
    get().posts.forEach(p => (p.tags||[]).forEach(t => counts.set(t, (counts.get(t)||0)+1)));
    return Array.from(counts.entries()).sort((a,b)=>b[1]-a[1]).slice(0, limitCount).map(([tag,count])=>({tag,count}));
  },

  filterAndSortPosts: ({ mine = false, liked = false, mediaOnly = false, search = '', sort = 'new' } = {}) => {
    const { posts } = get();
    const uid = useAppStore.getState().user?.uid;
    let list = [...posts];
    if (mine && uid) list = list.filter(p => p.userId === uid);
    if (liked && uid) list = list.filter(p => (p.likes||[]).includes(uid));
    if (mediaOnly) list = list.filter(p => (p.mediaUrls||[]).length > 0);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => (p.content||'').toLowerCase().includes(q) || (p.tags||[]).some(t => t.toLowerCase().includes(q)));
    }
    if (sort === 'top') list.sort((a,b)=> (b.likes?.length||0) - (a.likes?.length||0));
    else if (sort === 'pinned') list.sort((a,b)=> (b.pinned===true)-(a.pinned===true));
    else list.sort((a,b)=> (b.createdAt?.toDate?.()||new Date(b.createdAt)) - (a.createdAt?.toDate?.()||new Date(a.createdAt)));
    return list;
  },

  loadFeed: async (reset = false) => {
    const { user } = useAppStore.getState();
    if (!user) return;
    if (reset) set({ posts: [], lastDoc: null, hasMore: true });
    set({ isLoading: true });
    try {
      const baseQuery = query(
        collection(db, COLLECTIONS.POSTS),
        orderBy('createdAt', 'desc'),
        limit(get().pageSize)
      );
      const q = get().lastDoc ? query(baseQuery, startAfter(get().lastDoc)) : baseQuery;
      const snap = await getDocs(q);
      const newPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const lastDoc = snap.docs[snap.docs.length - 1] || null;
      // Load comments
      let newComments = [];
      try {
        const commentsSnap = await getDocs(query(collection(db, COLLECTIONS.POST_COMMENTS)));
        newComments = commentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {}
      set((state) => ({
        posts: reset ? newPosts : [...state.posts, ...newPosts],
        comments: reset ? newComments : state.comments,
        lastDoc,
        hasMore: !!lastDoc
      }));
    } catch (e) {
      console.error('Error loading feed:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  loadMore: async () => {
    const { hasMore, isLoading } = get();
    if (!hasMore || isLoading) return;
    await get().loadFeed(false);
  }
})); 