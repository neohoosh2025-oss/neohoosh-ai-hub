import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  created_at: string;
  user: {
    display_name: string;
    avatar_url: string | null;
  };
}

export function StoryBar() {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser();
    loadStories();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("neohi_users")
        .select("*")
        .eq("id", user.id)
        .single();
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

  const handleAddStory = () => {
    // Will implement in the next phase
    console.log("Add story clicked");
  };

  return (
    <div className="border-b border-border bg-card/20 backdrop-blur-sm shrink-0">
      <ScrollArea className="w-full">
        <div className="flex gap-3 p-3">
          {/* Add Story Button */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <Button
              onClick={handleAddStory}
              variant="outline"
              size="icon"
              className="h-16 w-16 rounded-full border-2 border-dashed hover:border-primary"
            >
              <Plus className="h-6 w-6" />
            </Button>
            <span className="text-xs text-muted-foreground">استوری شما</span>
          </div>

          {/* Stories */}
          {stories.map((story) => (
            <div
              key={story.id}
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-[2px] animate-pulse">
                  <div className="h-full w-full rounded-full bg-background" />
                </div>
                <Avatar className="h-16 w-16 relative z-10 border-2 border-background group-hover:scale-105 transition-transform">
                  <AvatarImage src={story.user.avatar_url || undefined} />
                  <AvatarFallback>
                    {story.user.display_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs text-muted-foreground max-w-[70px] truncate">
                {story.user.display_name}
              </span>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
