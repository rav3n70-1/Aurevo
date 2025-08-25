import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      submit: 'Submit',
      close: 'Close',
      
      // Navigation
      dashboard: 'Dashboard',
      mood: 'Mood',
      wellness: 'Wellness',
      study: 'Study Suite',
      goals: 'Goals',
      reports: 'Reports',
      settings: 'Settings',
      
      // Authentication
      login: 'Sign In',
      logout: 'Sign Out',
      loginWithGoogle: 'Continue with Google',
      loginWithGithub: 'Continue with GitHub',
      welcomeBack: 'Welcome back!',
      
      // Mood Tracking
      moodTitle: 'Mood & Emotional Tracking',
      howAreYouFeeling: 'How are you feeling today?',
      moodIntensity: 'Intensity',
      addNotes: 'Add notes...',
      logMood: 'Log Mood',
      journalEntry: 'Journal Entry',
      voiceJournal: 'Voice Journal',
      
      // Wellness
      hydrationTracker: 'Hydration Tracker',
      calorieTracker: 'Calorie Tracker',
      stepCounter: 'Step Counter',
      sleepTracker: 'Sleep Tracker',
      waterGoal: 'Daily Water Goal',
      addWater: 'Add Water',
      
      // Study
      studySession: 'Study Session',
      flashcards: 'Flashcards',
      pomodoro: 'Pomodoro Timer',
      syllabus: 'Syllabus Tracker',
      uploadPDF: 'Upload PDF',
      generateFlashcards: 'Generate Flashcards',
      
      // Gamification
      level: 'Level',
      xpPoints: 'XP Points',
      shinePoints: 'Shine Points',
      streak: 'Streak',
      achievements: 'Achievements',
      avatar: 'Avatar',
      
      // Messages
      moodLogged: 'Mood logged successfully!',
      goalCompleted: 'Congratulations! Goal completed!',
      streakMaintained: 'Great job maintaining your streak!',
      levelUp: 'Level up! You reached level {{level}}!',
      
      // Emotional Support
      emotionalSupport: {
        growth: "You're not behind. You're growing.",
        progress: "Every step forward counts.",
        strength: "You're stronger than you think.",
        journey: "Your journey is unique and valuable.",
        rest: "It's okay to rest when you need to."
      }
    }
  },
  
  bn: {
    translation: {
      // Common
      loading: 'লোড হচ্ছে...',
      save: 'সংরক্ষণ',
      cancel: 'বাতিল',
      delete: 'মুছুন',
      edit: 'সম্পাদনা',
      submit: 'জমা দিন',
      close: 'বন্ধ',
      
      // Navigation
      dashboard: 'ড্যাশবোর্ড',
      mood: 'মুড',
      wellness: 'সুস্থতা',
      study: 'অধ্যয়ন স্যুট',
      goals: 'লক্ষ্য',
      reports: 'রিপোর্ট',
      settings: 'সেটিংস',
      
      // Authentication
      login: 'সাইন ইন',
      logout: 'সাইন আউট',
      loginWithGoogle: 'গুগল দিয়ে চালিয়ে যান',
      loginWithGithub: 'গিটহাব দিয়ে চালিয়ে যান',
      welcomeBack: 'স্বাগতম!',
      
      // Mood Tracking
      moodTitle: 'মুড ও আবেগময় ট্র্যাকিং',
      howAreYouFeeling: 'আজ আপনার কেমন লাগছে?',
      moodIntensity: 'তীব্রতা',
      addNotes: 'নোট যোগ করুন...',
      logMood: 'মুড লগ করুন',
      journalEntry: 'জার্নাল এন্ট্রি',
      voiceJournal: 'ভয়েস জার্নাল',
      
      // Wellness
      hydrationTracker: 'হাইড্রেশন ট্র্যাকার',
      calorieTracker: 'ক্যালোরি ট্র্যাকার',
      stepCounter: 'স্টেপ কাউন্টার',
      sleepTracker: 'ঘুম ট্র্যাকার',
      waterGoal: 'দৈনিক পানির লক্ষ্য',
      addWater: 'পানি যোগ করুন',
      
      // Emotional Support
      emotionalSupport: {
        growth: "আপনি পিছিয়ে নেই। আপনি বেড়ে উঠছেন।",
        progress: "প্রতিটি এগিয়ে যাওয়া গুরুত্বপূর্ণ।",
        strength: "আপনি যতটা মনে করেন তার চেয়ে শক্তিশালী।",
        journey: "আপনার যাত্রা অনন্য এবং মূল্যবান।",
        rest: "প্রয়োজনে বিশ্রাম নেওয়া ঠিক আছে।"
      }
    }
  },
  
  hi: {
    translation: {
      // Common
      loading: 'लोड हो रहा है...',
      save: 'सेव करें',
      cancel: 'रद्द करें',
      delete: 'डिलीट करें',
      edit: 'एडिट करें',
      submit: 'सबमिट करें',
      close: 'बंद करें',
      
      // Navigation
      dashboard: 'डैशबोर्ड',
      mood: 'मूड',
      wellness: 'वेलनेस',
      study: 'स्टडी स्यूट',
      goals: 'लक्ष्य',
      reports: 'रिपोर्ट',
      settings: 'सेटिंग्स',
      
      // Emotional Support
      emotionalSupport: {
        growth: "आप पीछे नहीं हैं। आप बढ़ रहे हैं।",
        progress: "हर कदम आगे बढ़ना मायने रखता है।",
        strength: "आप अपने विचार से ज्यादा मजबूत हैं।",
        journey: "आपकी यात्रा अनूठी और मूल्यवान है।",
        rest: "जरूरत पड़ने पर आराम करना ठीक है।"
      }
    }
  },
  
  es: {
    translation: {
      // Common
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      submit: 'Enviar',
      close: 'Cerrar',
      
      // Navigation
      dashboard: 'Panel',
      mood: 'Estado de Ánimo',
      wellness: 'Bienestar',
      study: 'Suite de Estudio',
      goals: 'Objetivos',
      reports: 'Informes',
      settings: 'Configuración',
      
      // Emotional Support
      emotionalSupport: {
        growth: "No estás atrasado. Estás creciendo.",
        progress: "Cada paso hacia adelante cuenta.",
        strength: "Eres más fuerte de lo que piensas.",
        journey: "Tu viaje es único y valioso.",
        rest: "Está bien descansar cuando lo necesites."
      }
    }
  },
  
  fr: {
    translation: {
      // Common
      loading: 'Chargement...',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      submit: 'Soumettre',
      close: 'Fermer',
      
      // Navigation
      dashboard: 'Tableau de bord',
      mood: 'Humeur',
      wellness: 'Bien-être',
      study: 'Suite d\'étude',
      goals: 'Objectifs',
      reports: 'Rapports',
      settings: 'Paramètres',
      
      // Emotional Support
      emotionalSupport: {
        growth: "Tu n'es pas en retard. Tu grandis.",
        progress: "Chaque pas en avant compte.",
        strength: "Tu es plus fort que tu ne le penses.",
        journey: "Ton voyage est unique et précieux.",
        rest: "C'est normal de se reposer quand tu en as besoin."
      }
    }
  },
  
  ar: {
    translation: {
      // Common
      loading: 'جاري التحميل...',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      submit: 'إرسال',
      close: 'إغلاق',
      
      // Navigation
      dashboard: 'لوحة القيادة',
      mood: 'المزاج',
      wellness: 'العافية',
      study: 'مجموعة الدراسة',
      goals: 'الأهداف',
      reports: 'التقارير',
      settings: 'الإعدادات',
      
      // Emotional Support
      emotionalSupport: {
        growth: "أنت لست متأخرًا. أنت تنمو.",
        progress: "كل خطوة إلى الأمام مهمة.",
        strength: "أنت أقوى مما تعتقد.",
        journey: "رحلتك فريدة وقيمة.",
        rest: "لا بأس بالراحة عندما تحتاج إليها."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 