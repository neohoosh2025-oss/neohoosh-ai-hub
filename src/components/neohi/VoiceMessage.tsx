import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";
import { useGlobalAudio } from "./GlobalAudioPlayer";

interface VoiceMessageProps {
  src: string;
  messageId: string;
  isOwn?: boolean;
  senderName?: string;
}

export function VoiceMessage({ src, messageId, isOwn = false, senderName }: VoiceMessageProps) {
  const [duration, setDuration] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { currentTrack, isPlaying, playTrack, togglePlay, currentTime, duration: globalDuration } = useGlobalAudio();
  
  const isCurrentTrack = currentTrack?.id === messageId;
  const isActive = isCurrentTrack && isPlaying;
  const progress = isCurrentTrack && globalDuration > 0 ? (currentTime / globalDuration) * 100 : 0;

  // Generate fake waveform data
  useEffect(() => {
    const generateWaveform = () => {
      const bars = 35;
      const data = [];
      for (let i = 0; i < bars; i++) {
        // Create a more natural waveform pattern
        const base = Math.sin(i * 0.3) * 0.3 + 0.5;
        const random = Math.random() * 0.4;
        data.push(Math.min(1, Math.max(0.2, base + random)));
      }
      setWaveform(data);
    };
    generateWaveform();
  }, [src]);

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
        title: senderName ? `پیام صوتی از ${senderName}` : "پیام صوتی",
        type: "voice",
        duration: duration,
      });
    }
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const displayTime = isCurrentTrack ? currentTime : 0;
  const displayDuration = isCurrentTrack ? globalDuration : duration;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-2xl p-3 min-w-[240px] max-w-[300px] ${
        isOwn
          ? "bg-[hsl(var(--neohi-bubble-user))]/80"
          : "bg-[hsl(var(--neohi-bg-hover))] border border-[hsl(var(--neohi-border))]"
      }`}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={handlePlay}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            isActive 
              ? "bg-[hsl(var(--neohi-accent))] shadow-lg shadow-[hsl(var(--neohi-accent))]/30"
              : "bg-[hsl(var(--neohi-accent))]"
          }`}
        >
          {isActive ? (
            <Pause className="h-5 w-5 text-white fill-white" />
          ) : (
            <Play className="h-5 w-5 text-white fill-white ml-0.5" />
          )}
        </button>

        {/* Waveform */}
        <div className="flex-1 min-w-0">
          <div className="flex items-end gap-[2px] h-8 overflow-hidden">
            {waveform.map((height, index) => {
              const isPlayed = (index / waveform.length) * 100 < progress;
              return (
                <motion.div
                  key={index}
                  initial={{ scaleY: 0 }}
                  animate={{ 
                    scaleY: 1,
                    backgroundColor: isPlayed 
                      ? "hsl(var(--neohi-accent))"
                      : isOwn 
                        ? "hsl(var(--neohi-accent) / 0.4)" 
                        : "hsl(var(--neohi-text-secondary) / 0.3)"
                  }}
                  transition={{ delay: index * 0.01, duration: 0.2 }}
                  className="flex-1 min-w-[2px] max-w-[3px] rounded-full origin-bottom"
                  style={{ height: `${height * 100}%` }}
                />
              );
            })}
          </div>
          
          {/* Time Display */}
          <div className="flex items-center justify-between mt-1 text-xs text-[hsl(var(--neohi-text-secondary))]">
            <span className="font-medium tabular-nums">{formatTime(displayTime)}</span>
            <span className="tabular-nums">{formatTime(displayDuration)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
