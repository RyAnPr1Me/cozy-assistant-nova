
import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { EmptyChat } from "./EmptyChat";
import { useChat } from "@/hooks/use-chat";
import { RefreshCw, Sparkles, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ChatInterface() {
  const { messages, isLoading, sendMessage, retryLastMessage, toggleAIProvider, isUsingPlayAI } = useChat();
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
      <div className="p-4 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <h3 className="font-medium">AI Assistant</h3>
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
            <ChatMessage
              key={message.id}
              id={message.id}
              type={message.type}
              content={message.content}
              timestamp={message.timestamp}
              error={message.error}
            />
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
