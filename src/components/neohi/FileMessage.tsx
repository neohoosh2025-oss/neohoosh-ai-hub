import { FileText, Download, FileImage, FileVideo, Music2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface FileMessageProps {
  url: string;
  type: "document" | "file";
  fileName?: string;
  isOwn?: boolean;
}

export function FileMessage({ url, type, fileName, isOwn = false }: FileMessageProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const getIcon = () => {
    const ext = url.split(".").pop()?.toLowerCase();
    
    if (ext?.match(/pdf|doc|docx|txt/)) return FileText;
    if (ext?.match(/jpg|jpeg|png|gif|webp/)) return FileImage;
    if (ext?.match(/mp4|mov|avi|mkv/)) return FileVideo;
    if (ext?.match(/mp3|wav|m4a|ogg/)) return Music2;
    
    return FileText;
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDownloading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || `file-${Date.now()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      
      toast({
        title: "دانلود شد",
        description: "فایل با موفقیت دانلود شد",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "خطا",
        description: "دانلود فایل با مشکل مواجه شد",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const Icon = getIcon();
  const displayName = fileName || "فایل";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleDownload}
      className={`flex items-center gap-3 rounded-2xl p-3 min-w-[220px] max-w-[300px] transition-all cursor-pointer ${
        isOwn
          ? "bg-[hsl(var(--neohi-bubble-user))]/50 backdrop-blur-sm hover:bg-[hsl(var(--neohi-bubble-user))]/70"
          : "bg-[hsl(var(--neohi-bg-hover))] border border-[hsl(var(--neohi-border))] hover:border-[hsl(var(--neohi-accent))]/50"
      } ${isDownloading ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[hsl(var(--neohi-accent))]/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-[hsl(var(--neohi-accent))]" />
      </div>

      {/* Download Icon */}
      <Download className="h-5 w-5 text-[hsl(var(--neohi-text-secondary))] flex-shrink-0" />
    </motion.div>
  );
}
