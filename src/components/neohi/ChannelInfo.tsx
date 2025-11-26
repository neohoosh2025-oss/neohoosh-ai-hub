import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Bell, 
  BellOff, 
  Search,
  UserPlus,
  Radio,
  Pin,
  Image as ImageIcon,
  Share2,
  Camera,
  MoreHorizontal,
  FileText,
  Link2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChannelInfoProps {
  chatId: string;
  onClose: () => void;
}

export function ChannelInfo({ chatId, onClose }: ChannelInfoProps) {
  const [chat, setChat] = useState<any>(null);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadChannelInfo();
    loadSubscriberCount();
  }, [chatId]);

  const loadChannelInfo = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("neohi_chats")
      .select("*")
      .eq("id", chatId)
      .single();
    
    if (data) setChat(data);
    setLoading(false);
  };

  const handleChangeChannelPhoto = () => {
    toast({
      title: "تغییر تصویر کانال",
      description: "این قابلیت به زودی اضافه خواهد شد",
    });
  };

  const loadSubscriberCount = async () => {
    const { count } = await supabase
      .from("neohi_chat_members")
      .select("*", { count: "exact", head: true })
      .eq("chat_id", chatId);

    if (count) setSubscribersCount(count);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };

  if (!chat && !loading) return null;

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

                {/* Channel Photo */}
                <div className="relative inline-block mb-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer relative"
                    onClick={() => chat.avatar_url && setShowAvatarDialog(true)}
                  >
                    <Avatar className="h-28 w-28 ring-4 ring-background shadow-xl">
                      <AvatarImage src={chat.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-3xl font-bold">
                        {chat.name?.charAt(0)?.toUpperCase() || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeChannelPhoto();
                      }}
                      className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground shadow-lg transition-all hover:scale-110"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </motion.div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 flex items-center gap-1 shadow-lg">
                      <Radio className="h-3 w-3" />
                      کانال
                    </Badge>
                  </div>
                </div>

                {/* Channel Name & Subscribers */}
                <h2 className="text-xl font-bold text-foreground mb-1 mt-4">
                  {chat.name || "کانال"}
                </h2>
                <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
                  <UserPlus className="h-4 w-4" />
                  {subscribersCount.toLocaleString()} مشترک
                </p>
              </div>

              {/* Description */}
              {chat.description && (
                <div className="px-6 py-3 border-b border-border/50">
                  <p className="text-sm text-muted-foreground leading-relaxed text-center">
                    {chat.description}
                  </p>
                </div>
              )}

              {/* Subscribe Button */}
              <div className="px-6 py-4 border-b border-border/50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleSubscribe}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    isSubscribed
                      ? "bg-muted text-foreground hover:bg-muted/80"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30"
                  }`}
                >
                  {isSubscribed ? "عضو شده‌اید" : "عضویت در کانال"}
                </motion.button>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-center gap-4 px-6 py-5 border-b border-border/50">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-blue-500/30">
                    <Search className="h-6 w-6 text-blue-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">جستجو</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMute}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-14 h-14 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-muted/30">
                    {isMuted ? (
                      <Bell className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <BellOff className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">سکوت</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-14 h-14 rounded-full bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-green-500/30">
                    <Share2 className="h-6 w-6 text-green-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">اشتراک</span>
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
                <motion.button
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-muted/30 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Pin className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-foreground">پیام‌های پین شده</span>
                  </div>
                  <span className="text-xs text-muted-foreground">3</span>
                </motion.button>

                <motion.button
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-muted/30 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">رسانه و فایل‌ها</span>
                  </div>
                  <span className="text-xs text-muted-foreground">532</span>
                </motion.button>

                <motion.button
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-muted/30 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-foreground">فایل‌ها</span>
                  </div>
                  <span className="text-xs text-muted-foreground">124</span>
                </motion.button>

                <motion.button
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-muted/30 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Link2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-foreground">لینک‌ها</span>
                  </div>
                  <span className="text-xs text-muted-foreground">89</span>
                </motion.button>

                <div className="h-px bg-border/50 my-3" />

                {/* Channel Stats */}
                <div className="py-2">
                  <h4 className="text-sm font-medium text-foreground mb-3 px-3">آمار کانال</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm text-muted-foreground">تاریخ ایجاد</span>
                      <span className="text-sm text-foreground font-medium">
                        {new Date(chat.created_at).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm text-muted-foreground">نوع</span>
                      <span className="text-sm text-foreground font-medium capitalize">
                        {chat.type === 'channel' ? 'کانال عمومی' : chat.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="px-6 py-4 space-y-2 border-t border-border/50 mt-4">
                <p className="text-xs text-muted-foreground mb-3">منطقه خطر</p>
                <motion.button
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center gap-3 py-2.5 px-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <UserPlus className="h-5 w-5 rotate-45" />
                  <span className="text-sm font-medium">ترک کانال</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Avatar Dialog */}
      {chat?.avatar_url && (
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
                src={chat.avatar_url} 
                alt="Channel" 
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
