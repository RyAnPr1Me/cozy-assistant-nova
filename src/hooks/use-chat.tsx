import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getUpcomingEvents } from "@/services/calendar-service";
import { getBookmarks } from "@/services/bookmarks-service";
import { getWeather } from "@/services/weather-service";
import { getNews } from "@/services/news-service";
import { getStockQuote, searchCompanies } from "@/services/alphavantage-service";
import { searchWeb, searchWithExaOnly, searchWithSearXNGOnly } from "@/services/searxng-service";
import { queryAI, UserQuery, executeCommand, AiResponse, handleAICommand } from "@/services/ai";
import { determineSearchProvider } from "@/services/ai/context-analyzer";

export interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  error?: boolean;
  source?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [usePlayAI, setUsePlayAI] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    defaultLocation: "New York",
    preferredTopics: [] as string[],
    searchLearningEnabled: true
  });

  useEffect(() => {
    const savedPreferences = localStorage.getItem("user-preferences");
    if (savedPreferences) {
      try {
        setUserPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error("Error parsing user preferences:", error);
      }
    }
  }, []);

  const updateUserPreferences = (newPreferences: Partial<typeof userPreferences>) => {
    const updatedPreferences = { ...userPreferences, ...newPreferences };
    setUserPreferences(updatedPreferences);
    localStorage.setItem("user-preferences", JSON.stringify(updatedPreferences));
    return updatedPreferences;
  };

  const toggleAIProvider = () => {
    const newValue = !usePlayAI;
    setUsePlayAI(newValue);
    toast.info(`Switched to ${newValue ? "PlayAI" : "Gemini"} as the AI provider`);
    return newValue;
  };

  const retryLastMessage = async () => {
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.type === "user");
    if (lastUserMessageIndex === -1) return;
    
    const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex];
    await sendMessage(lastUserMessage.content, true);
  };

  const learnFromUserInteraction = (userInput: string) => {
    const locationMatch = userInput.match(/(?:i am|i'm|i live) in ([a-zA-Z\s,]+)/i);
    if (locationMatch && locationMatch[1]) {
      const location = locationMatch[1].trim();
      updateUserPreferences({ defaultLocation: location });
      console.log(`Updated default location to: ${location}`);
    }
    
    const topicMatch = userInput.match(/(?:i like|i'm interested in|tell me about) ([a-zA-Z\s,]+)/i);
    if (topicMatch && topicMatch[1]) {
      const topic = topicMatch[1].trim().toLowerCase();
      if (!userPreferences.preferredTopics.includes(topic)) {
        const updatedTopics = [...userPreferences.preferredTopics, topic];
        updateUserPreferences({ preferredTopics: updatedTopics });
        console.log(`Added preferred topic: ${topic}`);
      }
    }
  };

  const sendMessage = async (userInput: string, isRetry = false) => {
    if (!userInput.trim()) return;
    
    if (userInput.toLowerCase().includes("use playai") || userInput.toLowerCase().includes("switch to playai")) {
      setUsePlayAI(true);
      toast.success("Switched to PlayAI for conversation");
      
      const systemMessage: Message = {
        id: crypto.randomUUID(),
        type: "system",
        content: "Switched to PlayAI for conversation",
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, systemMessage]);
      return;
    }
    
    if (userInput.toLowerCase().includes("use gemini") || userInput.toLowerCase().includes("switch to gemini")) {
      setUsePlayAI(false);
      toast.success("Switched to Gemini for conversation");
      
      const systemMessage: Message = {
        id: crypto.randomUUID(),
        type: "system",
        content: "Switched to Gemini for conversation",
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, systemMessage]);
      return;
    }
    
    if (!isRetry) {
      const newUserMessage = {
        id: crypto.randomUUID(),
        type: "user",
        content: userInput,
        timestamp: Date.now(),
      } as Message;
      
      setMessages(prev => [...prev, newUserMessage]);
      
      learnFromUserInteraction(userInput);
    }
    
    setIsLoading(true);
    
    try {
      const query: UserQuery = { 
        query: userInput,
        usePlayAI: usePlayAI,
        searchProvider: determineSearchProvider(userInput)
      };
      
      const aiResponse = await queryAI(query);
      
      const finalResponseText = await handleAICommand(aiResponse);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: "assistant",
        content: finalResponseText,
        timestamp: Date.now(),
        source: query.source,
      };
      
      if (isRetry) {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastAssistantIndex = newMessages.findIndex(m => m.type === "assistant");
          if (lastAssistantIndex !== -1) {
            newMessages[lastAssistantIndex] = assistantMessage;
          } else {
            newMessages.push(assistantMessage);
          }
          return newMessages;
        });
      } else {
        setMessages(prev => [...prev, assistantMessage]);
      }
      
      setRetryCount(0);
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      if (!isRetry) {
        setRetryCount(prev => prev + 1);
      }
      
      if (retryCount >= 2) {
        toast.error("Multiple failures encountered. Please check your API keys in Settings.");
      } else {
        toast.error("Failed to get a response from the assistant");
      }
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        timestamp: Date.now(),
        error: true
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    retryLastMessage,
    toggleAIProvider,
    isUsingPlayAI: usePlayAI,
    userPreferences
  };
}
