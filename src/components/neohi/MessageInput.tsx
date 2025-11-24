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
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
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

      // Detect file type
      let messageType = "file";
      if (file.type.startsWith("image/")) {
        messageType = "image";
      } else if (file.type.startsWith("video/")) {
        messageType = "video";
      } else if (file.type.startsWith("audio/")) {
        messageType = "audio";
      } else if (
        file.type.includes("pdf") ||
        file.type.includes("document") ||
        file.type.includes("word") ||
        file.type.includes("text") ||
        file.type.includes("sheet") ||
        file.type.includes("presentation")
      ) {
        messageType = "document";
      }

      const fileMessage = messageType === "file" 
        ? `📎 ${file.name}` 
        : message.trim() || `📁 ${file.name}`;

      onSend(fileMessage, publicUrl, messageType);
      setMessage("");
      
      toast({
        title: "ارسال شد",
        description: "فایل با موفقیت ارسال شد",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "خطا در آپلود",
        description: "ارسال فایل با مشکل مواجه شد",
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      console.log("Permission OK - Microphone access granted");
      
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
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(audioBlob);
        setAudioPreview(previewUrl);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Reset recording state
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
        title: "اجازه داده شد ✔",
        description: "میکروفون فعال شد و ضبط شروع شد",
      });
    } catch (err: any) {
      console.log("Permission error:", err);
      
      // Handle different error types
      let errorMessage = "مرورگر اجازه دسترسی نداد ❌";
      let errorDescription = "";
      
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorDescription = "برای ضبط صدا، باید دسترسی میکروفون را در مرورگر مجاز کنید.";
      } else if (err.name === "NotFoundError") {
        errorMessage = "میکروفون پیدا نشد ❌";
        errorDescription = "لطفاً میکروفون را به دستگاه وصل کنید.";
      } else if (err.name === "NotReadableError") {
        errorMessage = "میکروفون در دسترس نیست ❌";
        errorDescription = "میکروفون توسط برنامه دیگری در حال استفاده است.";
      } else {
        errorDescription = err.message || "مشکلی در دسترسی به میکروفون پیش آمد.";
      }
      
      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive",
        duration: 5000,
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

      onSend("🎤 پیام صوتی", publicUrl, "voice");
      
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

  const handleSendAudio = async () => {
    if (!audioPreview) return;
    
    const response = await fetch(audioPreview);
    const audioBlob = await response.blob();
    
    URL.revokeObjectURL(audioPreview);
    setAudioPreview(null);
    
    await uploadAudio(audioBlob);
  };

  const handleCancelAudio = () => {
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview);
      setAudioPreview(null);
    }
  };

  return (
    <div className="p-3 bg-neohi-bg-sidebar">
      {/* Audio Preview */}
      {audioPreview && (
        <div className="mb-3 p-3 bg-neohi-bg-hover rounded-2xl border border-neohi-border">
          <p className="text-sm text-neohi-text-secondary mb-2">پیش‌نمایش پیام صوتی:</p>
          <audio src={audioPreview} controls className="w-full mb-3" />
          <div className="flex gap-2">
            <Button
              onClick={handleSendAudio}
              className="flex-1 bg-neohi-accent hover:bg-neohi-accent/90 text-white"
            >
              ارسال
            </Button>
            <Button
              onClick={handleCancelAudio}
              variant="outline"
              className="flex-1"
            >
              لغو
            </Button>
          </div>
        </div>
      )}
      
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

        {/* Hidden File Input - Accept all file types */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="*/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
