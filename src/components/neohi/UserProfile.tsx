import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, MessageCircle, Phone, Video, Image as ImageIcon, FileText, Link2, Trash2, Ban, AlertTriangle, X } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface UserProfileProps {
  userId: string;
  onClose: () => void;
  onSendMessage?: () => void;
}

export function UserProfile({ userId, onClose, onSendMessage }: UserProfileProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("neohi_users")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) setUser(data);
    setLoading(false);
  };

  const getStatusText = () => {
    if (!user) return "";
    if (user.is_online) return "آنلاین";
    if (user.last_seen) {
      const lastSeen = new Date(user.last_seen);
      const now = new Date();
      const diff = now.getTime() - lastSeen.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return "لحظاتی پیش";
      if (minutes < 60) return `${minutes} دقیقه پیش`;
      if (hours < 24) return `${hours} ساعت پیش`;
      return `${days} روز پیش`;
    }
    return "اخیراً";
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-neohi-bg-main">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-neohi-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-full overflow-y-auto bg-neohi-bg-main">
      {/* Fixed Header */}
      <header className="sticky top-0 z-10 h-[50px] bg-neohi-bg-sidebar/95 backdrop-blur-lg border-b border-neohi-border px-4 flex items-center justify-center relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute left-4 h-9 w-9 rounded-full hover:bg-neohi-bg-hover text-neohi-text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-semibold text-neohi-text-primary">Profile</h1>
      </header>

      {/* Cover Section */}
      <div className="h-[130px] bg-gradient-to-br from-neohi-accent/20 to-primary/20 relative overflow-hidden">
        {user.avatar_url && (
          <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40" style={{ backgroundImage: `url(${user.avatar_url})` }} />
        )}
      </div>

      {/* Hero Avatar - Overlapping Cover */}
      <div className="px-6 -mt-16 mb-6">
        <div className="flex flex-col items-center">
          <div 
            className="cursor-pointer"
            onClick={() => user.avatar_url && setShowAvatarDialog(true)}
          >
            <Avatar className="h-32 w-32 ring-4 ring-neohi-bg-main shadow-2xl">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-neohi-accent to-primary text-white text-4xl font-bold">
                {user.display_name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <h2 className="text-2xl font-bold text-neohi-text-primary mt-4">
            {user.display_name || "کاربر"}
          </h2>
          <p className="text-neohi-text-secondary text-sm mt-1 flex items-center gap-2">
            {user.is_online ? (
              <>
                <span className="w-2 h-2 rounded-full bg-neohi-online animate-pulse"></span>
                آنلاین
              </>
            ) : (
              <span>{getStatusText()}</span>
            )}
          </p>
        </div>
      </div>

      {/* Bio Section */}
      {user.bio && (
        <div className="px-6 mb-6">
          <div className="bg-neohi-bg-sidebar rounded-2xl p-4 border border-neohi-border">
            <h3 className="text-xs text-neohi-text-secondary mb-2 font-medium">درباره</h3>
            <p className="text-neohi-text-primary text-sm leading-relaxed">{user.bio}</p>
          </div>
        </div>
      )}

      {/* Contact Info */}
      {user.phone && (
        <div className="px-6 mb-6">
          <div className="bg-neohi-bg-sidebar rounded-2xl p-4 border border-neohi-border">
            <h3 className="text-xs text-neohi-text-secondary mb-2 font-medium">شماره تماس</h3>
            <p className="text-neohi-text-primary text-sm">{user.phone}</p>
          </div>
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="px-6 mb-6 grid grid-cols-3 gap-3">
        <Button
          onClick={onSendMessage}
          className="flex flex-col items-center gap-2 h-auto py-4 bg-neohi-accent hover:bg-neohi-accent/90 text-white rounded-2xl"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-xs">پیام</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4 rounded-2xl border-neohi-border hover:bg-neohi-bg-hover text-neohi-text-primary"
        >
          <Phone className="h-5 w-5" />
          <span className="text-xs">تماس</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4 rounded-2xl border-neohi-border hover:bg-neohi-bg-hover text-neohi-text-primary"
        >
          <Video className="h-5 w-5" />
          <span className="text-xs">ویدیو</span>
        </Button>
      </div>

      {/* Media Section */}
      <div className="px-6 mb-6">
        <div className="bg-neohi-bg-sidebar rounded-2xl p-4 border border-neohi-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neohi-text-primary">رسانه و فایل‌ها</h3>
            <Button variant="ghost" size="sm" className="text-neohi-accent text-xs h-auto p-0">
              مشاهده همه
            </Button>
          </div>
          
          {/* Media Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-neohi-bg-hover rounded-xl flex items-center justify-center border border-neohi-border">
                <ImageIcon className="h-6 w-6 text-neohi-text-secondary" />
              </div>
            ))}
          </div>

          {/* File Types */}
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neohi-bg-hover transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <span className="text-sm text-neohi-text-primary">فایل‌ها</span>
              </div>
              <span className="text-xs text-neohi-text-secondary">0</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neohi-bg-hover transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-green-500" />
                </div>
                <span className="text-sm text-neohi-text-primary">لینک‌ها</span>
              </div>
              <span className="text-xs text-neohi-text-secondary">0</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="px-6 pb-6 space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-12 rounded-2xl border-neohi-border hover:bg-red-500/10 hover:border-red-500/50 text-neohi-text-primary hover:text-red-500"
        >
          <Trash2 className="h-5 w-5" />
          پاک کردن چت
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-12 rounded-2xl border-neohi-border hover:bg-orange-500/10 hover:border-orange-500/50 text-neohi-text-primary hover:text-orange-500"
        >
          <Ban className="h-5 w-5" />
          مسدود کردن کاربر
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-12 rounded-2xl border-neohi-border hover:bg-yellow-500/10 hover:border-yellow-500/50 text-neohi-text-primary hover:text-yellow-500"
        >
          <AlertTriangle className="h-5 w-5" />
          گزارش کاربر
        </Button>
      </div>

      {/* Avatar Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="max-w-4xl w-[95vw] h-[95vh] p-0 bg-black/95 border-none overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              onClick={() => setShowAvatarDialog(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={user.avatar_url} 
              alt="Profile" 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
