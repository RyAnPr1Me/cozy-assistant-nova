
import { useState } from "react";
import { toast } from "sonner";
import { getUpcomingEvents } from "@/services/calendar-service";
import { getBookmarks } from "@/services/bookmarks-service";
import { queryGemini, UserQuery } from "@/services/gemini-service";

export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: number;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (userInput: string) => {
    if (!userInput.trim()) return;
    
    const newUserMessage: Message = {
      id: crypto.randomUUID(),
      type: "user",
      content: userInput,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
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

  return {
    messages,
    isLoading,
    sendMessage
  };
}
