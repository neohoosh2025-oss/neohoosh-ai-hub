import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  const [showMicPermissionDialog, setShowMicPermissionDialog] = useState(false);
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

  const requestMicrophonePermission = () => {
    setShowMicPermissionDialog(true);
  };

  const handleMicPermissionConfirm = async () => {
    setShowMicPermissionDialog(false);
    await startRecording();
  };

  const startRecording = async () => {
    try {
      // Request microphone access with explanation
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
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
      console.error("Recording error:", error);
      
      let errorMessage = "دسترسی به میکروفن رد شد";
      let errorDescription = "لطفاً در تنظیمات مرورگر، دسترسی به میکروفون را مجاز کنید";
      
      if (error.name === "NotAllowedError") {
        errorDescription = "برای ضبط پیام صوتی، باید دسترسی به میکروفون را در تنظیمات مرورگر مجاز کنید.\n\n۱. روی آیکون قفل در نوار آدرس کلیک کنید\n۲. دسترسی میکروفون را مجاز کنید\n۳. صفحه را رفرش کنید";
      } else if (error.name === "NotFoundError") {
        errorDescription = "میکروفونی پیدا نشد. لطفاً میکروفون را به دستگاه خود وصل کنید";
      }
      
      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive",
        duration: 8000,
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
            onClick={requestMicrophonePermission}
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

      {/* Microphone Permission Dialog */}
      <AlertDialog open={showMicPermissionDialog} onOpenChange={setShowMicPermissionDialog}>
        <AlertDialogContent className="bg-neohi-bg-sidebar border-neohi-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neohi-text-primary text-right">
              دسترسی به میکروفون
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neohi-text-secondary text-right" dir="rtl">
              برای ضبط و ارسال پیام صوتی، نیاز به دسترسی به میکروفون دارید.
              <br /><br />
              بعد از کلیک روی "اجازه دادن"، مرورگر از شما درخواست دسترسی به میکروفون می‌کند.
              <br /><br />
              اگر قبلاً دسترسی را رد کرده‌اید، باید از تنظیمات مرورگر آن را مجاز کنید.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction 
              onClick={handleMicPermissionConfirm}
              className="bg-neohi-accent hover:bg-neohi-accent/90 text-white"
            >
              اجازه دادن
            </AlertDialogAction>
            <AlertDialogCancel className="bg-neohi-bg-hover text-neohi-text-primary hover:bg-neohi-bg-chat">
              انصراف
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
