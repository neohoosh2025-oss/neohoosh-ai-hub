import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, Heart, Zap, Users, Award, TrendingUp,
  Rocket, Brain, Shield, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/neohoosh-logo-new.png";
import { MainLayout } from "@/components/layouts/MainLayout";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "هدف‌محور",
      description: "تمرکز بر ارائه بهترین راه‌حل‌های هوش مصنوعی برای نیازهای واقعی کاربران",
      color: "primary",
    },
    {
      icon: Heart,
      title: "کاربرمحور",
      description: "طراحی تجربه کاربری ساده و دسترسی آسان به پیشرفته‌ترین فناوری‌ها",
      color: "secondary",
    },
    {
      icon: Zap,
      title: "نوآوری",
      description: "پیشرو در به‌کارگیری جدیدترین مدل‌ها و فناوری‌های هوش مصنوعی",
      color: "accent",
    },
    {
      icon: Shield,
      title: "امنیت",
      description: "حفظ حریم خصوصی و امنیت داده‌های کاربران در اولویت قرار دارد",
      color: "success",
    },
  ];

  const team = [
    {
      name: "محمدرضا تقی معز",
      role: "بنیان‌گذار و مدیر عامل",
      avatar: "م.ت",
      bio: "متخصص هوش مصنوعی با بیش از 10 سال تجربه",
      gradient: "from-primary to-secondary",
    },
    {
      name: "سعید زارعی",
      role: "مدیر فنی",
      avatar: "س.ز",
      bio: "کارشناس معماری نرم‌افزار و سیستم‌های توزیع‌شده",
      gradient: "from-secondary to-accent",
    },
    {
      name: "پوریا رضایی",
      role: "مدیر محصول",
      avatar: "پ.ر",
      bio: "طراح تجربه کاربری با تمرکز بر AI/ML",
      gradient: "from-accent to-primary",
    },
    {
      name: "ارژنگ رضایی",
      role: "مدیر پشتیبانی",
      avatar: "ا.ر",
      bio: "متخصص خدمات مشتریان و موفقیت کاربران",
      gradient: "from-primary to-accent",
    },
  ];

  const milestones = [
    {
      year: "۱۴۰۱",
      title: "تاسیس نئوهوش",
      description: "شروع سفر با هدف دموکراتیزه کردن دسترسی به هوش مصنوعی",
    },
    {
      year: "۱۴۰۲",
      title: "راه‌اندازی نسخه بتا",
      description: "عرضه اولین نسخه با ۱۰۰۰ کاربر اولیه",
    },
    {
      year: "۱۴۰۳",
      title: "رشد سریع",
      description: "رسیدن به بیش از ۱۰,۰۰۰ کاربر فعال",
    },
    {
      year: "۱۴۰۴",
      title: "توسعه خدمات",
      description: "افزودن قابلیت‌های تولید تصویر و تحلیل محتوا",
    },
  ];

  const stats = [
    { value: "+۱۰k", label: "کاربر فعال" },
    { value: "+۱M", label: "درخواست پردازش شده" },
    { value: "۹۹.۹%", label: "آپتایم سرویس" },
    { value: "۲۴/۷", label: "پشتیبانی" },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-[image:var(--gradient-mesh)] opacity-40"></div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-6"
          >
            <div className="flex justify-center mb-6">
              <img src={logo} alt="Neohoosh" className="w-24 h-24 md:w-32 md:h-32" />
            </div>
            
            <Badge className="shadow-glow">
              <Sparkles className="w-4 h-4 ml-2" />
              درباره نئوهوش
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight">
              ما{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                هوش مصنوعی
              </span>
              {" "}را
              <br />
              برای همه ساده می‌کنیم
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              نئوهوش با هدف دموکراتیزه کردن دسترسی به پیشرفته‌ترین فناوری‌های هوش مصنوعی تاسیس شده است.
              ما معتقدیم همه باید بتوانند از قدرت AI بهره‌مند شوند.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2 font-display">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-display">ماموریت ما</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    ارائه دسترسی آسان و مقرون‌به‌صرفه به پیشرفته‌ترین مدل‌های هوش مصنوعی
                    برای افراد، کسب‌وکارها و سازمان‌های ایرانی.
                  </p>
                  <p>
                    ما می‌خواهیم پلی بین فناوری‌های پیچیده AI و نیازهای واقعی کاربران باشیم.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 border-secondary/20 shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                    <Rocket className="w-7 h-7 text-secondary" />
                  </div>
                  <CardTitle className="text-3xl font-display">چشم‌انداز ما</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    تبدیل شدن به پیشروترین پلتفرم هوش مصنوعی در منطقه و ایجاد اکوسیستمی
                    که نوآوری و خلاقیت را تقویت می‌کند.
                  </p>
                  <p>
                    آینده‌ای که در آن هر فردی بتواند با استفاده از هوش مصنوعی، ایده‌های خود را به واقعیت تبدیل کند.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">ارزش‌های ما</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              آنچه برایمان مهم است
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full text-center hover:shadow-lg transition-all border-2 hover:border-primary/30">
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-xl bg-${value.color}/10 flex items-center justify-center mx-auto mb-4`}>
                        <Icon className={`w-7 h-7 text-${value.color}`} />
                      </div>
                      <CardTitle className="text-xl">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">تیم ما</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              افراد پشت نئوهوش
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              تیمی متشکل از متخصصان با اشتیاق به هوش مصنوعی و فناوری
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-xl transition-all group">
                  <CardHeader>
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform`}>
                      {member.avatar}
                    </div>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <p className="text-sm text-primary font-medium">{member.role}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">سفر ما</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              نقاط عطف نئوهوش
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-all border-r-4 border-r-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {milestone.year}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 font-display">{milestone.title}</h3>
                        <p className="text-lg text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </MainLayout>
  );
};

export default About;
