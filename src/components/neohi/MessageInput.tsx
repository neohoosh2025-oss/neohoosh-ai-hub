import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Send, Mic, Square, X, FileText, Image as ImageIcon, Video, Music, Reply, Sparkles, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface MessageInputProps {
  onSend: (content: string, mediaUrl?: string, messageType?: string, replyTo?: string) => void;
  replyMessage?: any;
  onCancelReply?: () => void;
  chatId?: string;
}

export function MessageInput({ onSend, replyMessage, onCancelReply, chatId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [filePreview, setFilePreview] = useState<{
    file: File;
    url: string;
    type: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  const { toast } = useToast();

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message.trim(), undefined, undefined, replyMessage?.id);
    setMessage("");
    onCancelReply?.();
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

    // Create preview URL for images and videos
    const previewUrl = URL.createObjectURL(file);
    
    setFilePreview({
      file,
      url: previewUrl,
      type: messageType,
    });
  };

  const handleSendFile = async () => {
    if (!filePreview) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = filePreview.file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("neohi-media")
        .upload(fileName, filePreview.file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("neohi-media")
        .getPublicUrl(fileName);

      const fileMessage = message.trim() || (
        filePreview.type === "file" 
          ? `📎 ${filePreview.file.name}` 
          : `📁 ${filePreview.file.name}`
      );

      onSend(fileMessage, publicUrl, filePreview.type, replyMessage?.id);
      
      onCancelReply?.();
      
      // Clean up
      URL.revokeObjectURL(filePreview.url);
      setFilePreview(null);
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

  const handleCancelFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview.url);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

  const handleAskAI = async () => {
    if (!message.trim() || !chatId) return;

    setAiLoading(true);
    try {
      // Send user message first
      onSend(message.trim(), undefined, undefined, replyMessage?.id);
      const userMessage = message.trim();
      setMessage("");
      onCancelReply?.();

      // Call AI
      const { data, error } = await supabase.functions.invoke('neohi-ai', {
        body: {
          chatId,
          message: userMessage
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "✨ پاسخ AI",
        description: "NEOHi Assistant پاسخ داد",
      });

    } catch (error: any) {
      console.error('AI error:', error);
      toast({
        title: "خطا",
        description: error.message || "مشکلی در دریافت پاسخ AI پیش آمد",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!message.trim() || !chatId) return;

    setImageGenerating(true);
    try {
      const imagePrompt = message.trim();
      setMessage("");

      toast({
        title: "🎨 در حال تولید تصویر...",
        description: "لطفاً صبر کنید",
      });

      const { data, error } = await supabase.functions.invoke('generate-ai-image', {
        body: {
          chatId,
          prompt: imagePrompt
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "✅ تصویر تولید شد",
        description: "تصویر با موفقیت ساخته شد",
      });

    } catch (error: any) {
      console.error('Image generation error:', error);
      toast({
        title: "خطا",
        description: error.message || "مشکلی در تولید تصویر پیش آمد",
        variant: "destructive",
      });
    } finally {
      setImageGenerating(false);
    }
  };

  return (
    <div className="bg-neohi-bg-sidebar">
      {/* Reply Preview */}
      {replyMessage && (
        <div className="px-3 pt-3 pb-2 border-t border-neohi-border bg-neohi-bg-hover/50">
          <div className="flex items-start gap-2 p-2 bg-neohi-bg-chat rounded-lg border-r-2 border-neohi-accent">
            <Reply className="h-4 w-4 text-neohi-accent flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neohi-accent font-medium mb-0.5">
                ریپلای به {replyMessage.sender?.display_name || "پیام"}
              </p>
              <p className="text-sm text-neohi-text-secondary truncate">
                {replyMessage.content || "رسانه"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancelReply}
              className="h-6 w-6 rounded-full hover:bg-neohi-bg-hover flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="p-3">
      {/* File Preview */}
      {filePreview && (
        <div className="mb-3 p-3 bg-neohi-bg-hover rounded-2xl border border-neohi-border">
          <div className="flex items-start gap-2 mb-3">
            <div className="flex-1">
              <p className="text-sm text-neohi-text-secondary mb-2">پیش‌نمایش فایل:</p>
              
              {/* Image Preview */}
              {filePreview.type === "image" && (
                <img
                  src={filePreview.url}
                  alt="Preview"
                  className="rounded-xl max-h-40 w-auto border border-neohi-border"
                />
              )}
              
              {/* Video Preview */}
              {filePreview.type === "video" && (
                <video
                  src={filePreview.url}
                  controls
                  className="rounded-xl max-h-40 w-auto border border-neohi-border"
                />
              )}
              
              {/* Audio Preview */}
              {filePreview.type === "audio" && (
                <div className="flex items-center gap-2 p-3 bg-neohi-bg-chat rounded-xl border border-neohi-border">
                  <Music className="h-5 w-5 text-neohi-accent flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{filePreview.file.name}</p>
                    <p className="text-xs text-neohi-text-secondary">
                      {(filePreview.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
              
              {/* Document Preview */}
              {(filePreview.type === "document" || filePreview.type === "file") && (
                <div className="flex items-center gap-2 p-3 bg-neohi-bg-chat rounded-xl border border-neohi-border">
                  <FileText className="h-5 w-5 text-neohi-accent flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{filePreview.file.name}</p>
                    <p className="text-xs text-neohi-text-secondary">
                      {(filePreview.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
              
              {/* Caption Input */}
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="توضیحات (اختیاری)"
                className="mt-3 resize-none min-h-[42px] max-h-[80px] bg-neohi-bg-chat border-neohi-border text-neohi-text-primary placeholder:text-neohi-text-secondary rounded-xl px-3 py-2 text-sm"
                rows={1}
              />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancelFile}
              className="flex-shrink-0 h-8 w-8 rounded-full hover:bg-neohi-bg-chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSendFile}
              disabled={uploading}
              className="flex-1 bg-neohi-accent hover:bg-neohi-accent/90 text-white"
            >
              {uploading ? "در حال ارسال..." : "ارسال"}
            </Button>
            <Button
              onClick={handleCancelFile}
              variant="outline"
              className="flex-1"
              disabled={uploading}
            >
              لغو
            </Button>
          </div>
        </div>
      )}
      
      {/* Audio Preview */}
      {audioPreview && (
        <div className="mb-3 p-3 bg-neohi-bg-hover rounded-2xl border border-neohi-border">
          <p className="text-sm text-neohi-text-secondary mb-2">پیش‌نمایش پیام صوتی:</p>
          <audio src={audioPreview} controls className="w-full mb-3" />
          
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="توضیحات (اختیاری)"
            className="mb-3 resize-none min-h-[42px] max-h-[80px] bg-neohi-bg-chat border-neohi-border text-neohi-text-primary placeholder:text-neohi-text-secondary rounded-xl px-3 py-2 text-sm"
            rows={1}
          />
          
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
          disabled={uploading || !!filePreview || !!audioPreview || aiLoading || imageGenerating}
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
          disabled={!!filePreview || !!audioPreview || aiLoading || imageGenerating}
          className="flex-1 resize-none min-h-[42px] max-h-[120px] bg-neohi-bg-hover border-neohi-border text-neohi-text-primary placeholder:text-neohi-text-secondary rounded-[22px] px-4 py-2.5 text-[15px] leading-[1.4]"
          rows={1}
        />

        {/* AI Button */}
        {chatId && message.trim() && !filePreview && !audioPreview && (
          <>
            <Button
              onClick={handleAskAI}
              disabled={aiLoading || imageGenerating}
              className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex-shrink-0"
              size="icon"
              title="پرسیدن از AI"
            >
              {aiLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </Button>

            <Button
              onClick={handleGenerateImage}
              disabled={aiLoading || imageGenerating}
              className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white flex-shrink-0"
              size="icon"
              title="تولید تصویر با AI"
            >
              {imageGenerating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Wand2 className="h-5 w-5" />
                </motion.div>
              ) : (
                <Wand2 className="h-5 w-5" />
              )}
            </Button>
          </>
        )}

        {/* Send or Mic Button */}
        {message.trim() && !filePreview && !audioPreview && !aiLoading && !imageGenerating ? (
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
            disabled={uploading || !!filePreview || !!audioPreview || aiLoading || imageGenerating}
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
    </div>
  );
}
