import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-card/50 border-t border-border/50 mt-12 sm:mt-16 md:mt-20 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-l from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t("footer.brand")}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-sm sm:text-base">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("footer.homepage")}
                </Link>
              </li>
              <li>
                <Link to="/articles" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("articles")}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("products")}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("services")}
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("chatbot")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-sm sm:text-base">{t("footer.services")}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/tools" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                  ابزارهای AI
                </Link>
              </li>
              <li>
                <Link to="/neohi" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                  NEOHI
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("pricing")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-sm sm:text-base">{t("footer.contact")}</h4>
            <div className="flex flex-col gap-3">
              <a 
                href="https://instagram.com/neohoosh.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                <span>neohoosh.ai@</span>
              </a>
              <a 
                href="mailto:NEOHOOSH.2025@gmail.com"
                className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                <span>NEOHOOSH.2025@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/50 mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 text-center">
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
            {new Date().getFullYear()} © {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
