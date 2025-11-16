import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code, Sparkles, Zap, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Services = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">{t("servicesPage.title")}</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("servicesPage.subtitle")}
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
                {t("servicesPage.mainService")}
              </h2>
            </div>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {t("servicesPage.description")}
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 rounded-xl bg-background border border-border">
                <Sparkles className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{t("servicesPage.modernDesign")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("servicesPage.modernDesignDesc")}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border">
                <Zap className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{t("servicesPage.fastDev")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("servicesPage.fastDevDesc")}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border">
                <Code className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{t("servicesPage.qualityCode")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("servicesPage.qualityCodeDesc")}
                </p>
              </div>
            </div>

            <Link to="/contact">
              <Button size="lg" className="gap-2 glow-neon-strong">
                {t("servicesPage.requestCoop")}
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

    </div>
  );
};

export default Services;
