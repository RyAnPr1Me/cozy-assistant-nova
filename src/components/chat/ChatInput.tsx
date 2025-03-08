
import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Loader } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [userInput, setUserInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognition = useRef<SpeechRecognition | null>(null);

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

  return (
    <div className="p-4 border-t border-border/30">
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
