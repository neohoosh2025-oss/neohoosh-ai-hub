import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Users, Radio } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated: (chatId: string) => void;
}

export function NewChatDialog({ open, onOpenChange, onChatCreated }: NewChatDialogProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [chatName, setChatName] = useState("");
  const [chatDescription, setChatDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadUsers();
      setSelectedUsers([]);
      setChatName("");
      setChatDescription("");
    }
  }, [open]);

  const loadUsers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("neohi_users")
      .select("*")
      .neq("id", user.id);

    if (data) setUsers(data);
  };

  const createChat = async (type: "dm" | "group" | "channel") => {
    if (type !== "dm" && selectedUsers.length === 0) {
      toast({
        title: "خطا",
        description: "لطفا حداقل یک کاربر را انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    if (type === "dm" && selectedUsers.length !== 1) {
      toast({
        title: "خطا",
        description: "برای گفتگوی خصوصی فقط یک کاربر را انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if DM already exists
      if (type === "dm") {
        const { data: existing } = await supabase
          .from("neohi_chat_members")
          .select("chat_id, chats:neohi_chats(*)")
          .eq("user_id", user.id);

        if (existing) {
          for (const member of existing) {
            const { data: otherMembers } = await supabase
              .from("neohi_chat_members")
              .select("user_id")
              .eq("chat_id", member.chat_id);

            if (
              otherMembers?.length === 2 &&
              otherMembers.some((m) => m.user_id === selectedUsers[0])
            ) {
              onChatCreated(member.chat_id);
              onOpenChange(false);
              return;
            }
          }
        }
      }

      // Create new chat
      const { data: chat, error: chatError } = await supabase
        .from("neohi_chats")
        .insert({
          type,
          name: type === "dm" ? null : chatName || (type === "group" ? "گروه جدید" : "کانال جدید"),
          description: type === "dm" ? null : chatDescription,
          created_by: user.id,
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add members
      const members = [
        { chat_id: chat.id, user_id: user.id, role: "owner" },
        ...selectedUsers.map((userId) => ({
          chat_id: chat.id,
          user_id: userId,
          role: "member",
        })),
      ];

      const { error: membersError } = await supabase
        .from("neohi_chat_members")
        .insert(members);

      if (membersError) throw membersError;

      toast({
        title: "موفق",
        description: "گفتگو با موفقیت ایجاد شد",
      });

      onChatCreated(chat.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Create chat error:", error);
      toast({
        title: "خطا",
        description: "ایجاد گفتگو با خطا مواجه شد",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#1c1c1d] border-[#2c2c2e] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">گفتگوی جدید</DialogTitle>
          <DialogDescription className="text-gray-400">
            یک گفتگوی خصوصی، گروه یا کانال ایجاد کنید
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="dm" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#2c2c2e]">
            <TabsTrigger value="dm" className="data-[state=active]:bg-[#0a84ff]">
              <MessageSquare className="h-4 w-4 ml-2" />
              خصوصی
            </TabsTrigger>
            <TabsTrigger value="group" className="data-[state=active]:bg-[#0a84ff]">
              <Users className="h-4 w-4 ml-2" />
              گروه
            </TabsTrigger>
            <TabsTrigger value="channel" className="data-[state=active]:bg-[#0a84ff]">
              <Radio className="h-4 w-4 ml-2" />
              کانال
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dm" className="space-y-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUsers([user.id])}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      selectedUsers.includes(user.id) ? "bg-[#0a84ff]/20" : "hover:bg-[#2c2c2e]"
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
                        {user.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-right">
                      <p className="font-medium text-white">{user.display_name}</p>
                      <p className="text-sm text-gray-400">@{user.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
            <Button
              onClick={() => createChat("dm")}
              disabled={loading || selectedUsers.length !== 1}
              className="w-full bg-[#0a84ff] hover:bg-[#0a84ff]/90"
            >
              شروع گفتگو
            </Button>
          </TabsContent>

          <TabsContent value="group" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="group-name" className="text-gray-300">نام گروه</Label>
                <Input
                  id="group-name"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  placeholder="نام گروه را وارد کنید"
                  className="bg-[#2c2c2e] border-[#2c2c2e] text-white"
                />
              </div>
              <div>
                <Label htmlFor="group-desc" className="text-gray-300">توضیحات (اختیاری)</Label>
                <Input
                  id="group-desc"
                  value={chatDescription}
                  onChange={(e) => setChatDescription(e.target.value)}
                  placeholder="توضیحات گروه"
                  className="bg-[#2c2c2e] border-[#2c2c2e] text-white"
                />
              </div>
            </div>

            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      selectedUsers.includes(user.id) ? "bg-[#0a84ff]/20" : "hover:bg-[#2c2c2e]"
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs">
                        {user.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-white">{user.display_name}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>

            <Button
              onClick={() => createChat("group")}
              disabled={loading || selectedUsers.length === 0}
              className="w-full bg-[#0a84ff] hover:bg-[#0a84ff]/90"
            >
              ایجاد گروه
            </Button>
          </TabsContent>

          <TabsContent value="channel" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="channel-name" className="text-gray-300">نام کانال</Label>
                <Input
                  id="channel-name"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  placeholder="نام کانال را وارد کنید"
                  className="bg-[#2c2c2e] border-[#2c2c2e] text-white"
                />
              </div>
              <div>
                <Label htmlFor="channel-desc" className="text-gray-300">توضیحات (اختیاری)</Label>
                <Input
                  id="channel-desc"
                  value={chatDescription}
                  onChange={(e) => setChatDescription(e.target.value)}
                  placeholder="توضیحات کانال"
                  className="bg-[#2c2c2e] border-[#2c2c2e] text-white"
                />
              </div>
            </div>

            <Button
              onClick={() => createChat("channel")}
              disabled={loading}
              className="w-full bg-[#0a84ff] hover:bg-[#0a84ff]/90"
            >
              ایجاد کانال
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
