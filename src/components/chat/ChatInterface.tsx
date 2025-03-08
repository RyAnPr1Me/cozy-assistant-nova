
import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Loader } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { queryGemini, UserQuery } from "@/services/gemini-service";
import { getUpcomingEvents } from "@/services/calendar-service";
import { getBookmarks } from "@/services/bookmarks-service";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: number;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    
    const newUserMessage: Message = {
      id: crypto.randomUUID(),
      type: "user",
      content: userInput,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput("");
    setIsLoading(true);
    
    try {
      // Add context based on user query
      const query: UserQuery = { query: userInput };
      
      // Check if the query is related to calendar
      if (userInput.toLowerCase().includes("calendar") || 
          userInput.toLowerCase().includes("schedule") || 
          userInput.toLowerCase().includes("event")) {
        query.source = "calendar";
        query.context = getUpcomingEvents(10);
      }
      
      // Check if the query is related to bookmarks
      if (userInput.toLowerCase().includes("bookmark") || 
          userInput.toLowerCase().includes("website") || 
          userInput.toLowerCase().includes("link")) {
        query.source = "bookmarks";
        query.context = getBookmarks();
      }
      
      const response = await queryGemini(query);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: "assistant",
        content: response,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get a response from the assistant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[80vh] overflow-hidden rounded-xl glassmorphism">
      <div className="flex-1 overflow-y-auto p-4 scrollbar-none space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="text-3xl animate-floating">👋</div>
            </div>
            <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
            <p className="text-muted-foreground max-w-md">
              Ask me anything about your calendar, bookmarks, or just have a conversation.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "animate-slide-up max-w-[80%] rounded-xl p-4",
                message.type === "user" 
                  ? "bg-primary/10 ml-auto" 
                  : "bg-secondary ml-0"
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <div className={cn(
                "text-xs mt-2 text-muted-foreground",
                message.type === "user" ? "text-right" : "text-left"
              )}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
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
    </div>
  );
}
