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
    toast.success("Logged out successfully");
    navigate("/");
  };

  const links = [
    { path: "/", label: t("home") },
    { path: "/articles", label: t("articles") },
    { path: "/tools", label: "ابزارها", highlight: true },
    { path: "/products", label: t("products") },
    { path: "/services", label: t("services") },
    { path: "/chat", label: t("chatbot") },
    { path: "/neohi", label: "NeoHi" },
    { path: "/about", label: t("about") },
    { path: "/contact", label: t("contact") },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
          {/* Logo - Responsive */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <img 
              src={neohooshLogo} 
              alt="NeoHoosh Logo" 
              className="h-10 sm:h-12 md:h-14 w-auto transition-all duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all relative group ${
                  link.highlight
                    ? "text-primary hover:text-primary/80"
                    : location.pathname === link.path
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 ${
                  location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>
            ))}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
            {user ? (
              <div className="flex items-center gap-2">
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
              </div>
            ) : (
              <Link to="/auth?from=chat">
                <Button size="sm" className="shadow-md">
                  {t("login")}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
            {user && (
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu - Optimized */}
        {isOpen && (
          <div className="lg:hidden pb-4 sm:pb-6 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-3 px-4 rounded-xl text-sm sm:text-base font-medium transition-all ${
                  link.highlight
                    ? "bg-primary/10 text-primary"
                    : location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="border-t border-border/50 my-3" />
            
            {user ? (
              <>
                <Link to="/profile" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full justify-start gap-3 py-6 text-base" size="lg">
                    <User className="h-5 w-5" />
                    {t("profile")}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 py-6 text-base"
                  size="lg"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  {t("logout")}
                </Button>
              </>
            ) : (
              <Link to="/auth?from=chat" onClick={() => setIsOpen(false)}>
                <Button className="w-full py-6 text-base shadow-md" size="lg">
                  {t("login")}
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
