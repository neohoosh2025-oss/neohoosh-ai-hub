import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "fa" | "en";

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
    "features.title": "چرا نئو هوش؟",
    "features.subtitle": "ما با هدف آموزش و گسترش دانش هوش مصنوعی، محتوای با کیفیت و کاربردی را ارائه می‌دهیم",
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
    "features.title": "Why Neo Hoosh?",
    "features.subtitle": "We provide quality and practical content with the aim of educating and expanding AI knowledge",
    "about.mission": "Our Mission",
    "about.vision": "Vision",
    "about.team": "Neo Hoosh Team",
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
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
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
