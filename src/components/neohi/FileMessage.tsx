import { FileText, Download, FileImage, FileVideo, Music2 } from "lucide-react";
import { motion } from "framer-motion";

interface FileMessageProps {
  url: string;
  type: "document" | "file";
  fileName?: string;
  isOwn?: boolean;
}

export function FileMessage({ url, type, fileName, isOwn = false }: FileMessageProps) {
  const getIcon = () => {
    const ext = url.split(".").pop()?.toLowerCase();
    
    if (ext?.match(/pdf|doc|docx|txt/)) return FileText;
    if (ext?.match(/jpg|jpeg|png|gif|webp/)) return FileImage;
    if (ext?.match(/mp4|mov|avi|mkv/)) return FileVideo;
    if (ext?.match(/mp3|wav|m4a|ogg/)) return Music2;
    
    return FileText;
  };

  const Icon = getIcon();
  const displayName = fileName || "فایل";

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-3 rounded-2xl p-3 min-w-[220px] max-w-[300px] transition-all ${
        isOwn
          ? "bg-[hsl(var(--neohi-bubble-user))]/50 backdrop-blur-sm hover:bg-[hsl(var(--neohi-bubble-user))]/70"
          : "bg-[hsl(var(--neohi-bg-hover))] border border-[hsl(var(--neohi-border))] hover:border-[hsl(var(--neohi-accent))]/50"
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[hsl(var(--neohi-accent))]/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-[hsl(var(--neohi-accent))]" />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[hsl(var(--neohi-text-primary))] truncate">
          {displayName}
        </p>
        <p className="text-xs text-[hsl(var(--neohi-text-secondary))] mt-0.5">
          کلیک برای دانلود
        </p>
      </div>

      {/* Download Icon */}
      <Download className="h-4 w-4 text-[hsl(var(--neohi-text-secondary))] flex-shrink-0" />
    </motion.a>
  );
}
