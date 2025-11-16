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
    home: "خانه",
    articles: "مقالات",
    products: "فروشگاه",
    services: "خدمات",
    chatbot: "چت‌بات",
    about: "درباره ما",
    contact: "تماس با ما",
    logout: "خروج",
    login: "ورود",
    
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
    
    hero: {
      badge: "پلتفرم آموزش هوش مصنوعی",
      title: "یادگیری هوش مصنوعی",
      subtitle: "به سادگی و کاربردی",
      description: "در نئوهوش، شما با مفاهیم هوش مصنوعی آشنا می‌شوید و یاد می‌گیرید چگونه از ابزارهای AI در زندگی و کار خود استفاده کنید.",
      cta: "شروع یادگیری",
      newArticles: "مقالات جدید",
      smartAssistant: "دستیار هوشمند"
    },
    
    features: {
      title: "چرا نئوهوش؟",
      subtitle: "آموزش ساده، به‌روز و همراه با جامعه کاربری",
      learning: "یادگیری ساده",
      learningDesc: "مفاهیم پیچیده را با مثال‌های کاربردی و قابل فهم یاد بگیرید.",
      updated: "به‌روز و عملی",
      updatedDesc: "همیشه با جدیدترین ابزارها و تکنیک‌های هوش مصنوعی همراه باشید.",
      community: "جامعه فعال",
      communityDesc: "با افراد علاقه‌مند به AI گفتگو کنید و تجربه‌ها را به اشتراک بگذارید."
    },

    latestArticles: {
      title: "آخرین مقالات",
      subtitle: "منتخب جدیدترین مطالب آموزشی و کاربردی"
    },

    contactPage: {
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
    
    aboutPage: {
      header: "درباره",
      headerBrand: "نئوهوش",
      headerDesc: "پلی به دنیای هوش مصنوعی",
      missionTitle: "ماموریت ما",
      missionDesc: "نئوهوش با هدف ساده‌سازی و دموکراتیزه‌کردن دانش هوش مصنوعی تاسیس شده است.",
      visionTitle: "چشم‌انداز ما",
      visionDesc: "تبدیل شدن به منبع اصلی و قابل اعتماد برای یادگیری و استفاده از هوش مصنوعی در ایران و منطقه.",
      teamTitle: "تیم ما",
      teamDesc: "تیم نئوهوش متشکل از متخصصان علاقه‌مند به هوش مصنوعی است.",
      founderName: "امیرحسین صابری",
      founderRole: "بنیانگذار و مدیر عامل",
      valueSimplicity: "سادگی",
      valueSimplicityDesc: "آموزش به زبان ساده و قابل فهم",
      valueInnovation: "نوآوری",
      valueInnovationDesc: "به‌روز ماندن با آخرین پیشرفت‌های هوش مصنوعی",
      valueQuality: "کیفیت",
      valueQualityDesc: "ارائه محتوای دقیق و معتبر"
    },
    
    footer: {
      brand: "نئوهوش",
      tagline: "پلی به دنیای هوش مصنوعی",
      quickLinks: "لینک‌های سریع",
      homepage: "صفحه اصلی",
      learnMore: "بیشتر بدانید",
      social: "شبکه‌های اجتماعی",
      copyright: "تمام حقوق محفوظ است"
    },
    
    chat: {
      pleaseLogin: "لطفا ابتدا وارد شوید",
      selectModel: "یک مدل انتخاب کنید",
      typeMessage: "پیام خود را بنویسید...",
      newConversation: "گفتگوی جدید",
      backToModels: "بازگشت به مدل‌ها"
    }
  },
  en: {
    home: "Home",
    articles: "Articles",
    products: "Shop",
    services: "Services",
    chatbot: "Chatbot",
    about: "About",
    contact: "Contact",
    logout: "Logout",
    login: "Login",
    
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
    
    hero: {
      badge: "AI Learning Platform",
      title: "Learning AI",
      subtitle: "Simply and Practically",
      description: "At NeoHoosh, you'll learn about AI concepts and how to use AI tools in your life and work.",
      cta: "Start Learning",
      newArticles: "Latest Articles",
      smartAssistant: "Smart Assistant"
    },

    features: {
      title: "Why NeoHoosh?",
      subtitle: "Simple, up-to-date learning with community",
      learning: "Simple Learning",
      learningDesc: "Learn complex concepts through clear, practical examples.",
      updated: "Up-to-date & Practical",
      updatedDesc: "Stay current with the latest AI tools and techniques.",
      community: "Active Community",
      communityDesc: "Discuss and share experiences with AI enthusiasts."
    },

    latestArticles: {
      title: "Latest Articles",
      subtitle: "Handpicked fresh educational content"
    },

    contactPage: {
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
    
    aboutPage: {
      header: "About",
      headerBrand: "NeoHoosh",
      headerDesc: "A Bridge to the World of AI",
      missionTitle: "Our Mission",
      missionDesc: "NeoHoosh was founded with the goal of simplifying and democratizing AI knowledge.",
      visionTitle: "Our Vision",
      visionDesc: "To become the main and trusted source for learning and using AI in Iran and the region.",
      teamTitle: "Our Team",
      teamDesc: "The NeoHoosh team consists of AI enthusiasts.",
      founderName: "Amirhossein Saberi",
      founderRole: "Founder & CEO",
      valueSimplicity: "Simplicity",
      valueSimplicityDesc: "Teaching in simple and understandable language",
      valueInnovation: "Innovation",
      valueInnovationDesc: "Staying up-to-date with the latest AI advances",
      valueQuality: "Quality",
      valueQualityDesc: "Providing accurate and reliable content"
    },
    
    footer: {
      brand: "NeoHoosh",
      tagline: "A bridge to the world of AI",
      quickLinks: "Quick Links",
      homepage: "Homepage",
      learnMore: "Learn More",
      social: "Social",
      copyright: "All rights reserved"
    },

    footer: {
      brand: "نيوهوش",
      tagline: "جسر إلى عالم الذكاء الاصطناعي",
      quickLinks: "روابط سريعة",
      homepage: "الصفحة الرئيسية",
      learnMore: "اعرف المزيد",
      social: "التواصل الاجتماعي",
      copyright: "جميع الحقوق محفوظة"
    },

    chat: {
      pleaseLogin: "Please login first",
      selectModel: "Select a model",
      typeMessage: "Type your message...",
      newConversation: "New Conversation",
      backToModels: "Back to Models"
    }
  },
  ar: {
    home: "الرئيسية",
    articles: "المقالات",
    products: "المتجر",
    services: "الخدمات",
    chatbot: "المساعد الذكي",
    about: "من نحن",
    contact: "اتصل بنا",
    logout: "تسجيل الخروج",
    login: "تسجيل الدخول",

    profile: {
      title: "الملف الشخصي",
      description: "إدارة معلومات حسابك",
      email: "البريد الإلكتروني",
      emailNote: "لا يمكن تغيير البريد الإلكتروني",
      displayName: "الاسم المعروض",
      displayNamePlaceholder: "أدخل اسمك",
      save: "حفظ التغييرات",
      updateSuccess: "تم تحديث الملف الشخصي بنجاح"
    },

    dashboard: {
      welcome: "مرحباً",
      subtitle: "نظرة عامة على أنشطتك وإحصائياتك",
      savedArticles: "المقالات المحفوظة",
      totalActivity: "إجمالي الأنشطة",
      memberSince: "عضو منذ",
      recentlySaved: "المحفوظ مؤخراً",
      savedDesc: "مقالاتك المحفوظة",
      noSaved: "لم تحفظ أي مقالات بعد",
      recentActivity: "النشاط الأخير",
      activityDesc: "أحدث أنشطتك",
      noActivity: "لا يوجد نشاط حتى الآن",
      viewedArticle: "شاهد مقالاً",
      savedArticle: "حفظ مقالاً"
    },

    auth: {
      title: "تسجيل الدخول",
      subtitle: "مرحباً بك في عالم الذكاء الاصطناعي",
      signup: "إنشاء حساب",
      password: "كلمة المرور",
      signupSuccess: "تم إنشاء حسابك. يرجى تسجيل الدخول.",
      forgotPassword: "هل نسيت كلمة المرور؟",
      signingIn: "جارٍ تسجيل الدخول...",
      signingUp: "جارٍ إنشاء الحساب...",
      orContinueWith: "أو المتابعة باستخدام",
      resetSent: "تم إرسال رسالة إعادة تعيين كلمة المرور",
      enterEmail: "أدخل بريدك الإلكتروني",
      sending: "جارٍ الإرسال...",
      sendReset: "إرسال رابط إعادة التعيين",
      backToLogin: "العودة إلى تسجيل الدخول"
    },

    hero: {
      badge: "منصة تعلم الذكاء الاصطناعي",
      title: "تعلم الذكاء الاصطناعي",
      subtitle: "ببساطة وعملياً",
      description: "في نيوهوش، ستتعرّف على مفاهيم الذكاء الاصطناعي وكيفية استخدام أدواته في حياتك وعملك.",
      cta: "ابدأ التعلم",
      newArticles: "أحدث المقالات",
      smartAssistant: "المساعد الذكي"
    },

    features: {
      title: "لماذا نيوهوش؟",
      subtitle: "تعلم بسيط ومواكب مع مجتمع نشط",
      learning: "تعلم بسيط",
      learningDesc: "تعلّم المفاهيم المعقّدة عبر أمثلة عملية مفهومة.",
      updated: "مواكب وعملي",
      updatedDesc: "ابقَ على اطلاع بأحدث أدوات وتقنيات الذكاء الاصطناعي.",
      community: "مجتمع نشط",
      communityDesc: "تحدّث وشارك الخبرات مع محبي الذكاء الاصطناعي."
    },

    latestArticles: {
      title: "أحدث المقالات",
      subtitle: "مختارات من أحدث المواد التعليمية"
    },

    contactPage: {
      title: "اتصل بنا",
      subtitle: "شاركنا أسئلتك واقتراحاتك وملاحظاتك",
      formTitle: "إرسال رسالة",
      name: "الاسم",
      namePlaceholder: "أدخل اسمك",
      email: "البريد الإلكتروني",
      message: "الرسالة",
      messagePlaceholder: "اكتب رسالتك...",
      send: "إرسال الرسالة",
      success: "تم إرسال رسالتك!",
      successDesc: "سنتواصل معك قريباً",
      error: "حدث خطأ أثناء إرسال الرسالة",
      contactInfo: "معلومات الاتصال",
      contactDesc: "يمكنك التواصل معنا عبر الطرق التالية:",
      emailLabel: "البريد الإلكتروني",
      emailValue: "support@neohoosh.com",
      instagramLabel: "إنستغرام",
      instagramValue: "@neohoosh.ai",
      hoursLabel: "ساعات الدعم",
      hoursValue: "من السبت إلى الخميس، 9 صباحاً حتى 6 مساءً"
    },

    aboutPage: {
      header: "حول",
      headerBrand: "نيوهوش",
      headerDesc: "جسر إلى عالم الذكاء الاصطناعي",
      missionTitle: "مهمتنا",
      missionDesc: "تأسست نيوهوش بهدف تبسيط ونشر معرفة الذكاء الاصطناعي.",
      visionTitle: "رؤيتنا",
      visionDesc: "أن نصبح المرجع الرئيسي والموثوق لتعلم واستخدام الذكاء الاصطناعي في إيران والمنطقة.",
      teamTitle: "فريقنا",
      teamDesc: "يتكون فريق نيوهوش من محبي الذكاء الاصطناعي.",
      founderName: "أميرحسين صابري",
      founderRole: "المؤسس والمدير التنفيذي",
      valueSimplicity: "البساطة",
      valueSimplicityDesc: "التعليم بلغة بسيطة ومفهومة",
      valueInnovation: "الابتكار",
      valueInnovationDesc: "مواكبة أحدث تطورات الذكاء الاصطناعي",
      valueQuality: "الجودة",
      valueQualityDesc: "تقديم محتوى دقيق وموثوق"
    },

    chat: {
      pleaseLogin: "يرجى تسجيل الدخول أولاً",
      selectModel: "اختر نموذجاً",
      typeMessage: "اكتب رسالتك...",
      newConversation: "محادثة جديدة",
      backToModels: "العودة إلى النماذج"
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

    // Try current language, then fallback to English, then Persian
    const langsToTry: Array<keyof typeof translations> = [
      language as keyof typeof translations,
      "en",
      "fa",
    ];

    for (const lang of langsToTry) {
      let val: any = (translations as any)[lang];
      for (const k of keys) {
        val = val?.[k];
        if (val === undefined) break;
      }
      if (typeof val === "string") return val;
    }

    // As a last resort return the key to avoid rendering objects or undefined
    return key;
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