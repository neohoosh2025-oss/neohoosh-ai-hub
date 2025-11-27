import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaViewerProps {
  open: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: "image" | "video";
}

export function MediaViewer({ open, onClose, mediaUrl, mediaType }: MediaViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none [&>button]:hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Media Content */}
          {mediaType === "image" ? (
            <img
              src={mediaUrl}
              alt="Preview"
              className="max-w-full max-h-[95vh] object-contain"
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="max-w-full max-h-[95vh] object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
