
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Markdown from "react-markdown";
import { AlertTriangle, Bot, Check, Command, User, Search, BarChart3, CloudSun, Bookmark, Calendar } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  error?: boolean;
  source?: string;
}

export function ChatMessage({ id, type, content, timestamp, error, source }: ChatMessageProps) {
  const formattedTime = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  
  if (type === "system") {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-secondary/30 text-secondary-foreground rounded-md px-3 py-1.5 text-xs flex items-center gap-2 max-w-[85%] animate-fade-in">
          <Command size={14} />
          <span>{content}</span>
          <Check size={14} className="text-green-500" />
        </div>
      </div>
    );
  }

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case "stocks":
        return <BarChart3 size={14} className="text-green-500" />;
      case "search":
        return <Search size={14} className="text-blue-500" />;
      case "weather":
        return <CloudSun size={14} className="text-yellow-500" />;
      case "calendar":
        return <Calendar size={14} className="text-purple-500" />;
      case "bookmarks":
        return <Bookmark size={14} className="text-orange-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className={cn(
      "flex gap-3 animate-fade-in",
      type === "assistant" ? "flex-row" : "flex-row-reverse"
    )}>
      <Avatar className={cn(
        "h-8 w-8",
        type === "user" 
          ? "bg-primary/20 text-primary ring-2 ring-primary/40" 
          : "bg-muted/80 text-foreground ring-2 ring-muted/40"
      )}>
        {type === "assistant" ? (
          <>
            <AvatarImage src="/assistant-avatar.png" alt="AI Assistant" />
            <AvatarFallback className="bg-gradient-to-br from-background to-muted">
              <Bot size={16} />
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/60">
            <User size={16} />
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className={cn(
        "flex flex-col max-w-[85%]",
        type === "assistant" ? "items-start" : "items-end"
      )}>
        <div className={cn(
          "rounded-lg p-3",
          type === "assistant" 
            ? error 
              ? "bg-red-500/10 border border-red-500/30 text-foreground" 
              : "bg-card/50 backdrop-blur-sm border border-muted/40 text-card-foreground shadow-sm" 
            : "bg-primary/10 backdrop-blur-sm border border-primary/20 text-primary-foreground"
        )}>
          {type === "assistant" && error && (
            <div className="flex items-center gap-2 mb-2 text-red-500">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">Error processing request</span>
            </div>
          )}
          
          {source && type === "assistant" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
                    {getSourceIcon(source)}
                    <span>Information from {source}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Data source: {source}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {type === "assistant" ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown>{content}</Markdown>
            </div>
          ) : (
            <p>{content}</p>
          )}
        </div>
        
        <span className="text-xs text-muted-foreground mt-1 px-1">{formattedTime}</span>
      </div>
    </div>
  );
}
