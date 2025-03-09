
import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Loader, Search, BarChart3, CloudSun, Bookmark, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [userInput, setUserInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const recognition = useRef<SpeechRecognition | null>(null);

  // Generate relevant suggestions based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    const newSuggestions = [];
    
    if (hour < 12) {
      newSuggestions.push("What's the weather today?");
      newSuggestions.push("Show me the latest news");
    } else if (hour < 17) {
      newSuggestions.push("What's happening in tech?");
      newSuggestions.push("Show me AAPL stock price");
    } else {
      newSuggestions.push("Any interesting events tomorrow?");
      newSuggestions.push("Search for dinner recipes");
    }
    
    // Always add some general suggestions
    newSuggestions.push("Show my bookmarks");
    
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
    if (lowerSuggestion.includes("news")) return <span>📰</span>;
    if (lowerSuggestion.includes("stock")) return <BarChart3 size={14} />;
    if (lowerSuggestion.includes("search")) return <Search size={14} />;
    if (lowerSuggestion.includes("bookmarks")) return <Bookmark size={14} />;
    if (lowerSuggestion.includes("events")) return <Calendar size={14} />;
    return null;
  };

  return (
    <div className="p-4 border-t border-border/30">
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((suggestion, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-1"
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
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-12 glassmorphism resize-none"
          rows={1}
        />
        <Button 
          variant="outline" 
          size="icon" 
          className="h-12 w-12"
          onClick={toggleSpeechRecognition}
        >
          {isListening ? (
            <MicOff size={20} className="text-destructive" />
          ) : (
            <Mic size={20} />
          )}
        </Button>
        <Button 
          className="h-12 w-12"
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
        <div className="text-xs text-primary animate-pulse mt-2">
          Listening... (speak clearly into your microphone)
        </div>
      )}
    </div>
  );
}
