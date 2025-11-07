import { Sparkles, Target, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              درباره <span className="text-foreground">نئوهوش</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              ماموریت ما گسترش دانش هوش مصنوعی در جامعه فارسی‌زبان است
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Mission */}
            <div className="p-8 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center glow-neon">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">مأموریت ما</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                نئوهوش با هدف آموزش کار با ابزارهای هوش مصنوعی، معرفی قابلیت‌های جدید
                و ارائه محتوای تخصصی برای شروع کسب‌وکارهای هوشمند ایجاد شده است.
                ما باور داریم که هوش مصنوعی باید در دسترس همه باشد و هر فردی بتواند
                از قدرت این فناوری برای بهبود زندگی شخصی و کاری خود استفاده کند.
              </p>
            </div>

            {/* Vision */}
            <div className="p-8 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center glow-neon">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">چشم‌انداز</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                ما در نئوهوش تلاش می‌کنیم تا بزرگترین منبع آموزشی فارسی در زمینه
                هوش مصنوعی باشیم. هدف ما ایجاد جامعه‌ای از یادگیرندگان و متخصصان
                است که با کمک یکدیگر و استفاده از AI، آینده بهتری بسازند.
              </p>
            </div>

            {/* Team */}
            <div className="p-8 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center glow-neon">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">تیم نئوهوش</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                تیم ما متشکل از متخصصان حوزه هوش مصنوعی، توسعه‌دهندگان نرم‌افزار
                و تولیدکنندگان محتوا است که با اشتیاق و علاقه به این فناوری،
                در حال ایجاد محتوای با کیفیت و کاربردی هستند.
              </p>
            </div>

            {/* Values */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-background border border-border text-center">
                <h3 className="font-semibold mb-2">سادگی</h3>
                <p className="text-sm text-muted-foreground">
                  آموزش به زبان ساده و قابل فهم
                </p>
              </div>
              <div className="p-6 rounded-xl bg-background border border-border text-center">
                <h3 className="font-semibold mb-2">کاربردی</h3>
                <p className="text-sm text-muted-foreground">
                  محتوای عملی و قابل استفاده
                </p>
              </div>
              <div className="p-6 rounded-xl bg-background border border-border text-center">
                <h3 className="font-semibold mb-2">نوآوری</h3>
                <p className="text-sm text-muted-foreground">
                  همیشه به‌روز و پیشرو
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
