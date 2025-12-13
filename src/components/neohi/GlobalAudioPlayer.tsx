import { useState, useRef, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, ChevronUp, ChevronDown, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";

interface AudioTrack {
  id: string;
  url: string;
  title: string;
  artist?: string;
  thumbnail?: string;
  type: "voice" | "music" | "audio";
  duration?: number;
}

interface GlobalAudioContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  queue: AudioTrack[];
  playTrack: (track: AudioTrack) => void;
  addToQueue: (track: AudioTrack) => void;
  togglePlay: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  currentTime: number;
  duration: number;
  setVolume: (volume: number) => void;
  volume: number;
}

const GlobalAudioContext = createContext<GlobalAudioContextType | null>(null);

export function useGlobalAudio() {
  const context = useContext(GlobalAudioContext);
  if (!context) {
    throw new Error("useGlobalAudio must be used within GlobalAudioProvider");
  }
  return context;
}

export function GlobalAudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<AudioTrack[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueIndexRef = useRef(0);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = "metadata";
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (queueIndexRef.current < queue.length - 1) {
        next();
      } else {
        setIsPlaying(false);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
    };
  }, [queue.length]);

  const playTrack = (track: AudioTrack) => {
    if (!audioRef.current) return;
    
    // Stop current playback
    audioRef.current.pause();
    
    // Set new source
    audioRef.current.src = track.url;
    audioRef.current.volume = volume;
    
    // Add to queue if not already there
    const existingIndex = queue.findIndex(t => t.id === track.id);
    if (existingIndex === -1) {
      setQueue(prev => [...prev, track]);
      queueIndexRef.current = queue.length;
    } else {
      queueIndexRef.current = existingIndex;
    }
    
    setCurrentTrack(track);
    setCurrentTime(0);
    
    // Play
    audioRef.current.play().catch(console.error);
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const addToQueue = (track: AudioTrack) => {
    setQueue(prev => {
      if (prev.some(t => t.id === track.id)) return prev;
      return [...prev, track];
    });
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTrack(null);
    setCurrentTime(0);
    setQueue([]);
    queueIndexRef.current = 0;
  };

  const next = () => {
    if (queueIndexRef.current < queue.length - 1) {
      queueIndexRef.current++;
      playTrack(queue[queueIndexRef.current]);
    }
  };

  const previous = () => {
    if (currentTime > 3) {
      // If more than 3 seconds played, restart current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else if (queueIndexRef.current > 0) {
      queueIndexRef.current--;
      playTrack(queue[queueIndexRef.current]);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(1);
    } else {
      setVolume(0);
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
    <GlobalAudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        playTrack,
        addToQueue,
        togglePlay,
        stop,
        next,
        previous,
        seek,
        currentTime,
        duration,
        setVolume,
        volume,
      }}
    >
      {children}
      
      {/* Global Mini Player */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-0 right-0 z-40 px-3"
          >
            <div className="bg-neutral-900/95 dark:bg-neutral-800/95 backdrop-blur-xl rounded-2xl border border-neutral-800/50 shadow-2xl overflow-hidden">
              {/* Expanded View */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-neutral-800/50"
                  >
                    <div className="p-4 space-y-4">
                      {/* Album Art / Waveform */}
                      <div className="flex justify-center">
                        {currentTrack.thumbnail ? (
                          <img
                            src={currentTrack.thumbnail}
                            alt={currentTrack.title}
                            className="w-48 h-48 rounded-xl object-cover shadow-lg"
                          />
                        ) : (
                          <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Volume2 className="w-16 h-16 text-primary/50" />
                          </div>
                        )}
                      </div>
                      
                      {/* Track Info */}
                      <div className="text-center">
                        <h3 className="font-semibold text-white text-lg truncate">
                          {currentTrack.title}
                        </h3>
                        {currentTrack.artist && (
                          <p className="text-neutral-400 text-sm truncate">
                            {currentTrack.artist}
                          </p>
                        )}
                      </div>
                      
                      {/* Progress Slider */}
                      <div className="space-y-2">
                        <Slider
                          value={[currentTime]}
                          max={duration || 100}
                          step={0.1}
                          onValueChange={([value]) => seek(value)}
                          className="cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-neutral-500">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                      
                      {/* Controls */}
                      <div className="flex items-center justify-center gap-6">
                        <button
                          onClick={previous}
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition"
                        >
                          <SkipBack className="w-6 h-6" />
                        </button>
                        
                        <button
                          onClick={togglePlay}
                          className="w-16 h-16 rounded-full bg-white flex items-center justify-center active:scale-95 transition"
                        >
                          {isPlaying ? (
                            <Pause className="w-8 h-8 text-black fill-black" />
                          ) : (
                            <Play className="w-8 h-8 text-black fill-black ml-1" />
                          )}
                        </button>
                        
                        <button
                          onClick={next}
                          disabled={queueIndexRef.current >= queue.length - 1}
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition disabled:opacity-30"
                        >
                          <SkipForward className="w-6 h-6" />
                        </button>
                      </div>
                      
                      {/* Volume */}
                      <div className="flex items-center gap-3 px-4">
                        <button onClick={toggleMute} className="text-neutral-400">
                          {isMuted ? (
                            <VolumeX className="w-5 h-5" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </button>
                        <Slider
                          value={[volume]}
                          max={1}
                          step={0.01}
                          onValueChange={([value]) => setVolume(value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Mini Player Bar */}
              <div className="flex items-center gap-3 p-3">
                {/* Thumbnail */}
                <div className="relative flex-shrink-0">
                  {currentTrack.thumbnail ? (
                    <Avatar className="w-12 h-12 rounded-lg">
                      <AvatarImage src={currentTrack.thumbnail} />
                      <AvatarFallback className="rounded-lg bg-neutral-700">
                        <Volume2 className="w-5 h-5 text-neutral-400" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                      {currentTrack.type === "voice" ? (
                        <div className="flex items-end gap-0.5 h-4">
                          {[...Array(4)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={isPlaying ? { 
                                height: [8, 16, 8, 12, 8],
                              } : { height: 8 }}
                              transition={{ 
                                duration: 0.8, 
                                repeat: Infinity, 
                                delay: i * 0.1 
                              }}
                              className="w-1 bg-primary rounded-full"
                            />
                          ))}
                        </div>
                      ) : (
                        <Volume2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  )}
                </div>
                
                {/* Track Info */}
                <div className="flex-1 min-w-0" onClick={() => setIsExpanded(!isExpanded)}>
                  <p className="font-medium text-white text-sm truncate">
                    {currentTrack.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center active:scale-95 transition"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-black fill-black" />
                    ) : (
                      <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                    )}
                  </button>
                  
                  <button
                    onClick={stop}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-0.5 bg-neutral-800">
                <motion.div
                  className="h-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlobalAudioContext.Provider>
  );
}
