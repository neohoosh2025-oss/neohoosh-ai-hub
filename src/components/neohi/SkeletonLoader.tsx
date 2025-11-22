import { Skeleton } from "@/components/ui/skeleton";

export const ChatListSkeleton = () => {
  return (
    <div className="space-y-2 p-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
};

export const StoryBarSkeleton = () => {
  return (
    <div className="flex gap-3 p-4 overflow-x-auto">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
};

export const MessageListSkeleton = () => {
  return (
    <div className="space-y-4 p-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className={cn("flex gap-2 animate-fade-in", i % 3 === 0 ? "justify-end" : "justify-start")}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {i % 3 !== 0 && <Skeleton className="w-8 h-8 rounded-full" />}
          <div className="space-y-2">
            <Skeleton className={cn("h-12 rounded-2xl", i % 3 === 0 ? "w-48" : "w-64")} />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ");
