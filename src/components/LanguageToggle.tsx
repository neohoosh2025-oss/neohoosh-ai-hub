import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "fa" ? "en" : "fa")}
      className="gap-2 hover:glow-neon transition-all"
    >
      <Languages className="h-4 w-4" />
      {language === "fa" ? "EN" : "FA"}
    </Button>
  );
}
