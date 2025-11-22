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
      // Reset form state
      setSelectedUsers([]);
      setSearchQuery("");
      setGroupName("");
      setChannelName("");
      setChannelDescription("");
    }
  }, [open]);

  const loadUsers = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;

    const { data } = await supabase
      .from("neohi_users")
      .select("*")
      .neq("id", currentUser.id);

    if (data) setUsers(data);
  };

  const filteredUsers = users.filter((listUser) =>
    (listUser.display_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (listUser.username || "").toLowerCase().includes(searchQuery.toLowerCase())
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
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      const targetUserId = selectedUsers[0];

      // Check if DM already exists with optimized single query using RPC or joins
      // Get all chats where current user is member
      const { data: existingDMs } = await supabase
        .from("neohi_chat_members")
        .select(`
          chat_id,
          chats:neohi_chats!inner(id, type)
        `)
        .eq("user_id", currentUser.id);

      // Filter DM type chats
      const dmChatIds = existingDMs
        ?.filter((member: any) => member.chats?.type === "dm")
        .map((member: any) => member.chat_id) || [];

      if (dmChatIds.length > 0) {
        // Check which of these DM chats has exactly the target user
        for (const chatId of dmChatIds) {
          const { data: members } = await supabase
            .from("neohi_chat_members")
            .select("user_id")
            .eq("chat_id", chatId);

          if (members?.length === 2) {
            const memberIds = members.map(m => m.user_id);
            if (memberIds.includes(targetUserId) && memberIds.includes(currentUser.id)) {
              // Found existing DM
              onChatCreated(chatId);
              onOpenChange(false);
              setCreating(false);
              return;
            }
          }
        }
      }

      // Create new DM - DO NOT send created_by, let RLS/trigger handle it
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

      // Add members
      const members = [
        { chat_id: chat.id, user_id: currentUser.id, role: "owner" },
        { chat_id: chat.id, user_id: targetUserId, role: "member" },
      ];

      const { error: membersError } = await supabase
        .from("neohi_chat_members")
        .insert(members);

      if (membersError) {
        console.error("Members error:", membersError);
        throw membersError;
      }

      toast({
        title: "Success",
        description: "Chat created successfully",
      });

      onChatCreated(chat.id);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Create chat error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create chat",
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
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      // DO NOT send created_by, let RLS/trigger handle it
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
        { chat_id: chat.id, user_id: currentUser.id, role: "owner" },
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
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      // DO NOT send created_by, let RLS/trigger handle it
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
          user_id: currentUser.id,
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
                    {filteredUsers.map((listUser) => (
                      <button
                        key={listUser.id}
                        onClick={() => setSelectedUsers([listUser.id])}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          selectedUsers.includes(listUser.id) ? "bg-[#0a84ff]/20" : "hover:bg-[#2c2c2e]"
                        }`}
                      >
                        <Avatar>
                          <AvatarImage src={listUser.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
                            {(listUser.display_name || "?").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-white">{listUser.display_name || "Unknown"}</p>
                          <p className="text-sm text-gray-400">@{listUser.username || "unknown"}</p>
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
                    {filteredUsers.map((listUser) => (
                      <button
                        key={listUser.id}
                        onClick={() => toggleUser(listUser.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          selectedUsers.includes(listUser.id) ? "bg-[#0a84ff]/20" : "hover:bg-[#2c2c2e]"
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={listUser.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs">
                            {(listUser.display_name || "?").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-white">{listUser.display_name || "Unknown"}</p>
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