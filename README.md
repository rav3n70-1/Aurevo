# Aurevo – Complete Life + Academic Companion App

Modern, comprehensive web application for mood tracking, wellness monitoring, academic excellence, and personal growth with multilingual AI-powered features.

## 🌟 Features Overview

### 🎯 **Mood & Emotional Tracking**
- **Advanced Mood Scale**: 5-point emoji-based mood tracking with intensity levels
- **Voice Journaling**: Record audio notes with your mood entries
- **Visual Mood Tree**: Watch your emotional wellness grow with a dynamic plant visualization
- **AI Whisper Messages**: Supportive, personalized encouragement throughout your journey
- **Encrypted Storage**: Secure journal storage in Firebase with privacy protection

### 💪 **Wellness & Body Metrics**
- **Gamified Water Tracker**: Beautiful plant growth animation based on hydration progress
- **Smart Calorie Tracker**: Quick food logging with common foods database and custom entries
- **Step Counter**: Activity tracking with manual input and achievement levels
- **Sleep Monitoring**: Comprehensive sleep logging with quality assessment and phase tracking
- **Goal-Based Progress**: Personalized targets with visual progress indicators

### 📚 **Academic Excellence Suite**
- **Enhanced Pomodoro Timer**: Multiple presets (25/50/30-min), break management, study session tracking
- **AI-Powered Flashcards**: Spaced repetition algorithm, difficulty adaptation, performance analytics
- **PDF Upload & Processing**: Upload documents for AI-generated flashcard creation (placeholder)
- **Study Session Analytics**: Track focus time, subjects, and productivity patterns
- **Syllabus Countdown Tool**: Exam preparation with chapter progress tracking (upcoming)

### 🏆 **Gamification & Engagement**
- **XP & Level System**: Earn experience points for healthy habits and academic progress
- **Streak Tracking**: Daily/weekly streaks for mood, water, study, and exercise
- **Shine Points**: Special reward currency for wellness and study achievements
- **Achievement System**: Unlock badges and rewards for consistent progress
- **Avatar Progression**: Visual representation of your growth journey

### 🤖 **AI Companion & Emotional Support**
- **Smart Check-ins**: Contextual questions about eating, headspace, and well-being
- **Motivational Messages**: Rotating collection of supportive quotes and encouragement
- **Adaptive Suggestions**: Personalized tips based on your usage patterns
- **Multilingual Support**: Native support for English, Bangla, Hindi, Spanish, French, Arabic

### 📊 **Analytics & Reports**
- **Comprehensive Dashboard**: Real-time overview of all your metrics
- **Trend Analysis**: Visual charts showing progress over time using Recharts
- **Performance Insights**: Identify patterns in your mood, health, and study habits
- **Exportable Reports**: Download PDF summaries of your progress (upcoming)

### 🌍 **Internationalization & Accessibility**
- **6 Languages**: English, Bangla (বাংলা), Hindi (हिंदी), Spanish, French, Arabic
- **Mixed Writing Support**: Banglish, Hinglish, and other hybrid languages
- **Dark/Light Themes**: Beautiful theme switching with smooth transitions
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Voice Input**: Multi-language voice recognition for accessibility

## 🛠 Tech Stack

### **Frontend**
- **React 18**: Functional components with hooks
- **Vite**: Lightning-fast development and builds
- **Tailwind CSS**: Utility-first styling with custom components
- **Framer Motion**: Smooth animations and micro-interactions
- **Lucide Icons**: Beautiful, consistent iconography

### **Backend & Services**
- **Firebase Authentication**: Google & GitHub OAuth
- **Firestore Database**: Real-time data synchronization
- **Firebase Storage**: Secure file and media storage
- **Google Drive API**: Document upload and synchronization
- **Google Photos API**: Image integration and storage

### **State Management & Utilities**
- **Zustand**: Lightweight, intuitive state management
- **React Router**: Client-side routing
- **React i18next**: Internationalization framework
- **date-fns**: Date manipulation and formatting
- **React Hot Toast**: Beautiful notification system

### **Development Tools**
- **TypeScript Support**: Type definitions for better development
- **Prettier**: Code formatting
- **PostCSS**: CSS processing with Tailwind
- **ESLint**: Code quality and consistency

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase project with Authentication and Firestore enabled
- Google OAuth credentials for Drive/Photos integration

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd aurevo-webapp
   npm install
   ```

2. **Environment Setup**
   The Firebase configuration is already included in the `.env` file. If you need to use your own Firebase project, create `.env.local` with your configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```
   
   **Note**: The current setup uses the demo Firebase project "aurevo-8c2db". For production, replace with your own Firebase project credentials.

3. **Firebase Configuration**
   - Enable Authentication providers: Google, GitHub
   - Create Firestore database in test mode
   - Set up Firebase Storage for file uploads

4. **Development Server**
   ```bash
   npm run dev
   ```

### Production Deployment

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── MoodTracker.jsx   # Advanced mood tracking with voice journal
│   ├── WaterTracker.jsx  # Gamified hydration with plant animation
│   ├── CalorieTracker.jsx # Smart calorie logging
│   ├── StepCounter.jsx   # Activity tracking
│   ├── SleepTracker.jsx  # Sleep monitoring
│   ├── Pomodoro.jsx      # Enhanced focus timer
│   ├── Flashcards.jsx    # AI-powered spaced repetition
│   ├── Navbar.jsx        # Navigation with user stats
│   └── Sidebar.jsx       # Enhanced navigation sidebar
├── routes/               # Page components
│   ├── Dashboard.jsx     # Main application dashboard
│   ├── Login.jsx         # Authentication with theme/language
│   └── Onboarding.jsx    # User setup flow
├── store/                # State management
│   └── index.js          # Zustand stores for all app data
├── i18n/                 # Internationalization
│   └── index.js          # Multi-language configuration
├── lib/                  # External integrations
│   └── firebase.js       # Firebase configuration and utilities
├── services/             # API integrations
│   ├── drive.js          # Google Drive integration
│   └── photos.js         # Google Photos integration
├── hooks_useAuth.js      # Authentication hook
├── App.jsx               # Main app component
├── main.jsx              # App entry point
└── styles.css            # Global styles and Tailwind imports
```

## 🔧 Firebase Configuration

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User-specific collections
    match /{collection}/{document} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🎨 Customization

### Adding New Languages
1. Add language configuration to `src/i18n/index.js`
2. Include language in the language selector components
3. Test with different language directions (RTL for Arabic)

### Extending Gamification
- Add new achievement types in the store
- Create custom XP reward formulas
- Implement new streak categories

### Custom Wellness Metrics
- Extend `useWellnessStore` with new trackers
- Create corresponding React components
- Add to the dashboard layout

## 🔮 Upcoming Features

### **Enhanced AI Integration**
- **GPT-powered Flashcard Generation**: Upload PDFs and get intelligent Q&A pairs
- **Smart Study Recommendations**: AI-suggested study schedules based on performance
- **Emotional Intelligence**: Advanced mood pattern recognition and suggestions

### **Advanced Analytics**
- **Predictive Insights**: Forecast mood and productivity patterns
- **Correlation Analysis**: Discover relationships between sleep, mood, and performance
- **Export Capabilities**: PDF reports with personalized insights

### **Social Features**
- **Anonymous Community**: Share achievements and get support
- **Study Groups**: Collaborative learning features
- **Mentorship Matching**: Connect with study partners

### **Integrations**
- **Wearable Devices**: Apple Health, Google Fit, Fitbit synchronization
- **Calendar Integration**: Automatic study session scheduling
- **LMS Connectivity**: Canvas, Moodle, and other learning management systems

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Code style and standards
- Component development patterns
- Internationalization best practices
- Firebase integration guidelines

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Firebase for robust backend infrastructure
- Tailwind CSS for beautiful, responsive design
- Framer Motion for smooth animations
- React community for excellent ecosystem
- All contributors and beta testers

---

**Aurevo** - Empowering your journey of growth, learning, and well-being. ✨

*Ready to transform your daily habits into lasting achievements? Start your Aurevo journey today!*