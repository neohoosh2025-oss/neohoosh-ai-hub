import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Send, Image as ImageIcon, Smile, Mic, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  onSend: (content: string, mediaUrl?: string, messageType?: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
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

  const startRecording = async () => {
    try {
      // Request microphone permission - browser will show native permission dialog
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Permission granted - start recording
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Reset state
        setRecordingTime(0);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "در حال ضبط",
        description: "میکروفون فعال است",
      });
    } catch (error: any) {
      console.error("Microphone access error:", error);
      
      // Handle different error types with user-friendly messages
      let errorTitle = "خطا در دسترسی به میکروفون";
      let errorDescription = "";
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorTitle = "دسترسی به میکروفون رد شد";
        errorDescription = "برای ضبط پیام صوتی، باید دسترسی به میکروفون را مجاز کنید:\n\n۱. روی آیکون قفل 🔒 در نوار آدرس کلیک کنید\n۲. دسترسی میکروفون را روی 'مجاز' تغییر دهید\n۳. صفحه را رفرش کنید و دوباره تلاش کنید";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorTitle = "میکروفون پیدا نشد";
        errorDescription = "هیچ میکروفونی یافت نشد. لطفاً مطمئن شوید که میکروفون به دستگاه متصل است و توسط برنامه دیگری استفاده نمی‌شود.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorTitle = "میکروفون در دسترس نیست";
        errorDescription = "میکروفون توسط برنامه دیگری در حال استفاده است. لطفاً سایر برنامه‌ها را ببندید و دوباره امتحان کنید.";
      } else if (error.name === "OverconstrainedError") {
        errorTitle = "خطا در تنظیمات میکروفون";
        errorDescription = "تنظیمات درخواستی برای میکروفون پشتیبانی نمی‌شود. لطفاً میکروفون دیگری امتحان کنید.";
      } else if (error.name === "SecurityError") {
        errorTitle = "خطای امنیتی";
        errorDescription = "دسترسی به میکروفون به دلایل امنیتی مسدود شده است. مطمئن شوید که از HTTPS استفاده می‌کنید.";
      } else {
        errorDescription = "مشکلی در دسترسی به میکروفون پیش آمد. لطفاً دوباره تلاش کنید یا از مرورگر دیگری استفاده کنید.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
        duration: 10000,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileName = `${user.id}/${Date.now()}.webm`;

      const { error } = await supabase.storage
        .from("neohi-media")
        .upload(fileName, audioBlob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("neohi-media")
        .getPublicUrl(fileName);

      onSend("🎤 پیام صوتی", publicUrl, "audio");
      
      toast({
        title: "ارسال شد",
        description: "پیام صوتی ارسال شد",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "خطا",
        description: "ارسال پیام صوتی با مشکل مواجه شد",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-3 bg-neohi-bg-sidebar">
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="h-10 w-10 rounded-full text-neohi-text-secondary hover:bg-neohi-bg-hover hover:text-neohi-accent flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
        </Button>

        {/* Message Input - Telegram Style */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="پیام"
          className="flex-1 resize-none min-h-[42px] max-h-[120px] bg-neohi-bg-hover border-neohi-border text-neohi-text-primary placeholder:text-neohi-text-secondary rounded-[22px] px-4 py-2.5 text-[15px] leading-[1.4]"
          rows={1}
        />

        {/* Send or Mic Button */}
        {message.trim() ? (
          <Button
            onClick={handleSend}
            className="h-10 w-10 rounded-full bg-neohi-accent hover:bg-neohi-accent/90 text-white flex-shrink-0"
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        ) : isRecording ? (
          <Button
            onClick={stopRecording}
            className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex-shrink-0 relative"
            size="icon"
          >
            <Square className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[24px]">
              {recordingTime}s
            </span>
          </Button>
        ) : (
          <Button
            onClick={startRecording}
            disabled={uploading}
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-neohi-text-secondary hover:bg-neohi-bg-hover hover:text-neohi-accent flex-shrink-0"
          >
            <Mic className="h-5 w-5" />
          </Button>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*,video/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
