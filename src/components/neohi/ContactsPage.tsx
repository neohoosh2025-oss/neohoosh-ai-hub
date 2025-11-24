import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, X, Users, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Contact {
  id: string;
  contact_user_id: string;
  contact_name: string | null;
  contact: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    is_online: boolean | null;
  };
}

interface SearchUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function ContactsPage({ onBack }: { onBack?: () => void }) {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadContacts();
      subscribeToContacts();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
    }
    setLoading(false);
  };

  const loadContacts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("neohi_contacts")
      .select(`
        id,
        contact_user_id,
        contact_name,
        contact:neohi_users!neohi_contacts_contact_user_id_fkey(
          username,
          display_name,
          avatar_url,
          is_online
        )
      `)
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });

    if (data) {
      setContacts(data as any);
    }
  };

  const subscribeToContacts = () => {
    const channel = supabase
      .channel("contacts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "neohi_contacts",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSearchUsers = async () => {
    if (!searchUsername.trim() || !user) return;

    setSearching(true);
    try {
      const { data } = await supabase
        .from("neohi_users")
        .select("id, username, display_name, avatar_url")
        .ilike("username", `%${searchUsername}%`)
        .neq("id", user.id)
        .limit(20);

      if (data) {
        // Filter out users who are already contacts
        const contactIds = contacts.map((c) => c.contact_user_id);
        const filtered = data.filter((u) => !contactIds.includes(u.id));
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddContact = async (contactUser: SearchUser) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("neohi_contacts").insert({
        user_id: user.id,
        contact_user_id: contactUser.id,
        contact_name: contactUser.display_name || contactUser.username,
      });

      if (error) throw error;

      toast({
        title: "Contact added",
        description: `${contactUser.username} has been added to your contacts`,
      });

      setSearchResults([]);
      setSearchUsername("");
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Failed to add contact",
        variant: "destructive",
      });
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from("neohi_contacts")
        .delete()
        .eq("id", contactId);

      if (error) throw error;

      toast({
        title: "Contact removed",
      });
    } catch (error) {
      console.error("Error removing contact:", error);
      toast({
        title: "Failed to remove contact",
        variant: "destructive",
      });
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const name = contact.contact_name || contact.contact.display_name || contact.contact.username;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
      <header className="bg-[#1c1c1d] border-b border-[#2c2c2e] px-4 py-2">
        <div className="flex items-center justify-between h-11">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#0a84ff] hover:bg-transparent"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0a84ff] flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">Contacts</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-[#0a84ff] hover:bg-transparent"
            onClick={() => setShowAddDialog(true)}
          >
            <UserPlus className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mt-2 mb-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search contacts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#2c2c2e] border-none text-white placeholder:text-gray-500 pl-10 h-9 rounded-lg"
            />
          </div>
        </div>
      </header>

      {/* Contacts List */}
      <ScrollArea className="flex-1 bg-black">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Users className="h-16 w-16 text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No contacts yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Click + to add contacts by username
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#2c2c2e]">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="px-4 py-3 flex items-center gap-3 hover:bg-[#1c1c1d] transition-colors"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={contact.contact.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {(contact.contact.display_name || contact.contact.username).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {contact.contact.is_online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-[15px] truncate">
                    {contact.contact_name || contact.contact.display_name || contact.contact.username}
                  </h3>
                  <p className="text-gray-400 text-[14px] truncate">
                    @{contact.contact.username}
                  </p>
                </div>

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:bg-red-500/10 hover:text-red-400 shrink-0"
                  onClick={() => handleRemoveContact(contact.id)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Add Contact Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#1c1c1d] border-[#2c2c2e] text-white">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter username"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchUsers()}
                className="bg-[#2c2c2e] border-none text-white placeholder:text-gray-500"
              />
              <Button
                onClick={handleSearchUsers}
                disabled={searching}
                className="bg-[#0a84ff] hover:bg-[#0066cc]"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="max-h-[300px]">
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#2c2c2e] hover:bg-[#3c3c3e] transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {(user.display_name || user.username).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {user.display_name || user.username}
                        </p>
                        <p className="text-gray-400 text-sm truncate">
                          @{user.username}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddContact(user)}
                        className="bg-[#0a84ff] hover:bg-[#0066cc]"
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              ) : searchUsername && !searching ? (
                <p className="text-gray-400 text-center py-4">No users found</p>
              ) : null}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
