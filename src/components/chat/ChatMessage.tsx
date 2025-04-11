
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Markdown from "react-markdown";
import { AlertTriangle, Atom, Check, Command, User, Search, BarChart3, CloudSun, Bookmark, Calendar, Cpu, Code, FileCode, BrainCog } from "lucide-react";
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
        <div className="bg-blue-900/30 text-blue-200 rounded-md px-3 py-1.5 text-xs flex items-center gap-2 max-w-[85%] animate-fade-in border border-blue-500/20 shadow-inner shadow-blue-500/10">
          <Command size={14} className="text-blue-400" />
          <span>{content}</span>
          <Check size={14} className="text-green-400" />
        </div>
      </div>
    );
  }

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case "stocks":
        return <BarChart3 size={14} className="text-green-400" />;
      case "search":
        return <Search size={14} className="text-blue-400" />;
      case "weather":
        return <CloudSun size={14} className="text-yellow-400" />;
      case "calendar":
        return <Calendar size={14} className="text-purple-400" />;
      case "bookmarks":
        return <Bookmark size={14} className="text-orange-400" />;
      case "code":
        return <FileCode size={14} className="text-cyan-400" />;
      case "data":
        return <BrainCog size={14} className="text-indigo-400" />;
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
        "h-10 w-10 border-2",
        type === "user" 
          ? "bg-gradient-to-br from-blue-700 to-blue-900 text-white border-blue-500/40" 
          : "bg-gradient-to-br from-purple-700 to-purple-900 text-white border-purple-500/40"
      )}>
        {type === "assistant" ? (
          <>
            <AvatarImage src="/assistant-avatar.png" alt="Omega-3" />
            <AvatarFallback className="bg-gradient-to-br from-purple-700 to-purple-900">
              <Atom size={18} className="text-white animate-pulse" />
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-blue-700 to-blue-900">
            <User size={18} className="text-white" />
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
              ? "bg-red-900/20 border border-red-500/30 text-red-200 shadow-md" 
              : "bg-gradient-to-r from-purple-950/40 to-purple-900/30 backdrop-blur-lg border border-purple-500/20 text-purple-50 shadow-md" 
            : "bg-gradient-to-r from-blue-950/40 to-blue-900/30 backdrop-blur-lg border border-blue-500/20 text-blue-50 shadow-md"
        )}>
          {type === "assistant" && error && (
            <div className="flex items-center gap-2 mb-2 text-red-400">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">Error processing request</span>
            </div>
          )}
          
          {source && type === "assistant" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 mb-2 text-xs text-blue-300">
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
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-purple-100 prose-headings:text-purple-200 prose-a:text-blue-300">
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
