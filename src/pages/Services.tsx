import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code, Sparkles, Zap, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-primary glow-neon">خدمات</span> نئوهوش
            </h1>
            <p className="text-lg text-muted-foreground">
              طراحی و توسعه وب‌سایت و اپلیکیشن با قدرت هوش مصنوعی
            </p>
          </div>
        </div>
      </section>

      {/* Main Service */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 md:p-12 border-primary/20 glow-neon">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center glow-neon">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                طراحی سایت و اپلیکیشن با هوش مصنوعی
              </h2>
            </div>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              تیم نئوهوش با استفاده از جدیدترین ابزارها و فناوری‌های هوش مصنوعی، 
              وب‌سایت و اپلیکیشن‌های مدرن و کاربردی را برای شما طراحی می‌کند.
              از ایده تا اجرا، ما در کنار شما هستیم.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 rounded-xl bg-background border border-border">
                <Sparkles className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">طراحی مدرن</h3>
                <p className="text-sm text-muted-foreground">
                  طراحی UI/UX زیبا و کاربرپسند
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border">
                <Zap className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">توسعه سریع</h3>
                <p className="text-sm text-muted-foreground">
                  اجرای پروژه با سرعت بالا
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border">
                <Code className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">کد باکیفیت</h3>
                <p className="text-sm text-muted-foreground">
                  کدنویسی استاندارد و قابل نگهداری
                </p>
              </div>
            </div>

            <Link to="/contact">
              <Button size="lg" className="gap-2 glow-neon-strong">
                درخواست همکاری
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              نمونه کارهای ما
            </h2>
            <p className="text-muted-foreground mb-8">
              به زودی نمونه کارهای ما را در این بخش مشاهده خواهید کرد
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border flex items-center justify-center"
                >
                  <span className="text-muted-foreground">به زودی...</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
