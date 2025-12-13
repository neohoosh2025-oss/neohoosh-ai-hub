import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, X, Users, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
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
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden" dir="ltr">
      {/* Header - Minimal */}
      <header className="border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-foreground/70 hover:text-foreground hover:bg-muted/50"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Button>
          
          <span className="text-foreground font-medium text-base tracking-tight">
            Contacts
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-foreground/70 hover:text-foreground hover:bg-muted/50"
            onClick={() => setShowAddDialog(true)}
          >
            <UserPlus className="h-5 w-5" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Search Bar - Clean */}
        <div className="mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/30 border-0 text-foreground placeholder:text-muted-foreground pl-10 h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/20"
            />
          </div>
        </div>
      </header>

      {/* Contacts List */}
      <ScrollArea className="flex-1">
        {filteredContacts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-[60vh] text-center p-8"
          >
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-foreground/80 font-medium">No contacts yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Tap + to add contacts
            </p>
          </motion.div>
        ) : (
          <div className="py-2">
            <AnimatePresence>
              {filteredContacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={contact.contact.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted text-foreground/70 font-medium">
                        {(contact.contact.display_name || contact.contact.username).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {contact.contact.is_online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground font-medium text-[15px] truncate">
                      {contact.contact_name || contact.contact.display_name || contact.contact.username}
                    </h3>
                    <p className="text-muted-foreground text-sm truncate">
                      @{contact.contact.username}
                    </p>
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveContact(contact.id);
                    }}
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* Add Contact Dialog - Clean */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-background border-border/50 text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-medium">Add Contact</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex gap-2">
              <Input
                placeholder="Enter username"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchUsers()}
                className="bg-muted/30 border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-foreground/20"
              />
              <Button
                onClick={handleSearchUsers}
                disabled={searching}
                variant="outline"
                size="icon"
                className="shrink-0 border-border/50 hover:bg-muted/50"
              >
                <Search className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </div>

            <ScrollArea className="max-h-[300px]">
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-muted text-foreground/70 font-medium">
                          {(user.display_name || user.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium truncate text-sm">
                          {user.display_name || user.username}
                        </p>
                        <p className="text-muted-foreground text-xs truncate">
                          @{user.username}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddContact(user)}
                        className="text-xs h-8 border-border/50 hover:bg-foreground hover:text-background"
                      >
                        Add
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : searchUsername && !searching ? (
                <p className="text-muted-foreground text-center py-8 text-sm">No users found</p>
              ) : null}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
