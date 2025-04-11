
import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { EmptyChat } from "./EmptyChat";
import { useChat } from "@/hooks/use-chat";
import { 
  RefreshCw, 
  Sparkles, 
  Settings, 
  User, 
  Database,
  Zap,
  Brain,
  Atom,
  FileCode,
  FileText,
  PenTool,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function ChatInterface() {
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    retryLastMessage,
    isUsingPlayAI,
    userPreferences,
    isAuthenticated
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
    <div className="flex flex-col h-[80vh] overflow-hidden rounded-xl glassmorphism border border-border/40 shadow-lg bg-gradient-to-b from-black/40 to-black/10 backdrop-blur-md">
      <div className="p-3 border-b border-border/30 flex items-center justify-between bg-gradient-to-r from-purple-500/20 to-blue-500/20">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <Atom size={20} className="text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">OMEGA-3</h3>
            <p className="text-xs text-blue-200/70">
              Advanced AI • Powered by {isUsingPlayAI ? "PlayAI" : "Gemini"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Badge 
              variant="outline"
              className="bg-green-500/10 text-green-400 border-green-500/30 flex items-center gap-1"
            >
              <Database size={12} />
              <span className="text-xs">Personalized</span>
            </Badge>
          ) : (
            <Link to="/settings">
              <Badge 
                variant="outline"
                className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 flex items-center gap-1 cursor-pointer"
              >
                <User size={12} />
                <span className="text-xs">Sign in for personalization</span>
              </Badge>
            </Link>
          )}
          <Badge 
            variant="outline"
            className={cn(
              "text-xs transition-colors",
              isUsingPlayAI ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-blue-500/10 text-blue-400 border-blue-500/30"
            )}
          >
            {isUsingPlayAI ? "PlayAI" : "Gemini"} 
          </Badge>
          <Link to="/settings">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-300 hover:text-blue-100 hover:bg-blue-800/20">
              <Settings size={16} />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 scrollbar-none space-y-4 bg-gradient-to-b from-black/20 to-purple-900/10">
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
              <RefreshCw size={16} className="text-blue-400" /> Retry
            </Button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t border-blue-900/30 bg-gradient-to-r from-background/70 to-purple-900/10">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="flex items-center gap-1 py-1 px-2 bg-purple-600/10 text-purple-400 border-purple-500/30 hover:bg-purple-600/20 cursor-pointer transition-all duration-300">
            <FileText size={12} /> Text Generation
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 py-1 px-2 bg-blue-600/10 text-blue-400 border-blue-500/30 hover:bg-blue-600/20 cursor-pointer transition-all duration-300">
            <FileCode size={12} /> Code Assistance
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 py-1 px-2 bg-green-600/10 text-green-400 border-green-500/30 hover:bg-green-600/20 cursor-pointer transition-all duration-300">
            <Brain size={12} /> Data Analysis
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 py-1 px-2 bg-yellow-600/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-600/20 cursor-pointer transition-all duration-300">
            <PenTool size={12} /> Creative Writing
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 py-1 px-2 bg-pink-600/10 text-pink-400 border-pink-500/30 hover:bg-pink-600/20 cursor-pointer transition-all duration-300">
            <Palette size={12} /> Visual Descriptions
          </Badge>
        </div>
        
        <ChatInput 
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
