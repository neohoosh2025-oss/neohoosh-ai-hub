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
    <div className="bg-[#1c1c1d] border-t border-[#2c2c2e] p-2 shrink-0">
      <div className="flex items-end gap-2">
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
          className="text-[#0a84ff] hover:bg-[#2c2c2e] shrink-0"
        >
          <Plus className="h-5 w-5" />
        </Button>

        {/* Text Input Container */}
        <div className="flex-1 bg-[#2c2c2e] rounded-[20px] px-4 py-2">
          <div className="flex items-center gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message"
              className="min-h-[24px] max-h-24 resize-none bg-transparent border-none text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              rows={1}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:bg-transparent shrink-0 h-6 w-6"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Send/Voice Button */}
        {message.trim() ? (
          <Button
            onClick={handleSend}
            size="icon"
            className="bg-[#0a84ff] hover:bg-[#0a84ff]/90 text-white rounded-full shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="text-[#0a84ff] hover:bg-[#2c2c2e] shrink-0"
          >
            <Mic className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
