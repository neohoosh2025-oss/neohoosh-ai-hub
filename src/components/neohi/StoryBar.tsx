import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { StoryViewer } from "./StoryViewer";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  expires_at: string | null;
  caption: string | null;
  user: {
    display_name: string;
    avatar_url: string | null;
    username: string;
  };
}

export function StoryBar() {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
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
      setCurrentUserId(user.id);
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
        user:neohi_users(display_name, avatar_url, username)
      `)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (data) setStories(data as Story[]);
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
        title: "استوری منتشر شد",
        description: "استوری شما با موفقیت منتشر شد",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "خطا در آپلود",
        description: "آپلود استوری با مشکل مواجه شد",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (stories.length === 0 && !currentUser) return null;

  return (
    <>
      <div className="border-b border-neutral-100 dark:border-neutral-900 bg-white dark:bg-neutral-950 shrink-0">
        <ScrollArea className="w-full">
          <div className="flex gap-3 p-3">
            {/* Add Story Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <label htmlFor="story-upload" className="cursor-pointer">
                <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 p-[2px]">
                  <div className="h-full w-full rounded-full bg-white dark:bg-neutral-950 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-neutral-900 dark:text-white" strokeWidth={1.5} />
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
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-[70px] truncate">
                استوری شما
              </span>
            </motion.div>

            {/* Stories */}
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStoryIndex(index)}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
              >
                <div className="relative">
                  {/* Story Ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-neutral-300 dark:to-neutral-500 p-[2px]">
                    <div className="h-full w-full rounded-full bg-white dark:bg-neutral-950" />
                  </div>
                  <Avatar className="h-16 w-16 relative ring-2 ring-white dark:ring-neutral-950">
                    <AvatarImage src={story.user.avatar_url || undefined} />
                    <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {story.user.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-[70px] truncate">
                  {story.user.display_name}
                </span>
              </motion.div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Full Screen Story Viewer */}
      <AnimatePresence>
        {selectedStoryIndex !== null && stories.length > 0 && (
          <StoryViewer
            stories={stories}
            initialIndex={selectedStoryIndex}
            onClose={() => setSelectedStoryIndex(null)}
            currentUserId={currentUserId || undefined}
          />
        )}
      </AnimatePresence>
    </>
  );
}
