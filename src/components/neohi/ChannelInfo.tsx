import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  Share2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ChannelInfoProps {
  chatId: string;
  onClose: () => void;
}

export function ChannelInfo({ chatId, onClose }: ChannelInfoProps) {
  const [chat, setChat] = useState<any>(null);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    loadChannelInfo();
    loadSubscriberCount();
  }, [chatId]);

  const loadChannelInfo = async () => {
    const { data } = await supabase
      .from("neohi_chats")
      .select("*")
      .eq("id", chatId)
      .single();
    
    if (data) setChat(data);
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

  if (!chat) return null;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute inset-0 bg-[hsl(var(--neohi-bg-sidebar))] border-l border-[hsl(var(--neohi-border))] z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-[hsl(var(--neohi-border))]">
        <div className="flex items-center justify-between">
          <h2 className="text-[hsl(var(--neohi-text-primary))] font-semibold text-lg">
            Channel Info
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[hsl(var(--neohi-text-secondary))] hover:bg-[hsl(var(--neohi-bg-chat))]"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Channel Header */}
        <div className="p-6 text-center">
          <div className="relative inline-block">
            <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-[hsl(var(--neohi-border))]">
              <AvatarImage src={chat.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--neohi-accent))] to-primary text-white text-3xl font-bold">
                {chat.name?.charAt(0)?.toUpperCase() || "C"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
              <Badge className="bg-[hsl(var(--neohi-accent))] text-white px-3 py-1 flex items-center gap-1 shadow-lg">
                <Radio className="h-3 w-3" />
                Channel
              </Badge>
            </div>
          </div>
          
          <h3 className="text-[hsl(var(--neohi-text-primary))] font-bold text-xl mb-2 mt-4">
            {chat.name || "Channel"}
          </h3>
          <p className="text-[hsl(var(--neohi-text-secondary))] text-sm flex items-center justify-center gap-2">
            <UserPlus className="h-4 w-4" />
            {subscribersCount.toLocaleString()} subscribers
          </p>
        </div>

        {/* Description */}
        {chat.description && (
          <div className="px-6 pb-4">
            <p className="text-[hsl(var(--neohi-text-secondary))] text-sm leading-relaxed text-center">
              {chat.description}
            </p>
          </div>
        )}

        {/* Subscribe Button */}
        <div className="px-6 pb-4">
          <Button
            onClick={toggleSubscribe}
            className={`w-full ${
              isSubscribed
                ? "bg-[hsl(var(--neohi-bg-chat))] text-[hsl(var(--neohi-text-primary))] hover:bg-[hsl(var(--neohi-bg-chat))]/80"
                : "bg-[hsl(var(--neohi-accent))] text-white hover:bg-[hsl(var(--neohi-accent))]/90"
            } shadow-lg transition-all`}
          >
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </Button>
        </div>

        <Separator className="bg-[hsl(var(--neohi-border))]" />

        {/* Actions */}
        <div className="p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-[hsl(var(--neohi-text-primary))] hover:bg-[hsl(var(--neohi-bg-chat))]"
          >
            <Search className="h-5 w-5 mr-3 text-[hsl(var(--neohi-accent))]" />
            Search Messages
          </Button>
          <Button
            variant="ghost"
            onClick={toggleMute}
            className="w-full justify-start text-[hsl(var(--neohi-text-primary))] hover:bg-[hsl(var(--neohi-bg-chat))]"
          >
            {isMuted ? (
              <Bell className="h-5 w-5 mr-3 text-[hsl(var(--neohi-accent))]" />
            ) : (
              <BellOff className="h-5 w-5 mr-3 text-[hsl(var(--neohi-accent))]" />
            )}
            {isMuted ? "Unmute" : "Mute"} Channel
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-[hsl(var(--neohi-text-primary))] hover:bg-[hsl(var(--neohi-bg-chat))]"
          >
            <Pin className="h-5 w-5 mr-3 text-[hsl(var(--neohi-accent))]" />
            Pinned Messages
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-[hsl(var(--neohi-text-primary))] hover:bg-[hsl(var(--neohi-bg-chat))]"
          >
            <ImageIcon className="h-5 w-5 mr-3 text-[hsl(var(--neohi-accent))]" />
            Shared Media
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-[hsl(var(--neohi-text-primary))] hover:bg-[hsl(var(--neohi-bg-chat))]"
          >
            <Share2 className="h-5 w-5 mr-3 text-[hsl(var(--neohi-accent))]" />
            Share Channel
          </Button>
        </div>

        <Separator className="bg-[hsl(var(--neohi-border))]" />

        {/* Channel Stats */}
        <div className="p-4">
          <h4 className="text-[hsl(var(--neohi-text-primary))] font-semibold mb-4">
            Channel Statistics
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--neohi-bg-chat))]">
              <span className="text-[hsl(var(--neohi-text-secondary))] text-sm">Created</span>
              <span className="text-[hsl(var(--neohi-text-primary))] font-medium text-sm">
                {new Date(chat.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--neohi-bg-chat))]">
              <span className="text-[hsl(var(--neohi-text-secondary))] text-sm">Type</span>
              <span className="text-[hsl(var(--neohi-text-primary))] font-medium text-sm capitalize">
                {chat.type}
              </span>
            </div>
          </div>
        </div>

        <Separator className="bg-[hsl(var(--neohi-border))]" />

        {/* Danger Zone */}
        <div className="p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:bg-red-500/10"
          >
            Leave Channel
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:bg-red-500/10"
          >
            Report Channel
          </Button>
        </div>
      </ScrollArea>
    </motion.div>
  );
}
