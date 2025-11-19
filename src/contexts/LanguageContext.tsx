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
    nav: { home: "خانه", about: "درباره ما", services: "خدمات", articles: "مقالات", products: "محصولات", contact: "تماس با ما", chat: "چت با هوش مصنوعی", profile: "پروفایل", dashboard: "داشبورد", admin: "مدیریت", login: "ورود", logout: "خروج" },
    home: "خانه",
    articles: "مقالات",
    articleDetail: {
      backToArticles: "بازگشت به مقالات",
      author: "نویسنده",
      notFound: "مقاله یافت نشد"
    },
    products: "فروشگاه",
    services: "خدمات",
    chatbot: "چت‌بات",
    about: "درباره ما",
    contact: "تماس با ما",
    logout: "خروج",
    login: "ورود",
    profile: { title: "پروفایل کاربری", description: "اطلاعات حساب کاربری خود را مدیریت کنید", email: "ایمیل", emailNote: "ایمیل قابل تغییر نیست", displayName: "نام نمایشی", displayNamePlaceholder: "نام خود را وارد کنید", save: "ذخیره تغییرات", updateSuccess: "پروفایل با موفقیت به‌روز شد", quickAccess: "دسترسی سریع", userDashboard: "داشبورد کاربری", dashboardDescription: "مشاهده فعالیت‌ها و مقالات ذخیره شده", memoryManagement: "مدیریت حافظه چت‌بات", memoryDescription: "اطلاعات ذخیره شده در چت‌بات را مشاهده کنید" },
    dashboard: { title: "داشبورد کاربری", welcome: "خوش آمدید", subtitle: "نمای کلی فعالیت‌ها و آمار شما", overview: "خلاصه فعالیت‌ها", savedArticles: "مقالات ذخیره شده", savedArticlesCount: "مقالات ذخیره شده", totalActivity: "کل فعالیت‌ها", memberSince: "عضویت از", recentlySaved: "اخیراً ذخیره شده", savedDesc: "مقالات ذخیره شده شما", noSaved: "هنوز مقاله‌ای ذخیره نکرده‌اید", noSavedArticles: "هیچ مقاله‌ای ذخیره نشده", noSavedArticlesDesc: "مقالات مورد علاقه خود را ذخیره کنید تا بعداً به آن‌ها دسترسی داشته باشید", recentActivity: "فعالیت‌های اخیر", activityDesc: "آخرین فعالیت‌های شما", noActivity: "هنوز فعالیتی ثبت نشده", noActivityDesc: "فعالیت‌های شما در اینجا نمایش داده می‌شود", viewedArticle: "مقاله را مشاهده کرد", savedArticle: "مقاله را ذخیره کرد", savedOn: "ذخیره شده در" },
    memory: { title: "مدیریت حافظه", description: "اطلاعات ذخیره شده در چت‌بات", addMemory: "افزودن حافظه", clearAll: "پاک کردن همه", addNewTitle: "افزودن حافظه جدید", addNewDesc: "اطلاعات جدیدی که می‌خواهید ذخیره شود", keyLabel: "کلید (مثلاً: name, age, job)", keyPlaceholder: "نام کلید...", valueLabel: "مقدار", valuePlaceholder: "مقدار...", save: "ذخیره", cancel: "انصراف", edit: "ویرایش", delete: "حذف", loading: "در حال بارگذاری...", noMemories: "هیچ حافظه‌ای ذخیره نشده", noMemoriesDesc: "وقتی در چت اطلاعات شخصی خود را به اشتراک بگذارید، آن‌ها اینجا ذخیره می‌شوند", addFirst: "افزودن اولین حافظه", deleteConfirm: "آیا مطمئن هستید که می‌خواهید این حافظه را حذف کنید؟", clearAllConfirm: "آیا مطمئن هستید که می‌خواهید تمام حافظه‌ها را حذف کنید؟ این عمل قابل بازگشت نیست!", updateSuccess: "حافظه با موفقیت به‌روزرسانی شد", deleteSuccess: "حافظه با موفقیت حذف شد", addSuccess: "حافظه جدید اضافه شد", clearSuccess: "تمام حافظه‌ها پاک شدند", emptyError: "کلید و مقدار نمی‌توانند خالی باشند", duplicateError: "این کلید قبلاً استفاده شده است", error: "خطا در عملیات" },
    auth: { title: "ورود به سیستم", subtitle: "به دنیای هوش مصنوعی خوش آمدید", signup: "ثبت‌نام", password: "رمز عبور", signupSuccess: "حساب شما ایجاد شد لطفا وارد شوید", forgotPassword: "رمز عبور را فراموش کرده‌اید", signingIn: "در حال ورود", signingUp: "در حال ثبت‌نام", orContinueWith: "یا ادامه با", resetSent: "ایمیل بازیابی رمز عبور ارسال شد", enterEmail: "ایمیل خود را وارد کنید", sending: "در حال ارسال", sendReset: "ارسال لینک بازیابی", backToLogin: "بازگشت به ورود" },
    hero: { badge: "پلتفرم آموزش هوش مصنوعی", title: "یادگیری هوش مصنوعی", subtitle: "به سادگی و کاربردی", description: "در نئوهوش، شما با مفاهیم هوش مصنوعی آشنا می‌شوید و یاد می‌گیرید چگونه از ابزارهای AI در زندگی و کار خود استفاده کنید", cta: "شروع یادگیری", newArticles: "مقالات جدید", smartAssistant: "دستیار هوشمند" },
    features: { title: "چرا نئوهوش؟", subtitle: "آموزش ساده، به‌روز و همراه با جامعه کاربری", learning: "یادگیری ساده", learningDesc: "مفاهیم پیچیده را با مثال‌های کاربردی و قابل فهم یاد بگیرید", updated: "به‌روز و عملی", updatedDesc: "همیشه با جدیدترین ابزارها و تکنیک‌های هوش مصنوعی همراه باشید", community: "جامعه فعال", communityDesc: "با افراد علاقه‌مند به AI گفتگو کنید و تجربه‌ها را به اشتراک بگذارید" },
    latestArticles: { title: "آخرین مقالات", subtitle: "منتخب جدیدترین مطالب آموزشی و کاربردی", loading: "در حال بارگذاری", noArticles: "هنوز مقاله‌ای منتشر نشده است", readMore: "ادامه مطلب" },
    cta: { title: "آماده برای یادگیری هستید", description: "با مقالات آموزشی ما سفر خود را در دنیای هوش مصنوعی شروع کنید", button: "مشاهده همه مقالات" },
    articlesPage: { title: "مقالات آموزشی", subtitle: "مجموعه کامل مقالات هوش مصنوعی" },
    productsPage: { header: "فروشگاه محصولات", headerDesc: "کتاب‌ها و محصولات آموزشی هوش مصنوعی", loading: "در حال بارگذاری", noProducts: "هنوز محصولی منتشر نشده است", format: "فرمت: PDF", pages: "صفحه", viewDetails: "مشاهده جزئیات" },
    servicesPage: { title: "خدمات ما", subtitle: "خدمات حرفه‌ای طراحی و توسعه وب", mainService: "طراحی و توسعه وب‌سایت", description: "ما وب‌سایت‌های مدرن، سریع و کاربرپسند طراحی و توسعه می‌دهیم با استفاده از جدیدترین تکنولوژی‌ها، پروژه شما را به واقعیت تبدیل می‌کنیم", modernDesign: "طراحی مدرن", modernDesignDesc: "رابط کاربری زیبا و کاربرپسند", fastDev: "توسعه سریع", fastDevDesc: "تحویل پروژه در کوتاه‌ترین زمان", qualityCode: "کد با کیفیت", qualityCodeDesc: "کد تمیز، قابل نگهداری و مقیاس‌پذیر", requestCoop: "درخواست همکاری", portfolio: "نمونه کارها", portfolioDesc: "پروژه‌های انجام شده ما را مشاهده کنید" },
    contactPage: { title: "تماس با ما", subtitle: "سوالات، پیشنهادات یا نظرات خود را با ما در میان بگذارید", formTitle: "ارسال پیام", name: "نام", namePlaceholder: "نام خود را وارد کنید", email: "ایمیل", message: "پیام", messagePlaceholder: "پیام خود را بنویسید", send: "ارسال پیام", success: "پیام شما ارسال شد", successDesc: "به زودی با شما تماس خواهیم گرفت", error: "خطا در ارسال پیام", contactInfo: "اطلاعات تماس", contactDesc: "از راه‌های زیر می‌توانید با ما در ارتباط باشید:", emailLabel: "ایمیل", emailValue: "support@neohoosh.com", instagramLabel: "اینستاگرام", instagramValue: "@neohoosh.ai", hoursLabel: "ساعات پاسخگویی", hoursValue: "شنبه تا پنجشنبه، ۹ صبح تا ۶ عصر" },
    aboutPage: { header: "درباره", headerBrand: "نئوهوش", headerDesc: "پلی به دنیای هوش مصنوعی", missionTitle: "ماموریت ما", missionDesc: "نئوهوش با هدف ساده‌سازی و دموکراتیزه‌کردن دانش هوش مصنوعی تاسیس شده است", visionTitle: "چشم‌انداز ما", visionDesc: "تبدیل شدن به منبع اصلی و قابل اعتماد برای یادگیری و استفاده از هوش مصنوعی در ایران و منطقه", teamTitle: "تیم ما", teamDesc: "تیم نئوهوش متشکل از متخصصان علاقه‌مند به هوش مصنوعی است", founderName: "محمدرضا تقی معز", founderRole: "بنیانگذار و مدیر عامل", valueSimplicity: "سادگی", valueSimplicityDesc: "آموزش به زبان ساده و قابل فهم", valueInnovation: "نوآوری", valueInnovationDesc: "به‌روز ماندن با آخرین پیشرفت‌های هوش مصنوعی", valueQuality: "کیفیت", valueQualityDesc: "ارائه محتوای دقیق و معتبر", valueCommunity: "جامعه", valueCommunityDesc: "ایجاد یک جامعه فعال از علاقه‌مندان به هوش مصنوعی" },
    footer: { brand: "نئوهوش", tagline: "پلی به دنیای هوش مصنوعی", quickLinks: "لینک‌های سریع", homepage: "صفحه اصلی", learnMore: "بیشتر بدانید", social: "شبکه‌های اجتماعی", copyright: "تمام حقوق محفوظ است" },
    chat: {
      title: "نئوهوش",
      subtitle: "مدل مورد نظرتان را انتخاب کنید",
      businessAdvisor: "مشاور کسب‌وکار",
      businessDesc: "دریافت مشاوره برای کسب‌وکار و استراتژی",
      personalDev: "توسعه فردی",
      personalDesc: "راهنمایی برای رشد شخصی و مهارت‌های زندگی",
      openQuestions: "سوالات باز",
      openQuestionsDesc: "پرسش و پاسخ درباره هر موضوع",
      adsGen: "تولید تبلیغات",
      adsGenDesc: "ساخت محتوای تبلیغاتی خلاقانه",
      textToImage: "متن به تصویر",
      textToImageDesc: "تبدیل توضیحات به تصاویر بصری",
      pleaseLogin: "لطفا ابتدا وارد شوید",
      selectModel: "یک مدل انتخاب کنید",
      typeMessage: "پیام خود را بنویسید",
      error: "خطا در برقراری ارتباط با چت‌بات",
      creditError: "اعتبار Lovable AI تمام شده است. لطفاً از بخش تنظیمات اعتبار اضافه کنید.",
      rateLimitError: "تعداد درخواست‌ها زیاد است. لطفاً کمی صبر کنید.",
      newConversation: "گفتگوی جدید",
      backToModels: "بازگشت به مدل‌ها"
    }
  },
  en: {
    home: "Home", articles: "Articles", products: "Shop", services: "Services", chatbot: "Chatbot", about: "About", contact: "Contact", logout: "Logout", login: "Login",
    profile: { title: "User Profile", description: "Manage your account information", email: "Email", emailNote: "Email cannot be changed", displayName: "Display Name", displayNamePlaceholder: "Enter your name", save: "Save Changes", updateSuccess: "Profile updated successfully", quickAccess: "Quick Access", userDashboard: "User Dashboard", dashboardDescription: "View activities and saved articles", memoryManagement: "Chatbot Memory Management", memoryDescription: "View information stored in chatbot" },
    dashboard: { title: "User Dashboard", welcome: "Welcome", subtitle: "Overview of your activities and statistics", overview: "Activity Summary", savedArticles: "Saved Articles", savedArticlesCount: "Saved Articles", totalActivity: "Total Activities", memberSince: "Member Since", recentlySaved: "Recently Saved", savedDesc: "Your saved articles", noSaved: "You haven't saved any articles yet", noSavedArticles: "No Saved Articles", noSavedArticlesDesc: "Save your favorite articles to access them later", recentActivity: "Recent Activity", activityDesc: "Your latest activities", noActivity: "No activity recorded yet", noActivityDesc: "Your activities will be displayed here", viewedArticle: "Viewed article", savedArticle: "Saved article", savedOn: "Saved on" },
    memory: { title: "Memory Management", description: "Information stored in chatbot", addMemory: "Add Memory", clearAll: "Clear All", addNewTitle: "Add New Memory", addNewDesc: "New information you want to store", keyLabel: "Key (e.g.: name, age, job)", keyPlaceholder: "Key name...", valueLabel: "Value", valuePlaceholder: "Value...", save: "Save", cancel: "Cancel", edit: "Edit", delete: "Delete", loading: "Loading...", noMemories: "No memories stored", noMemoriesDesc: "When you share personal information in chat, it will be stored here", addFirst: "Add First Memory", deleteConfirm: "Are you sure you want to delete this memory?", clearAllConfirm: "Are you sure you want to delete all memories? This action cannot be undone!", updateSuccess: "Memory updated successfully", deleteSuccess: "Memory deleted successfully", addSuccess: "New memory added", clearSuccess: "All memories cleared", emptyError: "Key and value cannot be empty", duplicateError: "This key has already been used", error: "Error in operation" },
    auth: { title: "Sign In", subtitle: "Welcome to the world of AI", signup: "Sign Up", password: "Password", signupSuccess: "Your account has been created Please sign in", forgotPassword: "Forgot Password", signingIn: "Signing in", signingUp: "Signing up", orContinueWith: "Or continue with", resetSent: "Password reset email sent", enterEmail: "Enter your email", sending: "Sending", sendReset: "Send Reset Link", backToLogin: "Back to Login" },
    hero: { badge: "AI Learning Platform", title: "Learning AI", subtitle: "Simply and Practically", description: "At NeoHoosh, you'll learn about AI concepts and how to use AI tools in your life and work", cta: "Start Learning", newArticles: "Latest Articles", smartAssistant: "Smart Assistant" },
    features: { title: "Why NeoHoosh?", subtitle: "Simple, up-to-date learning with community", learning: "Simple Learning", learningDesc: "Learn complex concepts through clear, practical examples", updated: "Up-to-date & Practical", updatedDesc: "Stay current with the latest AI tools and techniques", community: "Active Community", communityDesc: "Discuss and share experiences with AI enthusiasts" },
    latestArticles: { title: "Latest Articles", subtitle: "Handpicked fresh educational content", loading: "Loading", noArticles: "No articles published yet", readMore: "Read More" },
    cta: { title: "Ready to Start Learning", description: "Begin your journey into the world of AI with our educational articles", button: "View All Articles" },
    articlesPage: { title: "Educational Articles", subtitle: "Complete collection of AI articles" },
    productsPage: { header: "Product Shop", headerDesc: "AI educational books and products", loading: "Loading", noProducts: "No products available yet", format: "Format: PDF", pages: "pages", viewDetails: "View Details" },
    servicesPage: { title: "Our Services", subtitle: "Professional web design and development services", mainService: "Website Design & Development", description: "We design and develop modern, fast, and user-friendly websites Using the latest technologies, we bring your project to life", modernDesign: "Modern Design", modernDesignDesc: "Beautiful and user-friendly interface", fastDev: "Fast Development", fastDevDesc: "Project delivery in the shortest time", qualityCode: "Quality Code", qualityCodeDesc: "Clean, maintainable, and scalable code", requestCoop: "Request Cooperation", portfolio: "Portfolio", portfolioDesc: "View our completed projects" },
    contactPage: { title: "Contact Us", subtitle: "Share your questions, suggestions, or feedback with us", formTitle: "Send Message", name: "Name", namePlaceholder: "Enter your name", email: "Email", message: "Message", messagePlaceholder: "Write your message", send: "Send Message", success: "Your message has been sent", successDesc: "We will contact you soon", error: "Error sending message", contactInfo: "Contact Information", contactDesc: "You can contact us through the following ways:", emailLabel: "Email", emailValue: "support@neohoosh.com", instagramLabel: "Instagram", instagramValue: "@neohoosh.ai", hoursLabel: "Support Hours", hoursValue: "Saturday to Thursday, 9 AM to 6 PM" },
    aboutPage: { header: "About", headerBrand: "NeoHoosh", headerDesc: "A Bridge to the World of AI", missionTitle: "Our Mission", missionDesc: "NeoHoosh was founded with the goal of simplifying and democratizing AI knowledge", visionTitle: "Our Vision", visionDesc: "To become the main and trusted source for learning and using AI in Iran and the region", teamTitle: "Our Team", teamDesc: "The NeoHoosh team consists of AI enthusiasts", founderName: "Mohammadreza Taghimoez", founderRole: "Founder & CEO", valueSimplicity: "Simplicity", valueSimplicityDesc: "Teaching in simple and understandable language", valueInnovation: "Innovation", valueInnovationDesc: "Staying up-to-date with the latest AI advances", valueQuality: "Quality", valueQualityDesc: "Providing accurate and reliable content", valueCommunity: "Community", valueCommunityDesc: "Building an active community of AI enthusiasts" },
    footer: { brand: "NeoHoosh", tagline: "A bridge to the world of AI", quickLinks: "Quick Links", homepage: "Homepage", learnMore: "Learn More", social: "Social", copyright: "All rights reserved" },
    chat: {
      title: "NeoHoosh",
      subtitle: "Choose your desired model",
      businessAdvisor: "Business Advisor",
      businessDesc: "Get advice for business and strategy",
      personalDev: "Personal Development",
      personalDesc: "Guidance for personal growth and life skills",
      openQuestions: "Open Questions",
      openQuestionsDesc: "Q&A about any topic",
      adsGen: "Ad Generation",
      adsGenDesc: "Create creative advertising content",
      textToImage: "Text to Image",
      textToImageDesc: "Convert descriptions into visual images",
      pleaseLogin: "Please login first",
      selectModel: "Select a model",
      typeMessage: "Type your message",
      error: "Error communicating with chatbot",
      creditError: "Lovable AI credits have run out. Please add credits from settings.",
      rateLimitError: "Too many requests. Please wait a moment.",
      newConversation: "New Conversation",
      backToModels: "Back to Models"
    }
  },
  ar: {
    home: "الرئيسية", articles: "المقالات", articleDetail: { backToArticles: "العودة إلى المقالات", author: "الكاتب", notFound: "المقالة غير موجودة" }, products: "المتجر", services: "الخدمات", chatbot: "المساعد الذكي", about: "من نحن", contact: "اتصل بنا", logout: "تسجيل الخروج", login: "تسجيل الدخول",
    profile: { title: "الملف الشخصي", description: "إدارة معلومات حسابك", email: "البريد الإلكتروني", emailNote: "لا يمكن تغيير البريد الإلكتروني", displayName: "الاسم المعروض", displayNamePlaceholder: "أدخل اسمك", save: "حفظ التغييرات", updateSuccess: "تم تحديث الملف الشخصي بنجاح", quickAccess: "وصول سريع", userDashboard: "لوحة تحكم المستخدم", dashboardDescription: "عرض الأنشطة والمقالات المحفوظة", memoryManagement: "إدارة ذاكرة الشات بوت", memoryDescription: "عرض المعلومات المخزنة في الشات بوت" },
    dashboard: { title: "لوحة تحكم المستخدم", welcome: "مرحباً", subtitle: "نظرة عامة على أنشطتك وإحصائياتك", overview: "ملخص الأنشطة", savedArticles: "المقالات المحفوظة", savedArticlesCount: "المقالات المحفوظة", totalActivity: "إجمالي الأنشطة", memberSince: "عضو منذ", recentlySaved: "المحفوظ مؤخراً", savedDesc: "مقالاتك المحفوظة", noSaved: "لم تحفظ أي مقالات بعد", noSavedArticles: "لا توجد مقالات محفوظة", noSavedArticlesDesc: "احفظ مقالاتك المفضلة للوصول إليها لاحقاً", recentActivity: "النشاط الأخير", activityDesc: "أحدث أنشطتك", noActivity: "لا يوجد نشاط حتى الآن", noActivityDesc: "سيتم عرض أنشطتك هنا", viewedArticle: "شاهد مقالاً", savedArticle: "حفظ مقالاً", savedOn: "تم الحفظ في" },
    memory: { title: "إدارة الذاكرة", description: "المعلومات المخزنة في الشات بوت", addMemory: "إضافة ذاكرة", clearAll: "مسح الكل", addNewTitle: "إضافة ذاكرة جديدة", addNewDesc: "معلومات جديدة تريد تخزينها", keyLabel: "المفتاح (مثلاً: name, age, job)", keyPlaceholder: "اسم المفتاح...", valueLabel: "القيمة", valuePlaceholder: "القيمة...", save: "حفظ", cancel: "إلغاء", edit: "تعديل", delete: "حذف", loading: "جارٍ التحميل...", noMemories: "لا توجد ذاكرة مخزنة", noMemoriesDesc: "عندما تشارك معلومات شخصية في الدردشة، سيتم تخزينها هنا", addFirst: "إضافة أول ذاكرة", deleteConfirm: "هل أنت متأكد من حذف هذه الذاكرة؟", clearAllConfirm: "هل أنت متأكد من حذف جميع الذكريات؟ لا يمكن التراجع عن هذا الإجراء!", updateSuccess: "تم تحديث الذاكرة بنجاح", deleteSuccess: "تم حذف الذاكرة بنجاح", addSuccess: "تمت إضافة ذاكرة جديدة", clearSuccess: "تم مسح جميع الذكريات", emptyError: "المفتاح والقيمة لا يمكن أن يكونا فارغين", duplicateError: "هذا المفتاح مستخدم بالفعل", error: "خطأ في العملية" },
    auth: { title: "تسجيل الدخول", subtitle: "مرحباً بك في عالم الذكاء الاصطناعي", signup: "إنشاء حساب", password: "كلمة المرور", signupSuccess: "تم إنشاء حسابك يرجى تسجيل الدخول", forgotPassword: "هل نسيت كلمة المرور؟", signingIn: "جارٍ تسجيل الدخول", signingUp: "جارٍ إنشاء الحساب", orContinueWith: "أو المتابعة باستخدام", resetSent: "تم إرسال رسالة إعادة تعيين كلمة المرور", enterEmail: "أدخل بريدك الإلكتروني", sending: "جارٍ الإرسال", sendReset: "إرسال رابط إعادة التعيين", backToLogin: "العودة إلى تسجيل الدخول" },
    hero: { badge: "منصة تعلم الذكاء الاصطناعي", title: "تعلم الذكاء الاصطناعي", subtitle: "ببساطة وعملياً", description: "في نيوهوش، ستتعرّف على مفاهيم الذكاء الاصطناعي وكيفية استخدام أدواته في حياتك وعملك", cta: "ابدأ التعلم", newArticles: "أحدث المقالات", smartAssistant: "المساعد الذكي" },
    features: { title: "لماذا نيوهوش", subtitle: "تعلم بسيط ومواكب مع مجتمع نشط", learning: "تعلم بسيط", learningDesc: "تعلّم المفاهيم المعقّدة عبر أمثلة عملية مفهومة", updated: "مواكب وعملي", updatedDesc: "ابقَ على اطلاع بأحدث أدوات وتقنيات الذكاء الاصطناعي", community: "مجتمع نشط", communityDesc: "تحدّث وشارك الخبرات مع محبي الذكاء الاصطناعي" },
    latestArticles: { title: "أحدث المقالات", subtitle: "مختارات من أحدث المواد التعليمية", loading: "جارٍ التحميل", noArticles: "لم يتم نشر مقالات بعد", readMore: "اقرأ المزيد" },
    cta: { title: "هل أنت مستعد للتعلم", description: "ابدأ رحلتك في عالم الذكاء الاصطناعي مع مقالاتنا التعليمية", button: "عرض جميع المقالات" },
    articlesPage: { title: "المقالات التعليمية", subtitle: "مجموعة كاملة من مقالات الذكاء الاصطناعي" },
    productsPage: { header: "متجر المنتجات", headerDesc: "كتب ومنتجات تعليمية للذكاء الاصطناعي", loading: "جارٍ التحميل", noProducts: "لا توجد منتجات متاحة بعد", format: "الصيغة: PDF", pages: "صفحة", viewDetails: "عرض التفاصيل" },
    servicesPage: { title: "خدماتنا", subtitle: "خدمات احترافية لتصميم وتطوير الويب", mainService: "تصميم وتطوير المواقع", description: "نقوم بتصميم وتطوير مواقع ويب حديثة وسريعة وسهلة الاستخدام باستخدام أحدث التقنيات، نحوّل مشروعك إلى واقع", modernDesign: "تصميم حديث", modernDesignDesc: "واجهة جميلة وسهلة الاستخدام", fastDev: "تطوير سريع", fastDevDesc: "تسليم المشروع في أقصر وقت", qualityCode: "كود عالي الجودة", qualityCodeDesc: "كود نظيف وقابل للصيانة والتوسع", requestCoop: "طلب التعاون", portfolio: "معرض الأعمال", portfolioDesc: "اطّلع على مشاريعنا المنجزة" },
    contactPage: { title: "اتصل بنا", subtitle: "شاركنا أسئلتك واقتراحاتك وملاحظاتك", formTitle: "إرسال رسالة", name: "الاسم", namePlaceholder: "أدخل اسمك", email: "البريد الإلكتروني", message: "الرسالة", messagePlaceholder: "اكتب رسالتك", send: "إرسال الرسالة", success: "تم إرسال رسالتك", successDesc: "سنتواصل معك قريباً", error: "حدث خطأ أثناء إرسال الرسالة", contactInfo: "معلومات الاتصال", contactDesc: "يمكنك التواصل معنا عبر الطرق التالية:", emailLabel: "البريد الإلكتروني", emailValue: "support@neohoosh.com", instagramLabel: "إنستغرام", instagramValue: "@neohoosh.ai", hoursLabel: "ساعات الدعم", hoursValue: "من السبت إلى الخميس، 9 صباحاً حتى 6 مساءً" },
    aboutPage: { header: "حول", headerBrand: "نيوهوش", headerDesc: "جسر إلى عالم الذكاء الاصطناعي", missionTitle: "مهمتنا", missionDesc: "تأسست نيوهوش بهدف تبسيط ونشر معرفة الذكاء الاصطناعي", visionTitle: "رؤيتنا", visionDesc: "أن نصبح المرجع الرئيسي والموثوق لتعلم واستخدام الذكاء الاصطناعي في إيران والمنطقة", teamTitle: "فريقنا", teamDesc: "يتكون فريق نيوهوش من محبي الذكاء الاصطناعي", founderName: "محمدرضا تقي معز", founderRole: "المؤسس والمدير التنفيذي", valueSimplicity: "البساطة", valueSimplicityDesc: "التعليم بلغة بسيطة ومفهومة", valueInnovation: "الابتكار", valueInnovationDesc: "مواكبة أحدث تطورات الذكاء الاصطناعي", valueQuality: "الجودة", valueQualityDesc: "تقديم محتوى دقيق وموثوق", valueCommunity: "المجتمع", valueCommunityDesc: "بناء مجتمع نشط من محبي الذكاء الاصطناعي" },
    footer: { brand: "نيوهوش", tagline: "جسر إلى عالم الذكاء الاصطناعي", quickLinks: "روابط سريعة", homepage: "الصفحة الرئيسية", learnMore: "اعرف المزيد", social: "التواصل الاجتماعي", copyright: "جميع الحقوق محفوظة" },
    chat: {
      title: "نيوهوش",
      subtitle: "اختر النموذج المطلوب",
      businessAdvisor: "مستشار الأعمال",
      businessDesc: "احصل على المشورة للأعمال والاستراتيجية",
      personalDev: "التطوير الشخصي",
      personalDesc: "إرشادات للنمو الشخصي ومهارات الحياة",
      openQuestions: "أسئلة مفتوحة",
      openQuestionsDesc: "أسئلة وأجوبة حول أي موضوع",
      adsGen: "إنشاء الإعلانات",
      adsGenDesc: "إنشاء محتوى إعلاني إبداعي",
      textToImage: "نص إلى صورة",
      textToImageDesc: "تحويل الأوصاف إلى صور مرئية",
      pleaseLogin: "يرجى تسجيل الدخول أولاً",
      selectModel: "اختر نموذجاً",
      typeMessage: "اكتب رسالتك",
      error: "خطأ في الاتصال بالروبوت",
      creditError: "نفدت أرصدة Lovable AI. يرجى إضافة الأرصدة من الإعدادات.",
      rateLimitError: "طلبات كثيرة جداً. يرجى الانتظار قليلاً.",
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
    const langsToTry: Array<keyof typeof translations> = [language as keyof typeof translations, "en", "fa"];
    for (const lang of langsToTry) {
      let val: any = (translations as any)[lang];
      for (const k of keys) {
        val = val?.[k];
        if (val === undefined) break;
      }
      if (typeof val === "string") return val;
    }
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
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
