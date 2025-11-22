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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated: (chatId: string) => void;
}

export function NewChatDialog({ open, onOpenChange, onChatCreated }: NewChatDialogProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadUsers();
      setSelectedUsers([]);
      setSearchQuery("");
      setGroupName("");
      setChannelName("");
      setChannelDescription("");
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

  const filteredUsers = users.filter((user) =>
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDM = async () => {
    if (selectedUsers.length !== 1) {
      toast({
        title: "Error",
        description: "Please select exactly one user for direct message",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("Creating DM for user:", user.id);

      // Check if DM already exists between these two users
      const { data: myChats } = await supabase
        .from("neohi_chat_members")
        .select("chat_id")
        .eq("user_id", user.id);

      if (myChats && myChats.length > 0) {
        // Check each chat to see if it's a DM with the selected user
        for (const { chat_id } of myChats) {
          const { data: chatMembers } = await supabase
            .from("neohi_chat_members")
            .select("user_id")
            .eq("chat_id", chat_id);

          // If this is a DM (2 members) and includes the selected user
          if (chatMembers?.length === 2) {
            const memberIds = chatMembers.map(m => m.user_id);
            if (memberIds.includes(selectedUsers[0])) {
              // Get chat details to verify it's a DM
              const { data: chatData } = await supabase
                .from("neohi_chats")
                .select("type")
                .eq("id", chat_id)
                .single();
              
              if (chatData?.type === "dm") {
                onChatCreated(chat_id);
                onOpenChange(false);
                return;
              }
            }
          }
        }
      }

      // Create new DM - created_by will be set automatically from auth.uid()
      const { data: chat, error: chatError } = await supabase
        .from("neohi_chats")
        .insert({
          type: "dm",
        })
        .select()
        .single();

      if (chatError) {
        console.error("Chat creation error:", chatError);
        throw chatError;
      }

      console.log("Chat created successfully:", chat.id);

      // Add members
      const members = [
        { chat_id: chat.id, user_id: user.id, role: "owner" },
        { chat_id: chat.id, user_id: selectedUsers[0], role: "member" },
      ];

      const { error: membersError } = await supabase
        .from("neohi_chat_members")
        .insert(members);

      if (membersError) {
        console.error("Members error:", membersError);
        throw membersError;
      }

      toast({
        title: "موفق",
        description: "چت با موفقیت ساخته شد",
      });

      onChatCreated(chat.id);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Create chat error:", error);
      toast({
        title: "خطا",
        description: error.message || "ساخت چت ناموفق بود",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) {
      toast({
        title: "Error",
        description: "Please enter group name and select at least 2 users",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: chat, error: chatError } = await supabase
        .from("neohi_chats")
        .insert({
          type: "group",
          name: groupName,
        })
        .select()
        .single();

      if (chatError) throw chatError;

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
        title: "Success",
        description: "Group created successfully",
      });

      onChatCreated(chat.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Create group error:", error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCreateChannel = async () => {
    if (!channelName.trim()) {
      toast({
        title: "Error",
        description: "Please enter channel name",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: chat, error: chatError } = await supabase
        .from("neohi_chats")
        .insert({
          type: "channel",
          name: channelName,
          description: channelDescription || null,
        })
        .select()
        .single();

      if (chatError) throw chatError;

      const { error: memberError } = await supabase
        .from("neohi_chat_members")
        .insert({
          chat_id: chat.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: "Channel created successfully",
      });

      onChatCreated(chat.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Create channel error:", error);
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
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
      <DialogContent className="bg-[#1c1c1d] border-[#2c2c2e] text-white" dir="ltr">
        <DialogHeader>
          <DialogTitle className="text-xl">New Chat</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dm" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#2c2c2e]">
            <TabsTrigger value="dm">Direct Message</TabsTrigger>
            <TabsTrigger value="group">Group</TabsTrigger>
            <TabsTrigger value="channel">Channel</TabsTrigger>
          </TabsList>

          <TabsContent value="dm" className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#2c2c2e] border-none text-white pl-10"
                />
              </div>

              <ScrollArea className="h-[300px]">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No users found</p>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
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
                        <div className="flex-1 text-left">
                          <p className="font-medium text-white">{user.display_name}</p>
                          <p className="text-sm text-gray-400">@{user.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <Button
                onClick={handleCreateDM}
                disabled={selectedUsers.length !== 1 || creating}
                className="w-full bg-[#0a84ff] hover:bg-[#0a84ff]/90"
              >
                {creating ? "Creating..." : "Create Chat"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="group" className="space-y-4">
            <div className="space-y-4">
              <Input
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="bg-[#2c2c2e] border-none text-white"
              />

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#2c2c2e] border-none text-white pl-10"
                />
              </div>

              <ScrollArea className="h-[250px]">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No users found</p>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
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
                )}
              </ScrollArea>

              <Button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedUsers.length < 2 || creating}
                className="w-full bg-[#0a84ff] hover:bg-[#0a84ff]/90"
              >
                {creating ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="channel" className="space-y-4">
            <div className="space-y-4">
              <Input
                placeholder="Channel Name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="bg-[#2c2c2e] border-none text-white"
              />
              <Input
                placeholder="Channel Description"
                value={channelDescription}
                onChange={(e) => setChannelDescription(e.target.value)}
                className="bg-[#2c2c2e] border-none text-white"
              />

              <Button
                onClick={handleCreateChannel}
                disabled={!channelName.trim() || creating}
                className="w-full bg-[#0a84ff] hover:bg-[#0a84ff]/90"
              >
                {creating ? "Creating..." : "Create Channel"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
