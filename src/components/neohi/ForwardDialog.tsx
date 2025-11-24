import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Check } from "lucide-react";
import { toast } from "sonner";

interface Chat {
  id: string;
  type: string;
  name: string | null;
  avatar_url: string | null;
  user_role?: string;
}

interface ForwardDialogProps {
  open: boolean;
  onClose: () => void;
  message: any;
}

export function ForwardDialog({ open, onClose, message }: ForwardDialogProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadChats();
    }
  }, [open]);

  const loadChats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's chats
    const { data: memberData } = await supabase
      .from("neohi_chat_members")
      .select("chat_id, role")
      .eq("user_id", user.id);

    if (!memberData) return;

    const chatIds = memberData.map((m) => m.chat_id);
    const { data: chatsData } = await supabase
      .from("neohi_chats")
      .select("*")
      .in("id", chatIds);

    if (!chatsData) return;

    // Process chats and check permissions
    const processedChats: Chat[] = [];
    
    for (const chat of chatsData) {
      let chatData: Chat = {
        id: chat.id,
        type: chat.type,
        name: chat.name,
        avatar_url: chat.avatar_url,
      };

      // For DMs, get other user's info
      if (chat.type === "dm") {
        const { data: members } = await supabase
          .from("neohi_chat_members")
          .select("user_id")
          .eq("chat_id", chat.id);

        const otherUserId = members?.find((m) => m.user_id !== user.id)?.user_id;
        if (otherUserId) {
          const { data: otherUser } = await supabase
            .from("neohi_users")
            .select("display_name, avatar_url")
            .eq("id", otherUserId)
            .single();

          if (otherUser) {
            chatData.name = otherUser.display_name;
            chatData.avatar_url = otherUser.avatar_url;
          }
        }
      }

      // For channels, check if user can send messages
      if (chat.type === "channel") {
        const userRole = memberData.find((m) => m.chat_id === chat.id)?.role;
        chatData.user_role = userRole;
        
        // Only show channel if user is owner or admin
        if (userRole === "owner" || userRole === "admin") {
          processedChats.push(chatData);
        }
      } else {
        processedChats.push(chatData);
      }
    }

    setChats(processedChats);
  };

  const toggleChatSelection = (chatId: string) => {
    setSelectedChats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  };

  const handleForward = async () => {
    if (selectedChats.size === 0) {
      toast.error("لطفاً حداقل یک چت انتخاب کنید");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Forward message to each selected chat
      const forwards = Array.from(selectedChats).map((chatId) =>
        supabase.from("neohi_messages").insert({
          chat_id: chatId,
          sender_id: user.id,
          content: message.content,
          media_url: message.media_url,
          message_type: message.message_type,
        })
      );

      await Promise.all(forwards);

      // Update last_message_at for all chats
      const updates = Array.from(selectedChats).map((chatId) =>
        supabase
          .from("neohi_chats")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", chatId)
      );

      await Promise.all(updates);

      toast.success(`پیام به ${selectedChats.size} چت فوروارد شد`);
      onClose();
      setSelectedChats(new Set());
    } catch (error) {
      console.error("Forward error:", error);
      toast.error("خطا در فوروارد پیام");
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-neohi-bg-sidebar border-neohi-border">
        <DialogHeader>
          <DialogTitle className="text-neohi-text-primary">فوروارد به</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neohi-text-secondary" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو..."
            className="pr-10 bg-neohi-bg-hover border-neohi-border text-neohi-text-primary"
          />
        </div>

        {/* Chats List */}
        <ScrollArea className="h-[400px] -mx-6 px-6">
          <div className="space-y-1">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => toggleChatSelection(chat.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neohi-bg-hover transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-1 ring-neohi-border">
                    <AvatarImage src={chat.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-neohi-accent to-blue-600 text-white">
                      {chat.name?.charAt(0)?.toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>
                  
                  {selectedChats.has(chat.id) && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neohi-accent flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-right min-w-0">
                  <p className="text-neohi-text-primary font-medium truncate">
                    {chat.name || "بدون نام"}
                  </p>
                  <p className="text-neohi-text-secondary text-sm">
                    {chat.type === "channel"
                      ? "کانال"
                      : chat.type === "group"
                      ? "گروه"
                      : "پیام خصوصی"}
                  </p>
                </div>
              </button>
            ))}

            {filteredChats.length === 0 && (
              <p className="text-center text-neohi-text-secondary py-8">
                چتی یافت نشد
              </p>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex gap-2">
          <Button
            onClick={handleForward}
            disabled={loading || selectedChats.size === 0}
            className="flex-1 bg-neohi-accent hover:bg-neohi-accent/90 text-white"
          >
            {loading
              ? "در حال ارسال..."
              : `فوروارد${selectedChats.size > 0 ? ` (${selectedChats.size})` : ""}`}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            لغو
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
