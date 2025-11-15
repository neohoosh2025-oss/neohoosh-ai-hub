import { Sparkles, Target, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("about.header")} <span className="text-foreground">{t("about.headerBrand")}</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("about.headerDesc")}
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
                <h2 className="text-2xl font-bold">{t("about.missionTitle")}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.missionDesc")}
              </p>
            </div>

            {/* Vision */}
            <div className="p-8 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center glow-neon">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">{t("about.visionTitle")}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.visionDesc")}
              </p>
            </div>

            {/* Team */}
            <div className="p-8 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center glow-neon">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">{t("about.teamTitle")}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {t("about.teamDesc")}
              </p>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h3 className="font-semibold text-lg mb-2">{t("about.founderName")}</h3>
                <p className="text-sm text-muted-foreground">{t("about.founderRole")}</p>
              </div>
            </div>

            {/* Values */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-background border border-border text-center">
                <h3 className="font-semibold mb-2">سادگی</h3>
                <p className="text-sm text-muted-foreground">
                  آموزش به زبان ساده و قابل فهم
                </p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all">
                <h3 className="font-semibold text-lg mb-2">{t("about.valueInnovation")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("about.valueInnovationDesc")}
                </p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all">
                <h3 className="font-semibold text-lg mb-2">{t("about.valueQuality")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("about.valueQualityDesc")}
                </p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all">
                <h3 className="font-semibold text-lg mb-2">{t("about.valueCommunity")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("about.valueCommunityDesc")}
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
