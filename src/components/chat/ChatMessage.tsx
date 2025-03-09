
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Markdown from "react-markdown";
import { AlertTriangle, Bot, Check, Command, User } from "lucide-react";

interface ChatMessageProps {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  error?: boolean;
}

export function ChatMessage({ type, content, timestamp, error }: ChatMessageProps) {
  const formattedTime = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  
  if (type === "system") {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-secondary/30 text-secondary-foreground rounded-md px-3 py-1.5 text-sm flex items-center gap-2 max-w-[85%]">
          <Command size={14} />
          <span>{content}</span>
          <Check size={14} className="text-green-500" />
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex gap-3 ${type === "assistant" ? "flex-row" : "flex-row-reverse"}`}>
      <Avatar className={`h-8 w-8 ${type === "user" ? "bg-primary" : "bg-muted"}`}>
        {type === "assistant" ? (
          <>
            <AvatarImage src="/assistant-avatar.png" alt="AI Assistant" />
            <AvatarFallback>
              <Bot size={16} />
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback>
            <User size={16} />
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className={`flex flex-col max-w-[85%] ${
        type === "assistant" ? "items-start" : "items-end"
      }`}>
        <div className={`rounded-lg p-3 ${
          type === "assistant" 
            ? error 
              ? "bg-red-500/10 border border-red-500/30 text-foreground" 
              : "bg-muted/80 glassmorphism text-foreground" 
            : "bg-primary glassmorphism text-primary-foreground"
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
