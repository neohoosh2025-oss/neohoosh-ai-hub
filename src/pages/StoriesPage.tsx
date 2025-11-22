import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Plus, X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  user: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export default function StoriesPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadStories();
      subscribeToStories();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
    }
    setLoading(false);
  };

  const loadStories = async () => {
    if (!user) return;

    // Get stories from contacts and own stories
    const { data: contacts } = await supabase
      .from("neohi_contacts")
      .select("contact_user_id")
      .eq("user_id", user.id);

    const contactIds = contacts?.map(c => c.contact_user_id) || [];
    const userIds = [user.id, ...contactIds];

    const { data } = await supabase
      .from("neohi_stories")
      .select(`
        id,
        user_id,
        media_url,
        media_type,
        caption,
        created_at,
        user:neohi_users!neohi_stories_user_id_fkey(
          username,
          display_name,
          avatar_url
        )
      `)
      .in("user_id", userIds)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (data) {
      setStories(data as any);
    }
  };

  const subscribeToStories = () => {
    const channel = supabase
      .channel("stories-changes")
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      // Create story
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error: insertError } = await supabase
        .from("neohi_stories")
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          media_type: file.type.startsWith('video') ? 'video' : 'image',
          caption: caption.trim() || null,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) throw insertError;

      toast({
        title: "Story posted!",
        description: "Your story will be visible for 24 hours",
      });

      setShowCreateDialog(false);
      setCaption("");
    } catch (error) {
      console.error("Error uploading story:", error);
      toast({
        title: "Failed to post story",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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
      <header className="bg-[#1c1c1d] border-b border-[#2c2c2e] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="w-16" />
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">Stories</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-[#0a84ff] hover:bg-transparent"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Stories Grid */}
      <ScrollArea className="flex-1 bg-black">
        {stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4"
            >
              <Camera className="h-12 w-12 text-white" />
            </motion.div>
            <p className="text-gray-400 text-lg">No stories yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Tap + to share a moment
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 p-2">
            {stories.map((story) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => setSelectedStory(story)}
              >
                {/* Story Image/Video */}
                {story.media_type === 'video' ? (
                  <video
                    src={story.media_url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={story.media_url}
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

                {/* User Info */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Avatar className="h-8 w-8 ring-2 ring-white">
                    <AvatarImage src={story.user.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                      {(story.user.display_name || story.user.username).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm font-medium drop-shadow-lg">
                    {story.user.display_name || story.user.username}
                  </span>
                </div>

                {/* Caption if exists */}
                {story.caption && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-sm drop-shadow-lg line-clamp-2">
                      {story.caption}
                    </p>
                  </div>
                )}

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Create Story Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#1c1c1d] border-[#2c2c2e] text-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Create Story</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCreateDialog(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <Textarea
              placeholder="Add a caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="bg-[#2c2c2e] border-none text-white placeholder:text-gray-500 resize-none"
              rows={3}
            />

            <input
              type="file"
              id="story-upload"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <label htmlFor="story-upload">
              <Button
                disabled={uploading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                asChild
              >
                <div className="cursor-pointer">
                  <Camera className="h-5 w-5 mr-2" />
                  {uploading ? "Uploading..." : "Choose Photo or Video"}
                </div>
              </Button>
            </label>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Story Dialog */}
      <AnimatePresence>
        {selectedStory && (
          <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
            <DialogContent className="bg-black border-none text-white p-0 max-w-md h-[90vh]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full h-full rounded-2xl overflow-hidden"
              >
                {/* Story Content */}
                {selectedStory.media_type === 'video' ? (
                  <video
                    src={selectedStory.media_url}
                    className="w-full h-full object-contain"
                    autoPlay
                    controls
                  />
                ) : (
                  <img
                    src={selectedStory.media_url}
                    alt="Story"
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                  onClick={() => setSelectedStory(null)}
                >
                  <X className="h-6 w-6" />
                </Button>

                {/* User Info */}
                <div className="absolute top-4 left-4 flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-white">
                    <AvatarImage src={selectedStory.user.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {(selectedStory.user.display_name || selectedStory.user.username).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium drop-shadow-lg">
                      {selectedStory.user.display_name || selectedStory.user.username}
                    </p>
                    <p className="text-white/80 text-xs drop-shadow-lg">
                      {new Date(selectedStory.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Caption */}
                {selectedStory.caption && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white drop-shadow-lg">
                      {selectedStory.caption}
                    </p>
                  </div>
                )}
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
