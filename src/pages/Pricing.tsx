import { useState } from "react";
import { Check, X, Zap, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingTier {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: string;
  priceEn: string;
  period: string;
  periodEn: string;
  icon: any;
  variant: "default" | "premium" | "glass";
  popular?: boolean;
  features: PricingFeature[];
  cta: string;
  ctaEn: string;
}

const Pricing = () => {
  const { t, language } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const pricingTiers: PricingTier[] = [
    {
      id: "starter",
      name: "استارتر",
      nameEn: "Starter",
      description: "برای شروع و آزمایش هوش مصنوعی",
      descriptionEn: "Perfect for getting started with AI",
      price: billingCycle === "monthly" ? "رایگان" : "رایگان",
      priceEn: billingCycle === "monthly" ? "Free" : "Free",
      period: "",
      periodEn: "",
      icon: Sparkles,
      variant: "glass",
      features: [
        { name: "دسترسی به 3 مدل AI پایه", included: true },
        { name: "۱۰۰ درخواست در ماه", included: true },
        { name: "پشتیبانی ایمیل", included: true },
        { name: "تحلیل پیشرفته", included: false },
        { name: "API دسترسی", included: false },
        { name: "پشتیبانی اختصاصی", included: false },
      ],
      cta: "شروع رایگان",
      ctaEn: "Get Started",
    },
    {
      id: "professional",
      name: "حرفه‌ای",
      nameEn: "Professional",
      description: "برای کسب‌وکارهای در حال رشد",
      descriptionEn: "For growing businesses",
      price: billingCycle === "monthly" ? "۴۹۹,۰۰۰" : "۴,۷۸۸,۰۰۰",
      priceEn: billingCycle === "monthly" ? "$49" : "$470",
      period: billingCycle === "monthly" ? "/ ماه" : "/ سال",
      periodEn: billingCycle === "monthly" ? "/ month" : "/ year",
      icon: Zap,
      variant: "premium",
      popular: true,
      features: [
        { name: "دسترسی به همه مدل‌های AI", included: true },
        { name: "۵,۰۰۰ درخواست در ماه", included: true },
        { name: "پشتیبانی اولویت‌دار", included: true },
        { name: "تحلیل پیشرفته", included: true },
        { name: "API دسترسی", included: true },
        { name: "پشتیبانی اختصاصی", included: false },
      ],
      cta: "انتخاب پلن حرفه‌ای",
      ctaEn: "Choose Professional",
    },
    {
      id: "enterprise",
      name: "سازمانی",
      nameEn: "Enterprise",
      description: "برای سازمان‌های بزرگ",
      descriptionEn: "For large organizations",
      price: "تماس بگیرید",
      priceEn: "Custom",
      period: "",
      periodEn: "",
      icon: Crown,
      variant: "default",
      features: [
        { name: "دسترسی نامحدود به همه مدل‌ها", included: true },
        { name: "درخواست‌های نامحدود", included: true },
        { name: "پشتیبانی ۲۴/۷", included: true },
        { name: "تحلیل پیشرفته", included: true },
        { name: "API دسترسی", included: true },
        { name: "پشتیبانی اختصاصی", included: true },
      ],
      cta: "تماس با فروش",
      ctaEn: "Contact Sales",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 } as const,
    visible: {
      opacity: 1,
      y: 0,
    } as const,
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge variant="secondary" className="mb-4 animate-float">
              {language === "fa" ? "قیمت‌گذاری شفاف" : "Transparent Pricing"}
            </Badge>
            <h1 className="text-display-xl font-bold mb-4 bg-gradient-to-l from-primary via-secondary to-accent bg-clip-text text-transparent">
              {language === "fa" ? "پلنی مناسب برای هر نیازی" : "A Plan for Every Need"}
            </h1>
            <p className="text-body-lg text-muted-foreground mb-8">
              {language === "fa"
                ? "از استارتاپ‌های نوپا تا سازمان‌های بزرگ، ما پلنی برای شما داریم"
                : "From startups to enterprises, we have a plan for you"}
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 p-1 bg-card rounded-xl border border-border shadow-sm">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  billingCycle === "monthly"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {language === "fa" ? "ماهانه" : "Monthly"}
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  billingCycle === "yearly"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {language === "fa" ? "سالانه" : "Yearly"}
                <span className="mr-2 text-xs text-accent-foreground bg-accent px-2 py-0.5 rounded-full">
                  {language === "fa" ? "۲۰٪ تخفیف" : "20% OFF"}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
            {pricingTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <motion.div key={tier.id} variants={cardVariants}>
                  <Card
                    className={`relative h-full flex flex-col transition-all duration-300 ${
                      tier.popular
                        ? "border-primary shadow-glow-strong scale-105 md:scale-110"
                        : "hover:shadow-lg hover:scale-105"
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-glow animate-pulse-glow">
                          {language === "fa" ? "محبوب‌ترین" : "Most Popular"}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-8 pt-10">
                      <div className="mx-auto mb-4 p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 w-fit">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-bold">
                        {language === "fa" ? tier.name : tier.nameEn}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {language === "fa" ? tier.description : tier.descriptionEn}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                      {/* Price */}
                      <div className="text-center mb-8 pb-8 border-b border-border">
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-4xl font-bold bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">
                            {language === "fa" ? tier.price : tier.priceEn}
                          </span>
                          {tier.period && (
                            <span className="text-muted-foreground text-sm">
                              {language === "fa" ? tier.period : tier.periodEn}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-4 mb-8 flex-1">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div
                              className={`p-1 rounded-full mt-0.5 ${
                                feature.included
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {feature.included ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </div>
                            <span
                              className={`text-sm ${
                                feature.included ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <Button
                        variant={tier.variant}
                        size="lg"
                        className="w-full"
                      >
                        {language === "fa" ? tier.cta : tier.ctaEn}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-display-lg font-bold mb-4">
              {language === "fa" ? "سوالات متداول" : "Frequently Asked Questions"}
            </h2>
            <p className="text-muted-foreground">
              {language === "fa"
                ? "پاسخ سوالات رایج درباره قیمت‌گذاری و پلن‌ها"
                : "Common questions about pricing and plans"}
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            {[
              {
                q: "آیا می‌توانم پلن خود را تغییر دهم؟",
                qEn: "Can I change my plan?",
                a: "بله، می‌توانید در هر زمان پلن خود را ارتقا یا کاهش دهید.",
                aEn: "Yes, you can upgrade or downgrade your plan at any time.",
              },
              {
                q: "آیا تضمین بازگشت وجه دارید؟",
                qEn: "Do you offer a money-back guarantee?",
                a: "بله، ۳۰ روز تضمین بازگشت وجه بدون قید و شرط.",
                aEn: "Yes, we offer a 30-day money-back guarantee.",
              },
              {
                q: "روش‌های پرداخت چیست؟",
                qEn: "What payment methods do you accept?",
                a: "تمام کارت‌های بانکی ایران و درگاه‌های معتبر.",
                aEn: "All major credit cards and payment gateways.",
              },
              {
                q: "آیا تخفیف سالانه دارید؟",
                qEn: "Do you offer annual discounts?",
                a: "بله، با پرداخت سالانه ۲۰٪ تخفیف دریافت می‌کنید.",
                aEn: "Yes, you get 20% off with annual billing.",
              },
            ].map((faq, idx) => (
              <Card key={idx} className="hover-scale">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "fa" ? faq.q : faq.qEn}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {language === "fa" ? faq.a : faq.aEn}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
            <CardContent className="text-center py-12">
              <h2 className="text-display-md font-bold mb-4">
                {language === "fa" ? "نیاز به پلن سفارشی دارید؟" : "Need a Custom Plan?"}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                {language === "fa"
                  ? "تیم ما آماده است تا بهترین راه‌حل را برای نیازهای شما طراحی کند"
                  : "Our team is ready to design the best solution for your needs"}
              </p>
              <Button size="lg" variant="premium">
                {language === "fa" ? "تماس با فروش" : "Contact Sales"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
