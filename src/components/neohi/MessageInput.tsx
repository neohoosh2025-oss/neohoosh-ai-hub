import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Send, Image as ImageIcon, Smile, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface MessageInputProps {
  onSend: (content: string, mediaUrl?: string, messageType?: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("neohi-media")
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("neohi-media")
        .getPublicUrl(fileName);

      const messageType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : "file";

      onSend(message.trim() || "", publicUrl, messageType);
      setMessage("");
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload error",
        description: "File upload failed",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="bg-[hsl(var(--neohi-bg-sidebar))] border-t border-[hsl(var(--neohi-border))] p-2 md:p-3 shrink-0 safe-area-bottom">
      <div className="flex items-end gap-1.5 md:gap-2">
        {/* Add Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*,video/*"
          className="hidden"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-bg-chat))] shrink-0 transition-all h-9 w-9 md:h-10 md:w-10"
        >
          <Plus className="h-5 w-5" />
        </Button>

        {/* Text Input Container - Mobile Optimized */}
        <div className="flex-1 bg-[hsl(var(--neohi-bg-chat))] rounded-[20px] md:rounded-[22px] px-3 md:px-4 py-2 md:py-2.5 border border-[hsl(var(--neohi-border))] transition-all focus-within:border-[hsl(var(--neohi-accent))] focus-within:shadow-sm">
          <div className="flex items-center gap-1.5 md:gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message"
              className="min-h-[20px] md:min-h-[22px] max-h-20 md:max-h-24 resize-none bg-transparent border-none text-[hsl(var(--neohi-text-primary))] placeholder:text-[hsl(var(--neohi-text-secondary))] focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-[13px] md:text-[14px]"
              rows={1}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-[hsl(var(--neohi-text-secondary))] hover:bg-transparent shrink-0 h-6 w-6"
            >
              <Smile className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>

        {/* Send/Voice Button - Mobile Optimized */}
        {message.trim() ? (
          <Button
            onClick={handleSend}
            size="icon"
            className="bg-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-accent))]/90 text-white rounded-full shrink-0 shadow-lg shadow-[hsl(var(--neohi-accent))]/20 transition-all h-9 w-9 md:h-10 md:w-10"
          >
            <Send className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="text-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-bg-chat))] shrink-0 transition-all h-9 w-9 md:h-10 md:w-10"
          >
            <Mic className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
