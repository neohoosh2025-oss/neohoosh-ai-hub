import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Users, 
  Bell, 
  BellOff, 
  Search, 
  UserPlus, 
  Settings,
  Shield,
  Pin,
  Image as ImageIcon
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface GroupInfoProps {
  chatId: string;
  onClose: () => void;
}

export function GroupInfo({ chatId, onClose }: GroupInfoProps) {
  const [chat, setChat] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    loadChatInfo();
    loadMembers();
    getCurrentUser();
  }, [chatId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUser(user);
  };

  const loadChatInfo = async () => {
    const { data } = await supabase
      .from("neohi_chats")
      .select("*")
      .eq("id", chatId)
      .single();
    
    if (data) setChat(data);
  };

  const loadMembers = async () => {
    const { data } = await supabase
      .from("neohi_chat_members")
      .select(`
        *,
        user:neohi_users(*)
      `)
      .eq("chat_id", chatId);

    if (data) setMembers(data);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Update in database
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
            Group Info
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
        {/* Group Header */}
        <div className="p-6 text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-[hsl(var(--neohi-border))]">
            <AvatarImage src={chat.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--neohi-accent))] to-primary text-white text-3xl font-bold">
              {chat.name?.charAt(0)?.toUpperCase() || "G"}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-[hsl(var(--neohi-text-primary))] font-bold text-xl mb-2">
            {chat.name || "Group"}
          </h3>
          <p className="text-[hsl(var(--neohi-text-secondary))] text-sm">
            {members.length} members
          </p>
        </div>

        {/* Description */}
        {chat.description && (
          <div className="px-6 pb-4">
            <p className="text-[hsl(var(--neohi-text-secondary))] text-sm leading-relaxed">
              {chat.description}
            </p>
          </div>
        )}

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
            {isMuted ? "Unmute" : "Mute"} Notifications
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
        </div>

        <Separator className="bg-[hsl(var(--neohi-border))]" />

        {/* Members */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[hsl(var(--neohi-text-primary))] font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-[hsl(var(--neohi-accent))]" />
              Members ({members.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="text-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-bg-chat))]"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {members.map((member) => (
              <motion.div
                key={member.id}
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--neohi-bg-chat))] transition-all cursor-pointer"
              >
                <Avatar className="h-12 w-12 ring-2 ring-[hsl(var(--neohi-border))]">
                  <AvatarImage src={member.user?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--neohi-accent))] to-primary text-white font-semibold">
                    {member.user?.display_name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[hsl(var(--neohi-text-primary))] font-medium text-sm truncate">
                      {member.user?.display_name || "User"}
                    </p>
                    {member.role === "owner" && (
                      <Shield className="h-3 w-3 text-[hsl(var(--neohi-accent))]" />
                    )}
                    {member.role === "admin" && (
                      <Settings className="h-3 w-3 text-[hsl(var(--neohi-accent))]" />
                    )}
                  </div>
                  <p className="text-[hsl(var(--neohi-text-secondary))] text-xs">
                    @{member.user?.username}
                  </p>
                </div>
                {member.user?.is_online && (
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--neohi-status-online))] animate-pulse" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <Separator className="bg-[hsl(var(--neohi-border))]" />

        {/* Danger Zone */}
        <div className="p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:bg-red-500/10"
          >
            Leave Group
          </Button>
        </div>
      </ScrollArea>
    </motion.div>
  );
}
