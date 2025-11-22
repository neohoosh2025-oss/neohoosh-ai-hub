import { MessageCircle, Users, Camera, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { icon: MessageCircle, label: "چت‌ها", path: "/neohi", isActive: location.pathname === "/neohi" },
    { icon: Users, label: "مخاطبین", path: "/neohi/contacts", isActive: location.pathname === "/neohi/contacts" },
    { icon: Camera, label: "استوری", path: "/neohi/stories", isActive: location.pathname === "/neohi/stories" },
    { icon: User, label: "پروفایل", path: "/neohi/profile", isActive: location.pathname === "/neohi/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px] min-h-[48px]",
                item.isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn("w-5 h-5", item.isActive && "animate-scale-in")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
