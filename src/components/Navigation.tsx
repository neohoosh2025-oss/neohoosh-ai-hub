import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import neohooshLogo from "@/assets/neohoosh-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { t } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("با موفقیت خارج شدید");
    navigate("/");
  };

  const links = [
    { path: "/", label: t("home") },
    { path: "/articles", label: t("articles") },
    { path: "/products", label: t("products") },
    { path: "/services", label: t("services") },
    { path: "/chat", label: t("chatbot") },
    { path: "/neohi", label: "نئوهای", highlight: true },
    { path: "/about", label: t("about") },
    { path: "/contact", label: t("contact") },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src={neohooshLogo} 
              alt="NeoHoosh Logo" 
              className="h-12 w-auto transition-all duration-300 group-hover:scale-110 group-hover:brightness-125 group-hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all ${
                  link.highlight
                    ? "bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent hover:scale-105 px-3 py-1 rounded-md hover:bg-primary/10"
                    : `hover:text-primary ${
                        location.pathname === link.path
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`
                }`}
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
            <LanguageToggle />
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {t("logout")}
                </Button>
              </>
            ) : (
              <Link to="/auth?from=chat">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {t("login")}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  link.highlight
                    ? "bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent bg-primary/10"
                    : location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                خروج
              </Button>
            ) : (
              <Link to="/auth?from=chat" onClick={() => setIsOpen(false)} className="block">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <User className="h-4 w-4" />
                  ورود
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
