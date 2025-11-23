import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, Image, FileText, MessageCircle, Sparkles,
  Check, Zap, Shield, TrendingUp, Code, Palette,
  BarChart, Globe, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Services = () => {
  const mainServices = [
    {
      icon: Brain,
      title: "هوش مصنوعی مکالمه‌ای",
      description: "چت‌بات‌های پیشرفته با قابلیت درک عمیق زبان فارسی و پاسخ‌گویی هوشمند",
      features: [
        "پشتیبانی از مدل‌های Grok 4.1 و Gemini 2.5",
        "حافظه مکالمه برای تجربه بهتر",
        "قابلیت پردازش تصاویر و اسناد",
        "API اختصاصی برای یکپارچه‌سازی",
      ],
      gradient: "from-primary to-secondary",
      link: "/chat",
    },
    {
      icon: Image,
      title: "تولید و ویرایش تصویر",
      description: "ساخت تصاویر حرفه‌ای با کیفیت بالا از روی توضیحات متنی",
      features: [
        "تولید تصویر با مدل‌های پیشرفته",
        "ویرایش هوشمند تصاویر موجود",
        "سبک‌های متنوع (واقع‌گرایانه، هنری، کارتونی)",
        "کنترل کامل بر ابعاد و کیفیت",
      ],
      gradient: "from-secondary to-accent",
      link: "/chat",
    },
    {
      icon: FileText,
      title: "تحلیل و پردازش محتوا",
      description: "تحلیل هوشمند اسناد، خلاصه‌سازی، و استخراج اطلاعات کلیدی",
      features: [
        "خلاصه‌سازی اسناد طولانی",
        "استخراج نکات کلیدی و کلیدواژه‌ها",
        "ترجمه چندزبانه",
        "تحلیل احساسات متون",
      ],
      gradient: "from-accent to-primary",
      link: "/chat",
    },
  ];

  const additionalServices = [
    {
      icon: Code,
      title: "کمک به کدنویسی",
      description: "دستیار هوشمند برای توسعه‌دهندگان",
    },
    {
      icon: Palette,
      title: "تولید محتوای خلاق",
      description: "ایده‌پردازی و تولید محتوای تبلیغاتی",
    },
    {
      icon: BarChart,
      title: "تحلیل داده",
      description: "تحلیل و بصری‌سازی داده‌های کسب‌وکار",
    },
    {
      icon: Globe,
      title: "ترجمه و محلی‌سازی",
      description: "ترجمه حرفه‌ای با درک متن",
    },
  ];

  const useCases = [
    {
      industry: "آموزش",
      description: "دستیار آموزشی هوشمند برای دانشجویان و معلمان",
      icon: "📚",
    },
    {
      industry: "بازاریابی",
      description: "تولید محتوای تبلیغاتی و تحلیل بازار",
      icon: "📈",
    },
    {
      industry: "توسعه نرم‌افزار",
      description: "کمک به کدنویسی و رفع اشکال",
      icon: "💻",
    },
    {
      industry: "طراحی گرافیک",
      description: "تولید تصاویر و ایده‌های بصری",
      icon: "🎨",
    },
  ];

  return (
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
            <Badge className="shadow-glow">
              <Sparkles className="w-4 h-4 ml-2" />
              خدمات هوش مصنوعی
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight">
              ابزارهای{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                هوش مصنوعی
              </span>
              <br />
              برای هر نیازی
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              از چت‌بات‌های هوشمند تا تولید تصویر و تحلیل محتوا،
              تمام ابزارهای AI که نیاز دارید در یک پلتفرم.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/chat">
                <Button size="lg" className="text-lg px-8 py-6 shadow-glow">
                  <MessageCircle className="ml-2" />
                  شروع رایگان
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                  مشاوره تخصصی
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">خدمات اصلی</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              قابلیت‌های پیشرفته AI
            </h2>
          </motion.div>

          <div className="space-y-12 max-w-6xl mx-auto">
            {mainServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className={`overflow-hidden border-2 hover:shadow-2xl transition-all group ${
                    index % 2 === 0 ? '' : 'md:mr-12'
                  }`}>
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className={`p-8 md:p-12 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        
                        <h3 className="text-3xl font-bold mb-4 font-display">{service.title}</h3>
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                          {service.description}
                        </p>

                        <ul className="space-y-3 mb-8">
                          {service.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Link to={service.link}>
                          <Button className="group/btn shadow-glow">
                            امتحان کنید
                            <ArrowRight className="mr-2 group-hover/btn:-translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>

                      <div className={`bg-gradient-to-br ${service.gradient} p-12 flex items-center justify-center ${
                        index % 2 === 0 ? 'md:order-2' : 'md:order-1'
                      }`}>
                        <Icon className="w-48 h-48 text-white/20" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">قابلیت‌های بیشتر</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              ابزارهای تخصصی
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {additionalServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="text-center hover:shadow-lg transition-all border-2 hover:border-primary/30 p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">کاربردها</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              برای هر صنعتی
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              از آموزش تا بازاریابی، نئوهوش در خدمت تمام حوزه‌هاست
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.industry}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-all text-center p-6">
                  <div className="text-5xl mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{useCase.industry}</h3>
                  <p className="text-muted-foreground">{useCase.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20 shadow-2xl max-w-4xl mx-auto">
              <CardContent className="p-12 text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-6 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
                  نیاز به راه‌حل سفارشی دارید؟
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  تیم ما آماده است تا بهترین راه‌حل هوش مصنوعی را برای نیازهای خاص شما طراحی کند.
                </p>
                <Link to="/contact">
                  <Button size="lg" className="text-lg px-8 py-6 shadow-glow">
                    <MessageCircle className="ml-2" />
                    درخواست مشاوره
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;
