import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MessageCircle, Phone, Video, BellOff, MoreHorizontal, Image as ImageIcon, FileText, Link2, Trash2, Ban, AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  if (!user && !loading) return null;

  return (
    <AnimatePresence>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-[95vw] max-h-[90vh] p-0 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="h-[500px] flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="overflow-y-auto max-h-[90vh]"
            >
              {/* Header Section */}
              <div className="relative pt-8 pb-6 px-6 text-center bg-gradient-to-br from-primary/5 via-background to-background">
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground transition-all hover:scale-110"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Profile Photo */}
                <div className="relative inline-block mb-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                    onClick={() => user.avatar_url && setShowAvatarDialog(true)}
                  >
                    <Avatar className="h-28 w-28 ring-4 ring-background shadow-xl">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-3xl font-bold">
                        {user.display_name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div className="absolute -bottom-1 right-0 w-6 h-6 rounded-full bg-green-500 ring-4 ring-background" />
                </div>

                {/* User Name & Status */}
                <h2 className="text-xl font-bold text-foreground mb-1 flex items-center justify-center gap-2">
                  {user.display_name || "کاربر"}
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </h2>
                <p className="text-muted-foreground text-sm">{getStatusText()}</p>
                <p className="text-muted-foreground text-xs mt-1">@{user.username}</p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-center gap-4 px-6 py-5 border-y border-border/50">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSendMessage}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-blue-500/30">
                    <MessageCircle className="h-6 w-6 text-blue-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">پیام</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-14 h-14 rounded-full bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-green-500/30">
                    <Phone className="h-6 w-6 text-green-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">تماس</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-14 h-14 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-muted/30">
                    <BellOff className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">سکوت</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-14 h-14 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-muted/30">
                    <MoreHorizontal className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">بیشتر</span>
                </motion.button>
              </div>

              {/* Info Section */}
              <div className="px-6 py-4 space-y-1">
                {user.phone && (
                  <div className="flex items-center justify-between py-3 hover:bg-muted/30 rounded-lg px-3 transition-colors cursor-pointer">
                    <span className="text-sm text-muted-foreground">شماره تماس</span>
                    <span className="text-sm text-foreground font-medium">{user.phone}</span>
                  </div>
                )}
                
                {user.bio && (
                  <div className="py-3 px-3">
                    <span className="text-sm text-muted-foreground block mb-1">درباره</span>
                    <p className="text-sm text-foreground leading-relaxed">{user.bio}</p>
                  </div>
                )}

                <div className="h-px bg-border/50 my-2" />

                <motion.button
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-muted/30 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">رسانه و فایل‌ها</span>
                  </div>
                  <span className="text-xs text-muted-foreground">156</span>
                </motion.button>

                <motion.button
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-muted/30 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-foreground">فایل‌ها</span>
                  </div>
                  <span className="text-xs text-muted-foreground">23</span>
                </motion.button>

                <motion.button
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-muted/30 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Link2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-foreground">لینک‌ها</span>
                  </div>
                  <span className="text-xs text-muted-foreground">8</span>
                </motion.button>
              </div>

              {/* Danger Zone */}
              <div className="px-6 py-4 space-y-2 border-t border-border/50 mt-4">
                <p className="text-xs text-muted-foreground mb-3">منطقه خطر</p>
                <motion.button
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center gap-3 py-2.5 px-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Ban className="h-5 w-5" />
                  <span className="text-sm font-medium">مسدود کردن کاربر</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Avatar Dialog */}
      {user?.avatar_url && (
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
      )}
    </AnimatePresence>
  );
}
