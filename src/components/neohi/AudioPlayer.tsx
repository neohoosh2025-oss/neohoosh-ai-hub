import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download } from "lucide-react";
import { motion } from "framer-motion";

interface AudioPlayerProps {
  src: string;
  isOwn?: boolean;
}

export function AudioPlayer({ src, isOwn = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-2xl p-3 min-w-[280px] max-w-[320px] ${
        isOwn
          ? "bg-[hsl(var(--neohi-bubble-user))]/50 backdrop-blur-sm"
          : "bg-[hsl(var(--neohi-bg-hover))] border border-[hsl(var(--neohi-border))]"
      }`}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Download Button */}
      <a
        href={src}
        download
        className="absolute top-2 left-2 p-1.5 rounded-full bg-[hsl(var(--neohi-bg-chat))]/50 hover:bg-[hsl(var(--neohi-bg-chat))]/80 transition-colors z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Download className="h-3.5 w-3.5 text-[hsl(var(--neohi-text-secondary))]" />
      </a>

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-accent))]/90 flex items-center justify-center transition-all active:scale-95"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 text-white fill-white" />
          ) : (
            <Play className="h-5 w-5 text-white fill-white ml-0.5" />
          )}
        </button>

        {/* Progress and Time */}
        <div className="flex-1 min-w-0">
          <div className="relative h-1 bg-[hsl(var(--neohi-border))] rounded-full overflow-hidden mb-1">
            <motion.div
              className="absolute left-0 top-0 h-full bg-[hsl(var(--neohi-accent))]"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-[hsl(var(--neohi-text-secondary))]">
            <span className="font-medium">{formatTime(currentTime)}</span>
            <span>-{formatTime(duration - currentTime)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
