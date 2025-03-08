
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: number;
}

export function ChatMessage({ id, type, content, timestamp }: ChatMessageProps) {
  return (
    <div 
      key={id} 
      className={cn(
        "animate-slide-up max-w-[80%] rounded-xl p-4",
        type === "user" 
          ? "bg-primary/10 ml-auto" 
          : "bg-secondary ml-0"
      )}
    >
      <p className="whitespace-pre-wrap">{content}</p>
      <div className={cn(
        "text-xs mt-2 text-muted-foreground",
        type === "user" ? "text-right" : "text-left"
      )}>
        {new Date(timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
