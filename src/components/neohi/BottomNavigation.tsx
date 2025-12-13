import { MessageCircle, Users, Phone, Settings, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  onSearchToggle?: () => void;
  showSearch?: boolean;
}

const BottomNavigation = ({ onSearchToggle, showSearch }: BottomNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { 
      icon: Settings, 
      path: "/neohi?tab=settings", 
      isActive: location.search.includes("tab=settings"),
      label: "settings"
    },
    { 
      icon: Users, 
      path: "/neohi?tab=contacts", 
      isActive: location.search.includes("tab=contacts"),
      label: "contacts"
    },
    { 
      icon: Phone, 
      path: "/neohi?tab=calls", 
      isActive: location.search.includes("tab=calls"),
      label: "calls"
    },
    { 
      icon: MessageCircle, 
      path: "/neohi", 
      isActive: location.pathname === "/neohi" && !location.search,
      label: "chats"
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-900 safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-4">
        {/* Search Button */}
        {onSearchToggle && (
          <button
            onClick={onSearchToggle}
            className={cn(
              "flex items-center justify-center p-3 rounded-full transition-all duration-200",
              showSearch
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            )}
          >
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}
        
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center justify-center p-3 rounded-full transition-all duration-200",
                item.isActive
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              )}
            >
              <Icon 
                className="w-5 h-5" 
                strokeWidth={1.5}
                fill={item.isActive ? "currentColor" : "none"}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;