
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Markdown from "react-markdown";
import { AlertTriangle } from "lucide-react";

interface ChatMessageProps {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: number;
  error?: boolean;
}

export function ChatMessage({ type, content, timestamp, error }: ChatMessageProps) {
  const formattedTime = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  
  return (
    <div className={`flex gap-3 ${type === "assistant" ? "flex-row" : "flex-row-reverse"}`}>
      <Avatar className={`h-8 w-8 ${type === "user" ? "bg-primary" : "bg-muted"}`}>
        {type === "assistant" ? (
          <>
            <AvatarImage src="/assistant-avatar.png" alt="AI Assistant" />
            <AvatarFallback>AI</AvatarFallback>
          </>
        ) : (
          <AvatarFallback>You</AvatarFallback>
        )}
      </Avatar>
      
      <div className={`flex flex-col max-w-[85%] ${
        type === "assistant" ? "items-start" : "items-end"
      }`}>
        <div className={`rounded-lg p-3 ${
          type === "assistant" 
            ? error 
              ? "bg-red-500/10 border border-red-500/30 text-foreground" 
              : "bg-muted text-foreground" 
            : "bg-primary text-primary-foreground"
        }`}>
          {type === "assistant" && error && (
            <div className="flex items-center gap-2 mb-2 text-red-500">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">Error processing request</span>
            </div>
          )}
          
          {type === "assistant" ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown>{content}</Markdown>
            </div>
          ) : (
            <p>{content}</p>
          )}
        </div>
        
        <span className="text-xs text-muted-foreground mt-1">{formattedTime}</span>
      </div>
    </div>
  );
}
