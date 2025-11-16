import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "fa" | "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  fa: {
    // Navigation
    home: "خانه",
    articles: "مقالات",
    products: "فروشگاه",
    services: "خدمات",
    chatbot: "چت‌بات",
    about: "درباره ما",
    contact: "تماس با ما",
    logout: "خروج",
    login: "ورود",
    
    // Profile
    profile: {
      title: "پروفایل کاربری",
      description: "اطلاعات حساب کاربری خود را مدیریت کنید",
      email: "ایمیل",
      emailNote: "ایمیل قابل تغییر نیست",
      displayName: "نام نمایشی",
      displayNamePlaceholder: "نام خود را وارد کنید",
      save: "ذخیره تغییرات",
      updateSuccess: "پروفایل با موفقیت به‌روز شد"
    },
    
    // Dashboard
    dashboard: {
      welcome: "خوش آمدید",
      subtitle: "نمای کلی فعالیت‌ها و آمار شما",
      savedArticles: "مقالات ذخیره شده",
      totalActivity: "کل فعالیت‌ها",
      memberSince: "عضویت از",
      recentlySaved: "اخیراً ذخیره شده",
      savedDesc: "مقالات ذخیره شده شما",
      noSaved: "هنوز مقاله‌ای ذخیره نکرده‌اید",
      recentActivity: "فعالیت‌های اخیر",
      activityDesc: "آخرین فعالیت‌های شما",
      noActivity: "هنوز فعالیتی ثبت نشده",
      viewedArticle: "مقاله را مشاهده کرد",
      savedArticle: "مقاله را ذخیره کرد"
    },
    
    // Auth
    auth: {
      title: "ورود به سیستم",
      subtitle: "به دنیای هوش مصنوعی خوش آمدید",
      signup: "ثبت‌نام",
      password: "رمز عبور",
      signupSuccess: "حساب شما ایجاد شد. لطفا وارد شوید.",
      forgotPassword: "رمز عبور را فراموش کرده‌اید",
      signingIn: "در حال ورود...",
      signingUp: "در حال ثبت‌نام...",
      orContinueWith: "یا ادامه با",
      resetSent: "ایمیل بازیابی رمز عبور ارسال شد",
      enterEmail: "ایمیل خود را وارد کنید",
      sending: "در حال ارسال...",
      sendReset: "ارسال لینک بازیابی",
      backToLogin: "بازگشت به ورود"
    },
    
    // Hero
    hero: {
      badge: "پلتفرم آموزش هوش مصنوعی",
      title: "یادگیری هوش مصنوعی",
      subtitle: "به سادگی و کاربردی",
      description: "در نئوهوش، شما با مفاهیم هوش مصنوعی آشنا می‌شوید و یاد می‌گیرید چگونه از ابزارهای AI در زندگی و کار خود استفاده کنید.",
      cta: "شروع یادگیری",
      newArticles: "مقالات جدید",
      smartAssistant: "دستیار هوشمند"
    },
    
    // Features
    features: {
      title: "چرا نئوهوش",
      subtitle: "ما با هدف آموزش و گسترش دانش هوش مصنوعی، محتوای با کیفیت و کاربردی را ارائه می‌دهیم",
      learning: "یادگیری آسان",
      learningDesc: "محتوای ساده و کاربردی برای همه سطوح",
      updated: "محتوای بروز",
      updatedDesc: "آخرین اخبار و پیشرفت‌های هوش مصنوعی",
      community: "جامعه فعال",
      communityDesc: "پشتیبانی و تبادل دانش با هم‌فکران"
    },
    
    // Latest Articles
    latestArticles: {
      title: "آخرین مقالات",
      readMore: "ادامه مطلب",
      loading: "در حال بارگذاری...",
      noArticles: "هنوز مقاله‌ای منتشر نشده است"
    },
    
    // Articles
    articles: {
      title: "مقالات نئوهوش",
      subtitle: "آخرین مقالات و آموزش‌های هوش مصنوعی"
    },
    
    // About
    about: {
      header: "درباره",
      headerBrand: "نئوهوش",
      headerDesc: "پلی به دنیای هوش مصنوعی",
      missionTitle: "ماموریت ما",
      missionDesc: "نئوهوش با هدف ساده‌سازی و دموکراتیزه‌کردن دانش هوش مصنوعی تاسیس شده است. ما بر این باوریم که هر فردی باید بتواند از قدرت فناوری‌های نوین بهره‌مند شود.",
      visionTitle: "چشم‌انداز ما",
      visionDesc: "تبدیل شدن به منبع اصلی و قابل اعتماد برای یادگیری و استفاده از هوش مصنوعی در ایران و منطقه.",
      teamTitle: "تیم ما",
      teamDesc: "تیم نئوهوش متشکل از متخصصان علاقه‌مند به هوش مصنوعی است که تلاش می‌کنند بهترین تجربه آموزشی را برای شما فراهم کنند.",
      founderName: "امیرحسین صابری",
      founderRole: "بنیانگذار و مدیر عامل",
      valueSimplicity: "سادگی",
      valueSimplicityDesc: "آموزش به زبان ساده و قابل فهم",
      valueInnovation: "نوآوری",
      valueInnovationDesc: "به‌روز ماندن با آخرین پیشرفت‌های هوش مصنوعی",
      valueQuality: "کیفیت",
      valueQualityDesc: "ارائه محتوای دقیق و معتبر"
    },
    
    // Services
    services: {
      title: "خدمات نئوهوش",
      subtitle: "طراحی و توسعه وب‌سایت و اپلیکیشن با قدرت هوش مصنوعی",
      mainService: "طراحی سایت و اپلیکیشن با هوش مصنوعی",
      description: "تیم نئوهوش با استفاده از جدیدترین ابزارها و فناوری‌های هوش مصنوعی، وب‌سایت و اپلیکیشن‌های مدرن و کاربردی را برای شما طراحی می‌کند. از ایده تا اجرا، ما در کنار شما هستیم.",
      modernDesign: "طراحی مدرن",
      modernDesignDesc: "طراحی UI/UX زیبا و کاربرپسند",
      fastDev: "توسعه سریع",
      fastDevDesc: "اجرای پروژه با سرعت بالا",
      qualityCode: "کد باکیفیت",
      qualityCodeDesc: "کدنویسی استاندارد و قابل نگهداری",
      requestCoop: "درخواست همکاری",
      portfolio: "نمونه کارهای ما",
      portfolioDesc: "به زودی نمونه کارهای ما را در این بخش مشاهده خواهید کرد",
      comingSoon: "به زودی..."
    },
    
    // Contact
    contact: {
      title: "تماس با ما",
      subtitle: "سوالات، پیشنهادات یا نظرات خود را با ما در میان بگذارید",
      formTitle: "ارسال پیام",
      name: "نام",
      namePlaceholder: "نام خود را وارد کنید",
      email: "ایمیل",
      message: "پیام",
      messagePlaceholder: "پیام خود را بنویسید...",
      send: "ارسال پیام",
      success: "پیام شما ارسال شد!",
      successDesc: "به زودی با شما تماس خواهیم گرفت",
      error: "خطا در ارسال پیام",
      contactInfo: "اطلاعات تماس",
      contactDesc: "از راه‌های زیر می‌توانید با ما در ارتباط باشید:",
      emailLabel: "ایمیل",
      emailValue: "support@neohoosh.com",
      instagramLabel: "اینستاگرام",
      instagramValue: "@neohoosh.ai",
      hoursLabel: "ساعات پاسخگویی",
      hoursValue: "شنبه تا پنجشنبه، ۹ صبح تا ۶ عصر"
    },
    
    // Chat
    chat: {
      pleaseLogin: "لطفا ابتدا وارد شوید",
      selectModel: "یک مدل انتخاب کنید",
      typeMessage: "پیام خود را بنویسید...",
      newConversation: "گفتگوی جدید",
      backToModels: "بازگشت به مدل‌ها"
    },

    // ChatBot
    chatbot: {
      title: "دستیار هوشمند",
      newChat: "گفتگوی جدید"
    }
  },
  en: {
    // Navigation
    home: "Home",
    articles: "Articles",
    products: "Shop",
    services: "Services",
    chatbot: "Chatbot",
    about: "About",
    contact: "Contact",
    logout: "Logout",
    login: "Login",
    
    // Profile
    profile: {
      title: "User Profile",
      description: "Manage your account information",
      email: "Email",
      emailNote: "Email cannot be changed",
      displayName: "Display Name",
      displayNamePlaceholder: "Enter your name",
      save: "Save Changes",
      updateSuccess: "Profile updated successfully"
    },
    
    // Dashboard
    dashboard: {
      welcome: "Welcome",
      subtitle: "Overview of your activities and statistics",
      savedArticles: "Saved Articles",
      totalActivity: "Total Activities",
      memberSince: "Member Since",
      recentlySaved: "Recently Saved",
      savedDesc: "Your saved articles",
      noSaved: "You haven't saved any articles yet",
      recentActivity: "Recent Activity",
      activityDesc: "Your latest activities",
      noActivity: "No activity recorded yet",
      viewedArticle: "Viewed article",
      savedArticle: "Saved article"
    },
    
    // Auth
    auth: {
      title: "Sign In",
      subtitle: "Welcome to the world of AI",
      signup: "Sign Up",
      password: "Password",
      signupSuccess: "Your account has been created. Please sign in.",
      forgotPassword: "Forgot Password",
      signingIn: "Signing in...",
      signingUp: "Signing up...",
      orContinueWith: "Or continue with",
      resetSent: "Password reset email sent",
      enterEmail: "Enter your email",
      sending: "Sending...",
      sendReset: "Send Reset Link",
      backToLogin: "Back to Login"
    },
    
    // Hero
    hero: {
      badge: "AI Learning Platform",
      title: "Learning AI",
      subtitle: "Simply and Practically",
      description: "At NeoHoosh, you'll learn about AI concepts and how to use AI tools in your life and work.",
      cta: "Start Learning",
      newArticles: "Latest Articles",
      smartAssistant: "Smart Assistant"
    },
    
    // Features
    features: {
      title: "Why NeoHoosh",
      subtitle: "We provide quality and practical content with the aim of teaching and expanding AI knowledge",
      learning: "Easy Learning",
      learningDesc: "Simple and practical content for all levels",
      updated: "Updated Content",
      updatedDesc: "Latest AI news and advances",
      community: "Active Community",
      communityDesc: "Support and knowledge exchange with like-minded people"
    },
    
    // Latest Articles
    latestArticles: {
      title: "Latest Articles",
      readMore: "Read More",
      loading: "Loading...",
      noArticles: "No articles published yet"
    },
    
    // CTA
    cta: {
      title: "Ready to start your learning journey",
      description: "Join the NeoHoosh community and discover the world of AI",
      button: "View All Articles"
    },
    
    // Articles
    articles: {
      title: "NeoHoosh Articles",
      subtitle: "Latest AI articles and tutorials"
    },
    
    // About
    about: {
      header: "About",
      headerBrand: "NeoHoosh",
      headerDesc: "A Bridge to the World of AI",
      missionTitle: "Our Mission",
      missionDesc: "NeoHoosh was founded with the goal of simplifying and democratizing AI knowledge. We believe everyone should be able to benefit from the power of modern technologies.",
      visionTitle: "Our Vision",
      visionDesc: "To become the main and trusted source for learning and using AI in Iran and the region.",
      teamTitle: "Our Team",
      teamDesc: "The NeoHoosh team consists of AI enthusiasts who strive to provide you with the best educational experience.",
      founderName: "Amirhossein Saberi",
      founderRole: "Founder & CEO",
      valueSimplicity: "Simplicity",
      valueSimplicityDesc: "Teaching in simple and understandable language",
      valueInnovation: "Innovation",
      valueInnovationDesc: "Staying up-to-date with the latest AI advances",
      valueQuality: "Quality",
      valueQualityDesc: "Providing accurate and reliable content"
    },
    
    // Footer
    footer: {
      brand: "NeoHoosh",
      tagline: "AI world for everyone",
      quickLinks: "Quick Links",
      homepage: "Homepage",
      learnMore: "Learn More",
      social: "Social Media",
      copyright: "All rights reserved"
    },
    
    // Services
    services: {
      title: "NeoHoosh Services",
      subtitle: "Website and app design and development powered by AI",
      mainService: "AI-Powered Website and App Design",
      description: "The NeoHoosh team uses the latest AI tools and technologies to design modern and functional websites and apps for you. From idea to implementation, we're with you.",
      modernDesign: "Modern Design",
      modernDesignDesc: "Beautiful and user-friendly UI/UX design",
      fastDev: "Fast Development",
      fastDevDesc: "Project execution with high speed",
      qualityCode: "Quality Code",
      qualityCodeDesc: "Standard and maintainable coding",
      requestCoop: "Request Cooperation",
      portfolio: "Our Portfolio",
      portfolioDesc: "You'll soon see our portfolio in this section",
      comingSoon: "Coming Soon..."
    },
    
    // Contact
    contact: {
      title: "Contact Us",
      subtitle: "Share your questions, suggestions, or feedback with us",
      formTitle: "Send Message",
      name: "Name",
      namePlaceholder: "Enter your name",
      email: "Email",
      message: "Message",
      messagePlaceholder: "Write your message...",
      send: "Send Message",
      success: "Your message has been sent!",
      successDesc: "We will contact you soon",
      error: "Error sending message",
      contactInfo: "Contact Information",
      contactDesc: "You can contact us through the following ways:",
      emailLabel: "Email",
      emailValue: "support@neohoosh.com",
      instagramLabel: "Instagram",
      instagramValue: "@neohoosh.ai",
      hoursLabel: "Support Hours",
      hoursValue: "Saturday to Thursday, 9 AM to 6 PM"
    },
    
    // Chat
    chat: {
      pleaseLogin: "Please login first",
      selectModel: "Select a model",
      typeMessage: "Type your message...",
      newConversation: "New Conversation",
      backToModels: "Back to Models"
    },

    // ChatBot
    chatbot: {
      title: "Smart Assistant",
      newChat: "New Chat"
    }
  }
} as const;

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "fa";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.dir = language === "ar" || language === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};