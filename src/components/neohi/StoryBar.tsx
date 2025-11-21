import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  user: {
    display_name: string;
    avatar_url: string | null;
  };
}

export function StoryBar() {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
    loadStories();
    subscribeToStories();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("neohi_users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setCurrentUser(profile);
    }
  };

  const loadStories = async () => {
    const { data } = await supabase
      .from("neohi_stories")
      .select(`
        *,
        user:neohi_users(display_name, avatar_url)
      `)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (data) setStories(data);
  };

  const subscribeToStories = () => {
    const channel = supabase
      .channel("stories-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "neohi_stories",
        },
        () => {
          loadStories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleUploadStory = async (file: File) => {
    if (!currentUser) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("neohi-stories")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("neohi-stories")
        .getPublicUrl(fileName);

      const mediaType = file.type.startsWith("image/") ? "image" : "video";

      const { error: insertError } = await supabase
        .from("neohi_stories")
        .insert({
          user_id: currentUser.id,
          media_url: publicUrl,
          media_type: mediaType,
        });

      if (insertError) throw insertError;

      toast({
        title: "استوری آپلود شد",
        description: "استوری شما با موفقیت منتشر شد",
      });
      setShowUpload(false);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "خطا در آپلود",
        description: "آپلود استوری با خطا مواجه شد",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (stories.length === 0 && !currentUser) return null;

  return (
    <>
      <div className="border-b border-[#2c2c2e] bg-black shrink-0">
        <ScrollArea className="w-full">
          <div className="flex gap-3 p-3">
            {/* Add Story Button */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <label htmlFor="story-upload" className="cursor-pointer">
                <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
                  <div className="h-full w-full rounded-full bg-black flex items-center justify-center">
                    <Plus className="h-6 w-6 text-[#0a84ff]" />
                  </div>
                </div>
              </label>
              <input
                id="story-upload"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadStory(file);
                }}
                disabled={uploading}
              />
              <span className="text-xs text-gray-400 max-w-[70px] truncate">
                استوری شما
              </span>
            </div>

            {/* Stories */}
            {stories.map((story) => (
              <div
                key={story.id}
                onClick={() => setSelectedStory(story)}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-500 p-[2px]">
                    <div className="h-full w-full rounded-full bg-black" />
                  </div>
                  <Avatar className="h-16 w-16 relative border-2 border-black group-hover:scale-105 transition-transform">
                    <AvatarImage src={story.user.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {story.user.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs text-gray-400 max-w-[70px] truncate">
                  {story.user.display_name}
                </span>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Story Viewer */}
      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="max-w-md p-0 bg-black border-none">
          {selectedStory && (
            <div className="relative w-full aspect-[9/16]">
              {selectedStory.media_type === "image" ? (
                <img
                  src={selectedStory.media_url}
                  alt="Story"
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  src={selectedStory.media_url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
              <div className="absolute top-4 left-4 right-4 flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarImage src={selectedStory.user.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {selectedStory.user.display_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-semibold">{selectedStory.user.display_name}</p>
                  <p className="text-white/70 text-xs">
                    {new Date(selectedStory.created_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
