import React, { createContext, useContext, useState, ReactNode } from "react";

interface VideoData {
  url?: string;
  file?: File;
  title?: string;
  thumbnail?: string;
  duration?: number;
  audioUrl?: string;
}

interface SubtitleData {
  raw?: string;
  formatted?: string;
  timestamps?: Array<{ start: number; end: number; text: string }>;
}

interface TranslationData {
  original?: string;
  translated?: string;
  language?: string;
}

interface NeoFluxContextType {
  video: VideoData | null;
  setVideo: (video: VideoData | null) => void;
  subtitle: SubtitleData | null;
  setSubtitle: (subtitle: SubtitleData | null) => void;
  translation: TranslationData | null;
  setTranslation: (translation: TranslationData | null) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  addToHistory: (task: any) => void;
  history: any[];
}

const NeoFluxContext = createContext<NeoFluxContextType | undefined>(undefined);

export const NeoFluxProvider = ({ children }: { children: ReactNode }) => {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [subtitle, setSubtitle] = useState<SubtitleData | null>(null);
  const [translation, setTranslation] = useState<TranslationData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<any[]>(() => {
    const stored = localStorage.getItem("neoflux-history");
    return stored ? JSON.parse(stored) : [];
  });

  const addToHistory = (task: any) => {
    const newHistory = [{ ...task, id: Date.now(), timestamp: new Date().toISOString() }, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem("neoflux-history", JSON.stringify(newHistory));
  };

  return (
    <NeoFluxContext.Provider
      value={{
        video,
        setVideo,
        subtitle,
        setSubtitle,
        translation,
        setTranslation,
        isProcessing,
        setIsProcessing,
        addToHistory,
        history,
      }}
    >
      {children}
    </NeoFluxContext.Provider>
  );
};

export const useNeoFlux = () => {
  const context = useContext(NeoFluxContext);
  if (!context) {
    throw new Error("useNeoFlux must be used within NeoFluxProvider");
  }
  return context;
};
