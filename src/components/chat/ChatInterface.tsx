
import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { EmptyChat } from "./EmptyChat";
import { useChat } from "@/hooks/use-chat";
import { 
  RefreshCw, 
  Sparkles, 
  ToggleLeft, 
  ToggleRight,
  BarChart3,
  Search,
  CloudSun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ChatInterface() {
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    retryLastMessage, 
    toggleAIProvider, 
    isUsingPlayAI,
    userPreferences 
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check if the last message was an error
  const lastMessage = messages[messages.length - 1];
  const showRetryButton = lastMessage?.error && !isLoading;

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case "stocks":
        return <BarChart3 size={14} className="text-green-500" />;
      case "search":
        return <Search size={14} className="text-blue-500" />;
      case "weather":
        return <CloudSun size={14} className="text-yellow-500" />;
      case "calendar":
        return <span className="text-purple-500">📅</span>;
      case "bookmarks":
        return <span className="text-orange-500">🔖</span>;
      case "news":
        return <span className="text-red-500">📰</span>;
      case "spotify":
        return <span className="text-green-500">🎵</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[80vh] overflow-hidden rounded-xl glassmorphism border border-border/40 shadow-lg">
      <div className="p-4 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <h3 className="font-medium">AI Assistant</h3>
          {userPreferences.defaultLocation && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs">
                    <CloudSun size={12} className="mr-1" />
                    {userPreferences.defaultLocation}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your default location for weather</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {userPreferences.preferredSearchProvider && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs">
                    <Search size={12} className="mr-1" />
                    {userPreferences.preferredSearchProvider === "exa" ? "Exa" : 
                     userPreferences.preferredSearchProvider === "searxng" ? "SearXNG" : 
                     "Combined Search"}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your preferred search provider</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-1 text-xs"
            onClick={toggleAIProvider}
          >
            {isUsingPlayAI ? (
              <ToggleRight size={16} className="text-green-500" />
            ) : (
              <ToggleLeft size={16} />
            )}
            {isUsingPlayAI ? "PlayAI" : "Gemini"}
          </Button>
          <Badge variant="outline" className="text-xs bg-primary/10">
            {isUsingPlayAI ? "PlayAI" : "Gemini 1.5 Pro"}
          </Badge>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 scrollbar-none space-y-6">
        {messages.length === 0 ? (
          <EmptyChat />
        ) : (
          messages.map((message) => (
            <div key={message.id} className="relative">
              {message.source && message.type === "assistant" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute -left-6 top-2">
                        {getSourceIcon(message.source)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Information from {message.source}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <ChatMessage
                id={message.id}
                type={message.type}
                content={message.content}
                timestamp={message.timestamp}
                error={message.error}
              />
            </div>
          ))
        )}
        
        {showRetryButton && (
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={retryLastMessage}
            >
              <RefreshCw size={16} /> Retry last message
            </Button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput 
        onSendMessage={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}
