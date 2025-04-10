
import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { EmptyChat } from "./EmptyChat";
import { useChat } from "@/hooks/use-chat";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ChatInterface() {
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    retryLastMessage,
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

  return (
    <div className="flex flex-col h-[80vh] overflow-hidden rounded-xl glassmorphism border border-border/40 shadow-lg">
      <div className="p-3 border-b border-border/30 flex items-center justify-between bg-gradient-to-r from-background/80 to-muted/30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Powered by {isUsingPlayAI ? "PlayAI" : "Gemini"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline"
            className={cn(
              "text-xs transition-colors",
              isUsingPlayAI ? "bg-green-500/10 text-green-500 border-green-500/30" : "bg-blue-500/10 text-blue-500 border-blue-500/30"
            )}
          >
            {isUsingPlayAI ? "PlayAI" : "Gemini"} 
          </Badge>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 scrollbar-none space-y-4 bg-gradient-to-b from-background to-muted/20">
        {messages.length === 0 ? (
          <EmptyChat />
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              id={message.id}
              type={message.type}
              content={message.content}
              timestamp={message.timestamp}
              error={message.error}
              source={message.source}
            />
          ))
        )}
        
        {showRetryButton && (
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 bg-background/80 backdrop-blur-sm"
              onClick={retryLastMessage}
            >
              <RefreshCw size={16} /> Retry
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
