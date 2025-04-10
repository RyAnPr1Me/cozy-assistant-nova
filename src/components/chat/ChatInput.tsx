
import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Loader, Search, BarChart3, CloudSun, Bookmark, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      newSuggestions.push("Show me AAPL stock price");
      newSuggestions.push("Add a bookmark for example.com");
    } else {
      newSuggestions.push("Search for dinner recipes");
      newSuggestions.push("Add an event for tomorrow");
    }
    
    // Add a couple command examples
    newSuggestions.push("Use Exa search");
    
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
    if (lowerSuggestion.includes("stock")) return <BarChart3 size={14} />;
    if (lowerSuggestion.includes("search") || lowerSuggestion.includes("exa")) return <Search size={14} />;
    if (lowerSuggestion.includes("bookmark")) return <Bookmark size={14} />;
    if (lowerSuggestion.includes("event")) return <Calendar size={14} />;
    return null;
  };

  const commands = [
    { text: "Use Exa search", icon: <Search size={12} className="text-blue-500" /> },
    { text: "Use SearXNG search", icon: <Search size={12} className="text-orange-500" /> },
    { text: "Add a bookmark", icon: <Bookmark size={12} /> },
    { text: "Add an event", icon: <Calendar size={12} /> },
  ];

  return (
    <div className="p-3 border-t border-border/30">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-wrap gap-2 mb-2">
              {commands.map((cmd, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-1"
                  onClick={() => handleSuggestionClick(cmd.text)}
                >
                  {cmd.icon}
                  {cmd.text}
                </Badge>
              ))}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Click to use these commands</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
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
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message or command..."
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
          Listening... (speak clearly)
        </div>
      )}
    </div>
  );
}
