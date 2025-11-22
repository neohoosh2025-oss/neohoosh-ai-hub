import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
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
        title: "Story uploaded",
        description: "Your story has been published successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload error",
        description: "Failed to upload story",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (stories.length === 0 && !currentUser) return null;

  return (
    <>
      <div className="border-b border-border bg-card shrink-0">
        <ScrollArea className="w-full">
          <div className="flex gap-3 p-3">
            {/* Add Story Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <label htmlFor="story-upload" className="cursor-pointer">
                <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 p-[2px]">
                  <div className="h-full w-full rounded-full bg-card flex items-center justify-center">
                    <motion.div
                      whileHover={{ rotate: 90 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Plus className="h-6 w-6 text-primary" />
                    </motion.div>
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
              <span className="text-xs text-muted-foreground max-w-[70px] truncate">
                استوری شما
              </span>
            </motion.div>

            {/* Stories */}
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStory(story)}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 0 2px hsl(var(--primary))",
                        "0 0 0 3px hsl(var(--primary) / 0.5)",
                        "0 0 0 2px hsl(var(--primary))",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-[2px]"
                  >
                    <div className="h-full w-full rounded-full bg-card" />
                  </motion.div>
                  <Avatar className="h-16 w-16 relative border-2 border-card group-hover:scale-105 transition-transform">
                    <AvatarImage src={story.user.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {story.user.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs text-muted-foreground max-w-[70px] truncate">
                  {story.user.display_name}
                </span>
              </motion.div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Story Viewer */}
      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="max-w-md p-0 bg-background border-border">
          {selectedStory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative w-full aspect-[9/16]"
            >
              {selectedStory.media_type === "image" ? (
                <img
                  src={selectedStory.media_url}
                  alt="Story"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <video
                  src={selectedStory.media_url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain rounded-lg"
                />
              )}
              <div className="absolute top-4 left-4 right-4 flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={selectedStory.user.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedStory.user.display_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-foreground font-semibold">{selectedStory.user.display_name}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(selectedStory.created_at).toLocaleTimeString("fa-IR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
