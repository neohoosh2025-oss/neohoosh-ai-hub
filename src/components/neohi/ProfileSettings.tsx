import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Camera, 
  User, 
  AtSign,
  Phone as PhoneIcon,
  MessageSquare,
  LogOut,
  Shield,
  Bell,
  Palette,
  ChevronRight,
  X
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
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  
  const [privacySettings, setPrivacySettings] = useState({
    showPhone: true,
    showOnlineStatus: true,
    allowStoryViews: true,
    readReceipts: true,
  });

  const autoSave = useDebounceCallback(async (data: {
    display_name?: string;
    bio?: string;
    phone?: string;
    avatar_url?: string;
    username?: string;
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

      const { error: uploadError } = await supabase.storage
        .from("neohi-avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("neohi-avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      await autoSave({ avatar_url: publicUrl });

      toast({
        title: "Avatar saved",
        description: "Your avatar has been updated",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
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
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      {/* Header - Minimal */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-border/50 px-4 py-3"
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-foreground/70 hover:text-foreground hover:bg-muted/50"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Button>
          
          <span className="text-foreground font-medium text-base tracking-tight">
            Settings
          </span>

          <div className="w-9" />
        </div>
      </motion.header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-lg mx-auto p-4 space-y-6 pb-8">
          {/* Avatar Section - Clean */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center py-6"
          >
            <div className="relative group">
              <div 
                className="cursor-pointer"
                onClick={() => avatarUrl && setShowAvatarDialog(true)}
              >
                <Avatar className="h-24 w-24 ring-2 ring-border/50 transition-all group-hover:ring-foreground/30">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-muted text-foreground/70 text-2xl font-medium">
                    {displayName?.charAt(0)?.toUpperCase() || username?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-8 h-8 bg-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-foreground/90 transition-all shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <Camera className="h-4 w-4 text-background" strokeWidth={1.5} />
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
              <p className="text-muted-foreground text-sm mt-3">Uploading...</p>
            )}
            <h3 className="text-foreground font-medium text-lg mt-4">
              {displayName || username || "User"}
            </h3>
            {createdAt && (
              <p className="text-muted-foreground text-xs mt-1">
                Member since {new Date(createdAt).toLocaleDateString()}
              </p>
            )}
          </motion.div>

          {/* Profile Fields */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <AtSign className="h-3.5 w-3.5" strokeWidth={1.5} />
                Username
              </Label>
              <Input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  autoSave({ username: e.target.value });
                }}
                className="bg-muted/30 border-0 text-foreground h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/20"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                Display Name
              </Label>
              <Input
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  autoSave({ display_name: e.target.value });
                }}
                placeholder="Enter your name"
                className="bg-muted/30 border-0 text-foreground placeholder:text-muted-foreground h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                Bio
              </Label>
              <Textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  autoSave({ bio: e.target.value });
                }}
                placeholder="Write something about yourself..."
                className="bg-muted/30 border-0 text-foreground placeholder:text-muted-foreground min-h-[100px] resize-none rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <PhoneIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
                Phone
              </Label>
              <Input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  autoSave({ phone: e.target.value });
                }}
                placeholder="+1 234 567 8900"
                className="bg-muted/30 border-0 text-foreground placeholder:text-muted-foreground h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/20"
              />
            </div>
          </motion.div>

          {/* Settings Menu */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-1 pt-4"
          >
            <p className="text-muted-foreground text-xs uppercase tracking-wider px-1 mb-3">
              Settings
            </p>

            <SettingsItem
              icon={Bell}
              label="Notifications"
              onClick={() => {}}
            />
            <SettingsItem
              icon={Shield}
              label="Privacy & Security"
              onClick={() => setShowPrivacyDialog(true)}
            />
            <SettingsItem
              icon={Palette}
              label="Appearance"
              onClick={() => {}}
            />
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-4"
          >
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-destructive hover:bg-destructive/10 h-12 rounded-xl"
            >
              <LogOut className="h-5 w-5 mr-3" strokeWidth={1.5} />
              Log Out
            </Button>
          </motion.div>
        </div>
      </ScrollArea>

      {/* Avatar Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="max-w-4xl w-[95vw] h-[95vh] p-0 bg-black/95 border-none overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              onClick={() => setShowAvatarDialog(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <motion.img 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={avatarUrl} 
              alt="Profile" 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Dialog */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="sm:max-w-[400px] bg-background border-border/50">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 font-medium">
              <Shield className="h-5 w-5" strokeWidth={1.5} />
              Privacy
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Control who can see your information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <PrivacyToggle
              label="Show phone number"
              description="Others can see your phone"
              checked={privacySettings.showPhone}
              onCheckedChange={(checked) =>
                setPrivacySettings({ ...privacySettings, showPhone: checked })
              }
            />
            <PrivacyToggle
              label="Show online status"
              description="Others can see when you're online"
              checked={privacySettings.showOnlineStatus}
              onCheckedChange={(checked) =>
                setPrivacySettings({ ...privacySettings, showOnlineStatus: checked })
              }
            />
            <PrivacyToggle
              label="Allow story views"
              description="Let others view your stories"
              checked={privacySettings.allowStoryViews}
              onCheckedChange={(checked) =>
                setPrivacySettings({ ...privacySettings, allowStoryViews: checked })
              }
            />
            <PrivacyToggle
              label="Read receipts"
              description="Show when you've read messages"
              checked={privacySettings.readReceipts}
              onCheckedChange={(checked) =>
                setPrivacySettings({ ...privacySettings, readReceipts: checked })
              }
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsItem({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
        <span className="text-foreground text-[15px]">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
    </button>
  );
}

function PrivacyToggle({ label, description, checked, onCheckedChange }: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <Label className="text-foreground text-sm">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
