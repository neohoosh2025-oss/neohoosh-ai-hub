import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Bell, Search, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProfileSidebarProps {
  chatId: string;
  onClose: () => void;
}

export function ProfileSidebar({ chatId, onClose }: ProfileSidebarProps) {
  const [chat, setChat] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    loadChatInfo();
    loadMembers();
  }, [chatId]);

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

  if (!chat) return null;

  return (
    <div className="w-80 border-r border-border bg-card/30 backdrop-blur-sm flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <h2 className="font-semibold">اطلاعات</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Chat Avatar & Name */}
          <div className="flex flex-col items-center text-center gap-3">
            <Avatar className="h-24 w-24">
              <AvatarImage src={chat.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {chat.name?.charAt(0) || "C"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg">{chat.name || "گفتگو"}</h3>
              {chat.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {chat.description}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="flex flex-col h-auto py-3 gap-2">
              <Bell className="h-5 w-5" />
              <span className="text-xs">بی‌صدا</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-3 gap-2">
              <Search className="h-5 w-5" />
              <span className="text-xs">جستجو</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-3 gap-2">
              <Users className="h-5 w-5" />
              <span className="text-xs">اعضا</span>
            </Button>
          </div>

          <Separator />

          {/* Members */}
          {chat.type !== "dm" && members.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                اعضا ({members.length})
              </h4>
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.user.display_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.user.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        @{member.user.username}
                      </p>
                    </div>
                    {member.role === "owner" && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        مالک
                      </span>
                    )}
                    {member.role === "admin" && (
                      <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                        ادمین
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
