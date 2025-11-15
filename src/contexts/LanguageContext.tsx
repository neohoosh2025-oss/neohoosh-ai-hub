import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "fa" | "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  fa: {
    home: "خانه",
    articles: "مقالات",
    products: "فروشگاه",
    services: "خدمات",
    chatbot: "چت‌بات",
    about: "درباره ما",
    contact: "تماس با ما",
    "hero.title": "نئو هوش",
    "hero.subtitle": "دنیای هوش مصنوعی",
    "hero.description": "آموزش، محتوا و کاربردهای هوش مصنوعی به زبان ساده برای شروع سفر هوشمندانه شما",
    "hero.cta": "شروع یادگیری",
    "hero.badge": "هوش مصنوعی برای همه",
    "hero.newArticles": "مقالات جدید",
    "features.title": "چرا نئو هوش؟",
    "features.subtitle": "ما با هدف آموزش و گسترش دانش هوش مصنوعی، محتوای با کیفیت و کاربردی را ارائه می‌دهیم",
    "features.learning": "یادگیری آسان",
    "features.learningDesc": "محتوای ساده و کاربردی برای همه سطوح",
    "features.updated": "محتوای بروز",
    "features.updatedDesc": "آخرین اخبار و پیشرفت‌های هوش مصنوعی",
    "features.community": "جامعه فعال",
    "features.communityDesc": "پشتیبانی و تبادل دانش با هم‌فکران",
    "latestArticles.title": "آخرین مقالات",
    "latestArticles.subtitle": "جدیدترین محتواهای آموزشی و خبری ما",
    "latestArticles.readMore": "ادامه مطلب",
    "latestArticles.loading": "در حال بارگذاری...",
    "latestArticles.noArticles": "هنوز مقاله‌ای منتشر نشده است",
    "cta.title": "آماده‌اید تا سفر یادگیری خود را شروع کنید؟",
    "cta.description": "به جامعه نئوهوش بپیوندید و دنیای هوش مصنوعی را کشف کنید",
    "cta.button": "مشاهده همه مقالات",
    "articles.title": "مقالات نئوهوش",
    "articles.subtitle": "آخرین مقالات و آموزش‌های هوش مصنوعی",
    "about.mission": "مأموریت ما",
    "about.vision": "چشم‌انداز",
    "about.team": "تیم نئوهوش",
  },
  en: {
    home: "Home",
    articles: "Articles",
    products: "Shop",
    services: "Services",
    chatbot: "Chatbot",
    about: "About Us",
    contact: "Contact",
    "hero.title": "Neo Hoosh",
    "hero.subtitle": "World of Artificial Intelligence",
    "hero.description": "Education, content and AI applications in simple language to start your smart journey",
    "hero.cta": "Start Learning",
    "hero.badge": "AI for Everyone",
    "hero.newArticles": "New Articles",
    "features.title": "Why Neo Hoosh?",
    "features.subtitle": "We provide quality and practical content with the aim of educating and expanding AI knowledge",
    "features.learning": "Easy Learning",
    "features.learningDesc": "Simple and practical content for all levels",
    "features.updated": "Updated Content",
    "features.updatedDesc": "Latest news and AI developments",
    "features.community": "Active Community",
    "features.communityDesc": "Support and knowledge sharing with like-minded people",
    "latestArticles.title": "Latest Articles",
    "latestArticles.subtitle": "Our newest educational and news content",
    "latestArticles.readMore": "Read More",
    "latestArticles.loading": "Loading...",
    "latestArticles.noArticles": "No articles published yet",
    "cta.title": "Ready to Start Your Learning Journey?",
    "cta.description": "Join the Neo Hoosh community and discover the world of AI",
    "cta.button": "View All Articles",
    "articles.title": "Neo Hoosh Articles",
    "articles.subtitle": "Latest AI articles and tutorials",
    "about.mission": "Our Mission",
    "about.vision": "Vision",
    "about.team": "Neo Hoosh Team",
  },
  ar: {
    home: "الرئيسية",
    articles: "المقالات",
    products: "المتجر",
    services: "الخدمات",
    chatbot: "الدردشة",
    about: "من نحن",
    contact: "اتصل بنا",
    "hero.title": "نيو هوش",
    "hero.subtitle": "عالم الذكاء الاصطناعي",
    "hero.description": "التعليم والمحتوى وتطبيقات الذكاء الاصطناعي بلغة بسيطة لبدء رحلتك الذكية",
    "hero.cta": "ابدأ التعلم",
    "hero.badge": "الذكاء الاصطناعي للجميع",
    "hero.newArticles": "مقالات جديدة",
    "features.title": "لماذا نيو هوش؟",
    "features.subtitle": "نقدم محتوى عالي الجودة وعملي بهدف تعليم وتوسيع معرفة الذكاء الاصطناعي",
    "features.learning": "تعلم سهل",
    "features.learningDesc": "محتوى بسيط وعملي لجميع المستويات",
    "features.updated": "محتوى محدث",
    "features.updatedDesc": "آخر الأخبار وتطورات الذكاء الاصطناعي",
    "features.community": "مجتمع نشط",
    "features.communityDesc": "الدعم وتبادل المعرفة مع الأشخاص ذوي التفكير المماثل",
    "latestArticles.title": "أحدث المقالات",
    "latestArticles.subtitle": "أحدث محتوانا التعليمي والإخباري",
    "latestArticles.readMore": "اقرأ المزيد",
    "latestArticles.loading": "جاري التحميل...",
    "latestArticles.noArticles": "لم يتم نشر أي مقالات بعد",
    "cta.title": "هل أنت مستعد لبدء رحلة التعلم الخاصة بك؟",
    "cta.description": "انضم إلى مجتمع نيو هوش واكتشف عالم الذكاء الاصطناعي",
    "cta.button": "عرض جميع المقالات",
    "articles.title": "مقالات نيو هوش",
    "articles.subtitle": "أحدث مقالات ودروس الذكاء الاصطناعي",
    "about.mission": "مهمتنا",
    "about.vision": "الرؤية",
    "about.team": "فريق نيو هوش",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fa");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved) setLanguage(saved);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    document.documentElement.dir = lang === "fa" || lang === "ar" ? "rtl" : "ltr";
  };

  const t = (key: string) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
