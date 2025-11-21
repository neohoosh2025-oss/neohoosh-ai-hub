import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image, Paperclip, Mic, Smile } from "lucide-react";
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
      const bucket = file.type.startsWith("image/") ? "neohi-media" : "neohi-media";

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const messageType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : "file";

      onSend(message.trim() || "", publicUrl, messageType);
      setMessage("");
      
      toast({
        title: "فایل آپلود شد",
        description: "فایل با موفقیت ارسال شد",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "خطا در آپلود",
        description: "آپلود فایل با خطا مواجه شد",
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
    <div className="border-t border-border bg-card/30 backdrop-blur-sm p-4 shrink-0">
      <div className="flex items-end gap-2">
        {/* Action Buttons */}
        <div className="flex gap-1">
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
          >
            <Image className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Smile className="h-5 w-5" />
          </Button>
        </div>

        {/* Text Input */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="پیام خود را بنویسید..."
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
        />

        {/* Send/Voice Button */}
        {message.trim() ? (
          <Button onClick={handleSend} size="icon" className="shrink-0">
            <Send className="h-5 w-5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="shrink-0">
            <Mic className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
