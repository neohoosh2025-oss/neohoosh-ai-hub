import { useState, useRef, useEffect } from "react";
import { Play, Pause, Music, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useGlobalAudio } from "./GlobalAudioPlayer";
import { useToast } from "@/hooks/use-toast";

interface MusicMessageProps {
  src: string;
  messageId: string;
  fileName?: string;
  isOwn?: boolean;
}

// Extract music metadata from filename
function extractMusicInfo(fileName?: string): { title: string; artist: string } {
  if (!fileName) return { title: "موزیک", artist: "ناشناس" };
  
  // Remove extension
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
  
  // Try to split by common separators
  const separators = [" - ", " – ", "_-_", " _ "];
  for (const sep of separators) {
    if (nameWithoutExt.includes(sep)) {
      const [artist, title] = nameWithoutExt.split(sep);
      return { 
        title: title?.trim() || nameWithoutExt, 
        artist: artist?.trim() || "ناشناس" 
      };
    }
  }
  
  return { title: nameWithoutExt, artist: "ناشناس" };
}

export function MusicMessage({ src, messageId, fileName, isOwn = false }: MusicMessageProps) {
  const [duration, setDuration] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  
  const { currentTrack, isPlaying, playTrack, togglePlay, currentTime, duration: globalDuration } = useGlobalAudio();
  
  const { title, artist } = extractMusicInfo(fileName);
  const isCurrentTrack = currentTrack?.id === messageId;
  const isActive = isCurrentTrack && isPlaying;
  const progress = isCurrentTrack && globalDuration > 0 ? (currentTime / globalDuration) * 100 : 0;

  // Get audio duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleDuration = () => setDuration(audio.duration);
    audio.addEventListener("loadedmetadata", handleDuration);
    
    return () => audio.removeEventListener("loadedmetadata", handleDuration);
  }, [src]);

  const handlePlay = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack({
        id: messageId,
        url: src,
        title: title,
        artist: artist,
        type: "music",
        duration: duration,
      });
    }
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `music-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({ title: "دانلود شد" });
    } catch (error) {
      toast({ title: "خطا در دانلود", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const displayDuration = isCurrentTrack ? globalDuration : duration;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-2xl p-3 min-w-[280px] max-w-[320px] ${
        isOwn
          ? "bg-[hsl(var(--neohi-bubble-user))]/80"
          : "bg-[hsl(var(--neohi-bg-hover))] border border-[hsl(var(--neohi-border))]"
      }`}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Progress Bar (background) */}
      <div 
        className="absolute inset-0 rounded-2xl overflow-hidden opacity-20"
        style={{ 
          background: `linear-gradient(to right, hsl(var(--neohi-accent)) ${progress}%, transparent ${progress}%)` 
        }}
      />
      
      <div className="relative flex items-center gap-3">
        {/* Album Art / Play Button */}
        <button
          onClick={handlePlay}
          className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
            isActive 
              ? "bg-[hsl(var(--neohi-accent))] shadow-lg shadow-[hsl(var(--neohi-accent))]/30"
              : "bg-gradient-to-br from-[hsl(var(--neohi-accent))] to-[hsl(var(--neohi-accent))]/70"
          }`}
        >
          {isActive ? (
            <Pause className="h-6 w-6 text-white fill-white" />
          ) : (
            <Play className="h-6 w-6 text-white fill-white ml-0.5" />
          )}
        </button>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[hsl(var(--neohi-text-primary))] text-sm truncate">
            {title}
          </p>
          <p className="text-xs text-[hsl(var(--neohi-text-secondary))] truncate">
            {artist}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Music className="w-3 h-3 text-[hsl(var(--neohi-accent))]" />
            <span className="text-xs text-[hsl(var(--neohi-text-secondary))] tabular-nums">
              {formatTime(displayDuration)}
            </span>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-shrink-0 p-2 rounded-full hover:bg-[hsl(var(--neohi-bg-chat))]/50 transition-colors disabled:opacity-50"
        >
          <Download className="h-4 w-4 text-[hsl(var(--neohi-text-secondary))]" />
        </button>
      </div>
    </motion.div>
  );
}
