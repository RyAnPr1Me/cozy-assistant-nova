
import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Loader, Search, BarChart3, CloudSun, Bookmark, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [userInput, setUserInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognition = useRef<SpeechRecognition | null>(null);

  // Auto resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  // Generate relevant suggestions based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    const newSuggestions = [];
    
    if (hour < 12) {
      newSuggestions.push("What's the weather today?");
      newSuggestions.push("Show me the latest news");
    } else if (hour < 17) {
      newSuggestions.push("Show me AAPL stock price");
      newSuggestions.push("Add a bookmark for example.com");
    } else {
      newSuggestions.push("Search for dinner recipes");
      newSuggestions.push("Add an event for tomorrow");
    }
    
    setSuggestions(newSuggestions);
  }, []);

  // Initialize speech recognition if available
  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        recognition.current = new SpeechRecognitionAPI();
        recognition.current.continuous = true;
        recognition.current.interimResults = true;
        
        recognition.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join("");
            
          setUserInput(transcript);
        };
        
        recognition.current.onerror = (event) => {
          console.error("Speech recognition error", event);
          setIsListening(false);
        };
        
        recognition.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognition.current) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }
    
    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
      setUserInput("");
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    // Stop speech recognition if active
    if (isListening && recognition.current) {
      recognition.current.stop();
      setIsListening(false);
    }
    
    const message = userInput;
    setUserInput("");
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    await onSendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion);
  };

  const getIconForSuggestion = (suggestion: string) => {
    const lowerSuggestion = suggestion.toLowerCase();
    if (lowerSuggestion.includes("weather")) return <CloudSun size={14} />;
    if (lowerSuggestion.includes("stock")) return <BarChart3 size={14} />;
    if (lowerSuggestion.includes("search")) return <Search size={14} />;
    if (lowerSuggestion.includes("bookmark")) return <Bookmark size={14} />;
    if (lowerSuggestion.includes("event")) return <Calendar size={14} />;
    return <Sparkles size={14} className="text-primary" />;
  };

  const commands = [
    { text: "Search for information", icon: <Search size={12} className="text-blue-500" /> },
    { text: "Add a bookmark", icon: <Bookmark size={12} className="text-orange-500" /> },
    { text: "Add an event", icon: <Calendar size={12} className="text-purple-500" /> },
    { text: "Check stock prices", icon: <BarChart3 size={12} className="text-green-500" /> },
  ];

  return (
    <div className="p-3 border-t border-border/30 bg-gradient-to-r from-background/80 to-muted/30">
      {suggestions.length > 0 && (
        <div className="flex overflow-x-auto scrollbar-none gap-2 mb-3 pb-1">
          {suggestions.map((suggestion, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-1 whitespace-nowrap"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {getIconForSuggestion(suggestion)}
              {suggestion}
            </Badge>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message or command..."
          className="min-h-12 glassmorphism resize-none bg-background/70 backdrop-blur-sm border-border/50 transition-all focus-visible:ring-primary/40"
          rows={1}
        />
        <Button 
          variant="outline" 
          size="icon" 
          className="h-12 w-12 bg-background/70 backdrop-blur-sm border-border/50 transition-colors hover:bg-primary/10"
          onClick={toggleSpeechRecognition}
        >
          {isListening ? (
            <MicOff size={20} className="text-destructive" />
          ) : (
            <Mic size={20} />
          )}
        </Button>
        <Button 
          className="h-12 w-12 bg-primary"
          size="icon"
          disabled={isLoading || !userInput.trim()}
          onClick={handleSendMessage}
        >
          {isLoading ? (
            <Loader size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </Button>
      </div>
      {isListening && (
        <div className="text-xs text-primary animate-pulse mt-2 flex items-center gap-1">
          <Mic size={12} /> Listening... (speak clearly)
        </div>
      )}
    </div>
  );
}
