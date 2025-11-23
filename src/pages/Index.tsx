import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, Sparkles, Zap, Shield, Rocket, 
  MessageCircle, Image, FileText, Check,
  Star, ArrowRight, Users, TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/neohoosh-logo-new.png";

const Index = () => {
  const aiServices = [
    {
      icon: Brain,
      title: "هوش مصنوعی مکالمه‌ای",
      description: "چت‌بات‌های هوشمند با مدل‌های پیشرفته Grok و Gemini",
      features: ["پاسخ‌های سریع", "درک زبان طبیعی", "حافظه مکالمه"],
      color: "primary",
    },
    {
      icon: Image,
      title: "تولید تصویر",
      description: "ساخت تصاویر حرفه‌ای با AI از روی متن",
      features: ["کیفیت بالا", "سبک‌های متنوع", "ویرایش هوشمند"],
      color: "secondary",
    },
    {
      icon: FileText,
      title: "تحلیل محتوا",
      description: "تحلیل و خلاصه‌سازی اسناد و متون",
      features: ["خلاصه‌سازی", "استخراج کلیدواژه", "ترجمه"],
      color: "accent",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "سرعت بالا",
      description: "پاسخ‌گویی در کسری از ثانیه با بهترین مدل‌های AI",
    },
    {
      icon: Shield,
      title: "امنیت کامل",
      description: "رمزنگاری end-to-end و حفاظت از داده‌های شما",
    },
    {
      icon: Rocket,
      title: "به‌روزرسانی مداوم",
      description: "دسترسی به جدیدترین مدل‌های هوش مصنوعی",
    },
    {
      icon: Users,
      title: "پشتیبانی ۲۴/۷",
      description: "تیم پشتیبانی همیشه در کنار شماست",
    },
  ];

  const testimonials = [
    {
      name: "علی محمدی",
      role: "توسعه‌دهنده نرم‌افزار",
      content: "نئوهوش کار من رو خیلی راحت‌تر کرده. از چت‌بات برای کدنویسی استفاده می‌کنم.",
      rating: 5,
    },
    {
      name: "سارا احمدی",
      role: "طراح گرافیک",
      content: "تولید تصویر با AI فوق‌العادست! کیفیت تصاویر حرفه‌ای و متنوع.",
      rating: 5,
    },
    {
      name: "رضا کریمی",
      role: "بازاریاب دیجیتال",
      content: "برای تولید محتوا و تحلیل داده‌ها از نئوهوش استفاده می‌کنم. عالیه!",
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: "رایگان",
      price: "۰",
      description: "برای شروع و آزمایش",
      features: [
        "۱۰۰ درخواست در ماه",
        "دسترسی به مدل‌های پایه",
        "پشتیبانی ایمیل",
      ],
      cta: "شروع رایگان",
      popular: false,
    },
    {
      name: "حرفه‌ای",
      price: "۴۹۹,۰۰۰",
      description: "برای کاربران حرفه‌ای",
      features: [
        "۵,۰۰۰ درخواست در ماه",
        "دسترسی به تمام مدل‌ها",
        "پشتیبانی اولویت‌دار",
        "API اختصاصی",
      ],
      cta: "خرید اشتراک",
      popular: true,
    },
    {
      name: "سازمانی",
      price: "تماس بگیرید",
      description: "برای تیم‌ها و سازمان‌ها",
      features: [
        "درخواست نامحدود",
        "مدل‌های اختصاصی",
        "پشتیبانی ۲۴/۷",
        "آموزش تیم",
      ],
      cta: "تماس با ما",
      popular: false,
    },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient Mesh */}
        <div className="absolute inset-0 bg-[image:var(--gradient-mesh)] opacity-60"></div>
        
        <div className="container mx-auto px-4 pt-20 pb-32 relative">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-5xl mx-auto text-center space-y-8"
          >
            {/* Logo */}
            <motion.div variants={fadeInUp} className="flex justify-center mb-8">
              <div className="relative">
                <img 
                  src={logo} 
                  alt="Neohoosh" 
                  className="w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl"
                />
                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse"></div>
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div variants={fadeInUp} className="flex justify-center">
              <Badge className="px-4 py-2 text-sm shadow-glow">
                <Sparkles className="w-4 h-4 ml-2" />
                جدیدترین مدل‌های AI در دسترس
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold font-display leading-tight"
            >
              دنیای{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                هوش مصنوعی
              </span>
              <br />
              برای همه
            </motion.h1>

            {/* Description */}
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              دسترسی آسان به قدرتمندترین مدل‌های هوش مصنوعی.
              از چت‌بات‌های هوشمند تا تولید تصویر و تحلیل محتوا.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Link to="/neohi">
                <Button size="lg" className="text-lg px-8 py-6 shadow-glow hover:shadow-xl transition-all group">
                  <MessageCircle className="ml-2 group-hover:scale-110 transition-transform" />
                  شروع گفتگو با AI
                  <ArrowRight className="mr-2" />
                </Button>
              </Link>
              <Link to="/chat">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 border-2 hover:bg-primary/5"
                >
                  مشاهده امکانات
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto"
            >
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary">+۱۰k</div>
                <div className="text-sm text-muted-foreground mt-1">کاربر فعال</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary">+۱M</div>
                <div className="text-sm text-muted-foreground mt-1">درخواست پردازش</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-accent">۹۹.۹%</div>
                <div className="text-sm text-muted-foreground mt-1">آپتایم سرویس</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* AI Services Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">خدمات هوش مصنوعی</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              ابزارهای قدرتمند AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              از پیشرفته‌ترین مدل‌های هوش مصنوعی برای کسب‌وکار و پروژه‌های خود استفاده کنید
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {aiServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 group">
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-xl bg-${service.color}/10 flex items-center justify-center mb-4 group-hover:shadow-glow transition-all`}>
                        <Icon className={`w-7 h-7 text-${service.color}`} />
                      </div>
                      <CardTitle className="text-2xl">{service.title}</CardTitle>
                      <CardDescription className="text-base">{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-success flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">چرا نئوهوش؟</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              ویژگی‌های منحصر به فرد
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="text-center hover:shadow-lg transition-all p-6 border-2 hover:border-primary/30">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">نظرات کاربران</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              کاربران ما چه می‌گویند
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                      ))}
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      "{testimonial.content}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">قیمت‌گذاری</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              پلن مناسب خود را انتخاب کنید
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              با هر بودجه‌ای می‌توانید از قدرت هوش مصنوعی استفاده کنید
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`h-full relative ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-glow scale-105' 
                    : 'hover:shadow-lg'
                } transition-all`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <Badge className="bg-gradient-to-r from-primary to-secondary shadow-lg">
                        <TrendingUp className="w-4 h-4 ml-1" />
                        محبوب‌ترین
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold font-display">{plan.price}</span>
                      {plan.price !== "تماس بگیرید" && (
                        <span className="text-muted-foreground mr-2">تومان/ماه</span>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/auth" className="block">
                      <Button 
                        className={`w-full ${
                          plan.popular 
                            ? 'shadow-glow' 
                            : ''
                        }`}
                        variant={plan.popular ? 'default' : 'outline'}
                        size="lg"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20 shadow-2xl max-w-4xl mx-auto">
              <CardContent className="p-12 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-6 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
                  آماده شروع هستید؟
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  همین الان به هزاران کاربر نئوهوش بپیوندید و از قدرت هوش مصنوعی برای رسیدن به اهدافتان استفاده کنید.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth">
                    <Button size="lg" className="text-lg px-8 py-6 shadow-glow">
                      <Rocket className="ml-2" />
                      ثبت‌نام رایگان
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                      تماس با تیم فروش
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
