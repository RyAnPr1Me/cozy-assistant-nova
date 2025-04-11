
import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Loader, Search, BarChart3, CloudSun, Bookmark, Calendar, Sparkles, Zap, Brain, FileCode, PenTool } from "lucide-react";
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
      newSuggestions.push("Write a short sci-fi story");
    } else if (hour < 17) {
      newSuggestions.push("Show me AAPL stock price");
      newSuggestions.push("Generate a React component");
    } else {
      newSuggestions.push("Explain quantum computing");
      newSuggestions.push("Create a data visualization");
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
    if (lowerSuggestion.includes("weather")) return <CloudSun size={14} className="text-yellow-400" />;
    if (lowerSuggestion.includes("stock")) return <BarChart3 size={14} className="text-green-400" />;
    if (lowerSuggestion.includes("search")) return <Search size={14} className="text-blue-400" />;
    if (lowerSuggestion.includes("bookmark")) return <Bookmark size={14} className="text-orange-400" />;
    if (lowerSuggestion.includes("event")) return <Calendar size={14} className="text-purple-400" />;
    if (lowerSuggestion.includes("story")) return <PenTool size={14} className="text-pink-400" />;
    if (lowerSuggestion.includes("component")) return <FileCode size={14} className="text-indigo-400" />;
    if (lowerSuggestion.includes("quantum")) return <Brain size={14} className="text-violet-400" />;
    if (lowerSuggestion.includes("visualization")) return <BarChart3 size={14} className="text-teal-400" />;
    return <Zap size={14} className="text-blue-400" />;
  };

  return (
    <div>
      {suggestions.length > 0 && (
        <div className="flex overflow-x-auto scrollbar-none gap-2 mb-3 pb-1">
          {suggestions.map((suggestion, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="cursor-pointer hover:bg-blue-800/30 transition-colors flex items-center gap-1 whitespace-nowrap border-blue-500/30 text-blue-300 bg-blue-900/20"
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
          placeholder="Ask Omega-3 anything..."
          className="min-h-12 resize-none bg-background/30 backdrop-blur-lg border-blue-800/50 focus:border-blue-500/50 transition-all focus-visible:ring-blue-500/40 text-blue-100 placeholder:text-blue-300/50 rounded-xl"
          rows={1}
        />
        <Button 
          variant="outline" 
          size="icon" 
          className="h-12 w-12 bg-blue-950/50 backdrop-blur-lg border-blue-800/50 transition-colors hover:bg-blue-900/30 text-blue-300 hover:text-blue-100 rounded-xl"
          onClick={toggleSpeechRecognition}
        >
          {isListening ? (
            <MicOff size={20} className="text-red-400" />
          ) : (
            <Mic size={20} />
          )}
        </Button>
        <Button 
          className="h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl"
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
        <div className="text-xs text-blue-400 animate-pulse mt-2 flex items-center gap-1">
          <Mic size={12} /> Listening... (speak clearly)
        </div>
      )}
    </div>
  );
}
