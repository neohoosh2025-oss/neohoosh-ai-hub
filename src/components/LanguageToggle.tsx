import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const cycleLanguage = () => {
    if (language === "fa") setLanguage("en");
    else if (language === "en") setLanguage("ar");
    else setLanguage("fa");
  };

  const getLanguageLabel = () => {
    if (language === "fa") return "EN";
    if (language === "en") return "AR";
    return "FA";
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleLanguage}
      className="gap-2 hover:glow-neon transition-all"
    >
      <Languages className="h-4 w-4" />
      {getLanguageLabel()}
    </Button>
  );
}
