import { MessageCircle, Users, Camera, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { icon: MessageCircle, path: "/neohi", tab: "chats", isActive: location.pathname === "/neohi" && !location.search },
    { icon: Users, path: "/neohi?tab=contacts", tab: "contacts", isActive: location.search.includes("tab=contacts") },
    { icon: Camera, path: "/neohi?tab=stories", tab: "stories", isActive: location.search.includes("tab=stories") },
    { icon: User, path: "/neohi?tab=settings", tab: "settings", isActive: location.search.includes("tab=settings") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-[48px] min-h-[48px]",
                item.isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn("w-6 h-6", item.isActive && "animate-scale-in")} />
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
