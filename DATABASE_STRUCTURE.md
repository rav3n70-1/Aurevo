# 🗄️ Aurevo Database Structure

## Firestore Collections Overview

The Aurevo application uses Firebase Firestore with the following collection structure:

### 📄 Core Collections

#### 1. **users** Collection
Main user profile and settings collection.

```javascript
{
  userId: "user-uid-here",
  createdAt: Timestamp,
  lastUpdated: Timestamp,
  settings: {
    language: "en" | "bn" | "hi" | "es" | "fr" | "ar",
    darkMode: boolean,
    notifications: boolean,
    emailNotifications: boolean,
    pushNotifications: boolean
  },
  gamification: {
    xp: number,
    level: number,
    shinePoints: number,
    streaks: {
      mood: number,
      water: number,
      study: number,
      exercise: number
    },
    unlockedAvatars: string[],
    currentAvatar: string,
    achievements: string[]
  },
  wellness: {
    dailyWaterGoal: number,
    dailyCalorieGoal: number,
    dailyStepGoal: number,
    dailySleepGoal: number
  },
  profile: {
    displayName: string,
    age?: number,
    activityLevel: "sedentary" | "moderate" | "active",
    goals: string[],
    studyGoals: string[]
  }
}
```

#### 2. **moodLogs** Collection
Tracks user mood entries and emotional states.

```javascript
{
  userId: string,
  mood: 1 | 2 | 3 | 4 | 5, // 1=terrible, 2=sad, 3=neutral, 4=good, 5=great
  intensity: 1 | 2 | 3 | 4 | 5,
  notes?: string,
  timestamp: Timestamp,
  tags: string[],
  weather?: string,
  location?: string,
  audioUrl?: string // For voice journals
}
```

#### 3. **journalEntries** Collection
Stores detailed journal entries and reflections.

```javascript
{
  userId: string,
  content: string,
  mood?: number,
  timestamp: Timestamp,
  isEncrypted: boolean,
  tags: string[],
  wordCount: number,
  readingTime: number, // estimated minutes
  attachments?: string[] // URLs to uploaded files
}
```

#### 4. **wellnessData** Collection
Tracks daily wellness metrics.

```javascript
{
  userId: string,
  date: string, // "YYYY-MM-DD"
  timestamp: Timestamp,
  waterIntake: number, // ml
  calories: number,
  steps: number,
  sleepHours: number,
  workouts: [{
    type: string,
    duration: number, // minutes
    intensity: "low" | "medium" | "high",
    caloriesBurned?: number
  }],
  meals: [{
    name: string,
    calories: number,
    time: Timestamp,
    category: "breakfast" | "lunch" | "dinner" | "snack"
  }]
}
```

#### 5. **tasks** Collection
Manages user tasks and to-do items.

```javascript
{
  userId: string,
  title: string,
  description?: string,
  category: "general" | "study" | "health" | "work" | "personal",
  priority: "low" | "medium" | "high" | "urgent",
  status: "pending" | "in_progress" | "completed" | "cancelled",
  dueDate?: Timestamp,
  completedAt?: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  recurring: boolean,
  recurringPattern?: {
    type: "daily" | "weekly" | "monthly",
    interval: number,
    endDate?: Timestamp
  },
  subtasks?: [{
    title: string,
    completed: boolean
  }],
  attachments?: string[],
  estimatedDuration?: number, // minutes
  actualDuration?: number // minutes
}
```

#### 6. **goals** Collection
Tracks long-term goals and objectives.

```javascript
{
  userId: string,
  title: string,
  description: string,
  category: "health" | "study" | "career" | "personal" | "fitness",
  targetDate: Timestamp,
  isCompleted: boolean,
  completedAt?: Timestamp,
  createdAt: Timestamp,
  progress: number, // 0-100 percentage
  milestones: [{
    title: string,
    description?: string,
    targetDate: Timestamp,
    isCompleted: boolean,
    completedAt?: Timestamp
  }],
  metrics: {
    startValue?: number,
    currentValue?: number,
    targetValue?: number,
    unit?: string
  }
}
```

#### 7. **studySessions** Collection
Records study sessions and academic activities.

```javascript
{
  userId: string,
  subject: string,
  duration: number, // minutes
  type: "pomodoro" | "study" | "review" | "practice" | "reading",
  technique: "pomodoro" | "time_blocking" | "active_recall" | "spaced_repetition",
  notes?: string,
  timestamp: Timestamp,
  productivity: 1 | 2 | 3 | 4 | 5, // self-assessed
  distractions: number, // count
  breaks: number, // count
  topicsStudied: string[],
  flashcardsReviewed?: number,
  questionsAnswered?: number,
  accuracy?: number, // percentage for practice sessions
  mood: {
    before: 1 | 2 | 3 | 4 | 5,
    after: 1 | 2 | 3 | 4 | 5
  }
}
```

#### 8. **flashcards** Collection
Stores flashcards for spaced repetition learning.

```javascript
{
  userId: string,
  question: string,
  answer: string,
  category: string,
  subject?: string,
  difficulty: "EASY" | "MEDIUM" | "HARD",
  tags: string[],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastReviewed?: Timestamp,
  nextReview?: Timestamp,
  correctCount: number,
  incorrectCount: number,
  interval: number, // days until next review
  easeFactor: number, // for spaced repetition algorithm
  isArchived: boolean,
  source?: string, // "manual" | "pdf_upload" | "ai_generated"
  sourceDocument?: string, // reference to original document
  media?: {
    images: string[],
    audio?: string,
    video?: string
  }
}
```

#### 9. **streakData** Collection
Tracks daily streaks for various activities.

```javascript
{
  userId: string,
  type: "mood" | "water" | "study" | "exercise" | "meditation" | "reading",
  currentStreak: number,
  longestStreak: number,
  lastCompletedDate: string, // "YYYY-MM-DD"
  totalDays: number,
  startDate: string, // "YYYY-MM-DD"
  history: [{
    date: string, // "YYYY-MM-DD"
    completed: boolean,
    value?: number // for quantifiable activities
  }],
  goal: {
    target: number, // daily target
    unit?: string
  }
}
```

#### 10. **notifications** Collection
Manages user notifications and reminders.

```javascript
{
  userId: string,
  title: string,
  message: string,
  type: "reminder" | "achievement" | "streak" | "goal" | "system",
  priority: "low" | "medium" | "high",
  isRead: boolean,
  createdAt: Timestamp,
  readAt?: Timestamp,
  scheduledFor?: Timestamp,
  actionUrl?: string,
  actionType?: "open_app" | "view_task" | "review_flashcards",
  metadata?: {
    taskId?: string,
    goalId?: string,
    streakType?: string,
    achievement?: string
  }
}
```

#### 11. **userProgress** Collection
Tracks user progress analytics and statistics.

```javascript
{
  userId: string,
  date: string, // "YYYY-MM-DD"
  timestamp: Timestamp,
  dailyStats: {
    moodLogged: boolean,
    waterGoalMet: boolean,
    stepGoalMet: boolean,
    sleepGoalMet: boolean,
    studyTimeMinutes: number,
    flashcardsReviewed: number,
    tasksCompleted: number,
    xpEarned: number,
    shinePointsEarned: number
  },
  weeklyStats: {
    averageMood: number,
    totalStudyTime: number,
    totalSteps: number,
    averageSleep: number,
    streaksActive: number,
    goalsCompleted: number
  },
  achievements: [{
    id: string,
    name: string,
    description: string,
    earnedAt: Timestamp,
    category: "mood" | "study" | "wellness" | "streak" | "milestone",
    xpReward: number,
    shinePointsReward: number
  }]
}
```

## 🔗 Collection Relationships

### Primary Relationships
- All collections are linked via `userId`
- Tasks can reference goals via `goalId`
- Study sessions can reference flashcards via `flashcardIds`
- Wellness data aggregates into user progress
- Notifications can reference any other collection item

### Secondary Relationships
- Mood logs contribute to streak data
- Study sessions affect user progress stats
- Completed tasks contribute to goal progress
- Achievement unlocks are tracked in user progress

## 📊 Query Patterns

### Common Queries
```javascript
// Get user's recent mood logs
db.collection('moodLogs')
  .where('userId', '==', userId)
  .orderBy('timestamp', 'desc')
  .limit(30)

// Get today's wellness data
db.collection('wellnessData')
  .where('userId', '==', userId)
  .where('date', '==', today)
  .limit(1)

// Get pending tasks
db.collection('tasks')
  .where('userId', '==', userId)
  .where('status', '==', 'pending')
  .orderBy('dueDate', 'asc')

// Get flashcards due for review
db.collection('flashcards')
  .where('userId', '==', userId)
  .where('nextReview', '<=', new Date())
  .where('isArchived', '==', false)
  .orderBy('nextReview', 'asc')
```

## 🔒 Security Rules Applied

- Users can only access their own data
- All operations require authentication
- Data validation on writes
- Read access restricted to document owner
- Create operations validate userId matches auth.uid

## 🚀 Performance Optimizations

### Indexed Fields
- All collections have composite indexes on `userId` + timestamp fields
- Specialized indexes for common query patterns
- TTL policies for temporary data (notifications, old wellness data)

### Data Limits
- Pagination implemented for large collections
- Historical data archiving after 1 year
- Automatic cleanup of completed tasks after 30 days
- Compressed storage for large text content

## 📈 Analytics & Reporting

### Generated Reports
- Weekly progress summaries
- Monthly achievement reports
- Streak performance analytics
- Study efficiency metrics
- Wellness trend analysis

### Data Export
- Users can export their data in JSON format
- Privacy-compliant data deletion
- Backup and restore functionality

---

This database structure supports all features of the Aurevo application while maintaining scalability, security, and performance. 