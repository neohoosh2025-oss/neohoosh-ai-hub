import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { 
  ArrowRight, 
  Camera, 
  User, 
  AtSign,
  Phone as PhoneIcon,
  MessageSquare,
  LogOut,
  Shield,
  Bell,
  Palette,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";

interface ProfileSettingsProps {
  onBack: () => void;
}

export function ProfileSettings({ onBack }: ProfileSettingsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  // Auto-save with debounce
  const autoSave = useDebounceCallback(async (data: {
    display_name?: string;
    bio?: string;
    phone?: string;
    avatar_url?: string;
  }) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("neohi_users")
        .update(data)
        .eq("id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("Auto-save error:", error);
    }
  }, 1000);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("neohi_users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setDisplayName(profile.display_name || "");
        setUsername(profile.username || "");
        setBio(profile.bio || "");
        setPhone(profile.phone || "");
        setAvatarUrl(profile.avatar_url || "");
        setCreatedAt(profile.created_at || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    try {
      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("neohi-avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("neohi-avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
      // Auto-save avatar URL
      await autoSave({ avatar_url: publicUrl });

      toast({
        title: "آواتار ذخیره شد",
        description: "آواتار شما با موفقیت آپلود و ذخیره شد",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "خطا در آپلود",
        description: "آپلود آواتار با مشکل مواجه شد",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[hsl(var(--neohi-bg-main))] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-[hsl(var(--neohi-accent))] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[hsl(var(--neohi-bg-main))] flex flex-col overflow-hidden" dir="rtl">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[hsl(var(--neohi-bg-sidebar))] border-b border-[hsl(var(--neohi-border))] px-4 py-3 backdrop-blur-md"
      >
        <div className="flex items-center justify-between relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-[hsl(var(--neohi-text-primary))] hover:bg-[hsl(var(--neohi-bg-chat))] transition-all"
            onClick={onBack}
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
          
          <span className="absolute left-1/2 -translate-x-1/2 text-[hsl(var(--neohi-text-primary))] font-semibold text-lg">
            Profile
          </span>
          
          <div className="w-10" />
        </div>
      </motion.header>

      {/* Content */}
      <ScrollArea className="flex-1 bg-[hsl(var(--neohi-bg-main))]">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Avatar Section */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[hsl(var(--neohi-bg-sidebar))] rounded-2xl p-8 border border-[hsl(var(--neohi-border))] shadow-lg"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 ring-4 ring-[hsl(var(--neohi-border))] transition-all group-hover:ring-[hsl(var(--neohi-accent))]">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--neohi-accent))] to-primary text-white text-4xl font-bold">
                    {displayName?.charAt(0)?.toUpperCase() || username?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-2 right-2 w-10 h-10 bg-[hsl(var(--neohi-accent))] rounded-full flex items-center justify-center cursor-pointer hover:bg-[hsl(var(--neohi-accent))]/90 transition-all shadow-lg group-hover:scale-110"
                >
                  <Camera className="h-5 w-5 text-white" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              {uploading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[hsl(var(--neohi-accent))] text-sm font-medium"
                >
                  Uploading...
                </motion.p>
              )}
              <div className="text-center">
                <h3 className="text-[hsl(var(--neohi-text-primary))] font-bold text-2xl">
                  {displayName || username}
                </h3>
                <p className="text-[hsl(var(--neohi-text-secondary))] text-sm mt-1">
                  @{username}
                </p>
                {createdAt && (
                  <p className="text-[hsl(var(--neohi-text-secondary))] text-xs mt-2">
                    Joined {new Date(createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Profile Information */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[hsl(var(--neohi-bg-sidebar))] rounded-2xl p-6 border border-[hsl(var(--neohi-border))] shadow-lg space-y-6"
          >
            <h4 className="text-[hsl(var(--neohi-text-primary))] font-semibold text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-[hsl(var(--neohi-accent))]" />
              Profile Information
            </h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[hsl(var(--neohi-text-secondary))] text-sm flex items-center gap-2">
                  <AtSign className="h-4 w-4" />
                  Username
                </Label>
                <Input
                  value={username}
                  disabled
                  className="bg-[hsl(var(--neohi-bg-chat))] border-[hsl(var(--neohi-border))] text-[hsl(var(--neohi-text-secondary))] cursor-not-allowed"
                />
                <p className="text-[hsl(var(--neohi-text-secondary))] text-xs">Username cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label className="text-[hsl(var(--neohi-text-secondary))] text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  نام نمایشی
                </Label>
                <Input
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    autoSave({ display_name: e.target.value });
                  }}
                  placeholder="نام نمایشی خود را وارد کنید"
                  className="bg-[hsl(var(--neohi-bg-chat))] border-[hsl(var(--neohi-border))] text-[hsl(var(--neohi-text-primary))] placeholder:text-[hsl(var(--neohi-text-secondary))] focus:border-[hsl(var(--neohi-accent))]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[hsl(var(--neohi-text-secondary))] text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  بیوگرافی
                </Label>
                <Textarea
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    autoSave({ bio: e.target.value });
                  }}
                  placeholder="درباره خودتان بنویسید..."
                  className="bg-[hsl(var(--neohi-bg-chat))] border-[hsl(var(--neohi-border))] text-[hsl(var(--neohi-text-primary))] placeholder:text-[hsl(var(--neohi-text-secondary))] min-h-[120px] resize-none focus:border-[hsl(var(--neohi-accent))]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[hsl(var(--neohi-text-secondary))] text-sm flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4" />
                  شماره تلفن
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    autoSave({ phone: e.target.value });
                  }}
                  placeholder="+98 912 345 6789"
                  className="bg-[hsl(var(--neohi-bg-chat))] border-[hsl(var(--neohi-border))] text-[hsl(var(--neohi-text-primary))] placeholder:text-[hsl(var(--neohi-text-secondary))] focus:border-[hsl(var(--neohi-accent))]"
                />
              </div>
            </div>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[hsl(var(--neohi-bg-sidebar))] rounded-2xl p-6 border border-[hsl(var(--neohi-border))] shadow-lg space-y-4"
          >
            <h4 className="text-[hsl(var(--neohi-text-primary))] font-semibold text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-[hsl(var(--neohi-accent))]" />
              Settings & Privacy
            </h4>

            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-[hsl(var(--neohi-text-primary))] hover:bg-[hsl(var(--neohi-bg-chat))]"
              >
                <Bell className="h-5 w-5 mr-3 text-[hsl(var(--neohi-accent))]" />
                Notifications
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-[hsl(var(--neohi-text-primary))] hover:bg-[hsl(var(--neohi-bg-chat))]"
              >
                <Shield className="h-5 w-5 mr-3 text-[hsl(var(--neohi-accent))]" />
                Privacy & Security
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-[hsl(var(--neohi-text-primary))] hover:bg-[hsl(var(--neohi-bg-chat))]"
              >
                <Palette className="h-5 w-5 mr-3 text-[hsl(var(--neohi-accent))]" />
                Appearance
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-[hsl(var(--neohi-text-primary))] hover:bg-[hsl(var(--neohi-bg-chat))]"
              >
                <Globe className="h-5 w-5 mr-3 text-[hsl(var(--neohi-accent))]" />
                Language
              </Button>
            </div>

            <Separator className="bg-[hsl(var(--neohi-border))]" />

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-500 hover:bg-red-500/10"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Log Out
            </Button>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}
