import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProfileSettingsProps {
  onBack: () => void;
}

export function ProfileSettings({ onBack }: ProfileSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

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
      const filePath = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("neohi-avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("neohi-avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      toast({
        title: "Avatar uploaded",
        description: "Don't forget to save your changes",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("neohi_users")
        .update({
          display_name: displayName,
          bio: bio,
          phone: phone,
          avatar_url: avatarUrl,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Save failed",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col overflow-hidden" dir="ltr">
      {/* Header */}
      <header className="bg-[#1c1c1d] border-b border-[#2c2c2e] px-4 py-2">
        <div className="flex items-center justify-between h-11">
          <Button
            variant="ghost"
            className="text-[#0a84ff] hover:bg-transparent text-base px-0"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5 mr-1 scale-x-[-1]" />
            Back
          </Button>
          
          <span className="text-white font-semibold text-lg">Profile Settings</span>

          <Button
            variant="ghost"
            className="text-[#0a84ff] hover:bg-transparent text-base px-0"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-5 w-5 mr-1" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>

      {/* Content */}
      <ScrollArea className="flex-1 bg-black">
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                  {displayName?.charAt(0) || username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#0a84ff] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#0066cc] transition-colors"
              >
                <Camera className="h-4 w-4 text-white" />
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
              <p className="text-gray-400 text-sm">Uploading...</p>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Username</label>
              <Input
                value={username}
                disabled
                className="bg-[#2c2c2e] border-none text-gray-500 cursor-not-allowed"
              />
              <p className="text-gray-500 text-xs">Username cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="bg-[#2c2c2e] border-none text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Add a bio..."
                className="bg-[#2c2c2e] border-none text-white placeholder:text-gray-500 min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Phone Number</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                className="bg-[#2c2c2e] border-none text-white placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
