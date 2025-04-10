
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getUpcomingEvents } from "@/services/calendar-service";
import { getBookmarks } from "@/services/bookmarks-service";
import { getWeather } from "@/services/weather-service";
import { getNews } from "@/services/news-service";
import { getStockQuote, searchCompanies } from "@/services/alphavantage-service";
import { searchWeb, searchWithExaOnly, searchWithSearXNGOnly } from "@/services/searxng-service";
import { queryGemini, UserQuery, executeCommand, AiResponse } from "@/services/gemini-service";

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

  const handleCommand = async (response: AiResponse) => {
    if (!response.command) return response.text;
    
    try {
      const resultMessage = await executeCommand(response.command);
      
      const systemMessage: Message = {
        id: crypto.randomUUID(),
        type: "system",
        content: resultMessage,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, systemMessage]);
      
      return `${response.text}\n\n✅ ${resultMessage}`;
    } catch (error) {
      console.error("Error executing command:", error);
      return `${response.text}\n\n❌ Sorry, I couldn't complete that action.`;
    }
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

  // Intelligently determine which search provider to use based on query
  const determineSearchProvider = (query: string) => {
    // Use Exa for more precise factual queries or academic/scientific topics
    if (query.toLowerCase().includes("research") || 
        query.toLowerCase().includes("academic") || 
        query.toLowerCase().includes("scientific") ||
        query.toLowerCase().includes("study") ||
        query.toLowerCase().includes("paper") ||
        query.toLowerCase().includes("fact") ||
        query.toLowerCase().includes("precise") ||
        /^(what|who|when|where|why|how) (is|are|was|were|did|do|does)/.test(query.toLowerCase())) {
      return "exa";
    }
    
    // Use SearXNG for simple queries or recent information
    if (query.toLowerCase().includes("latest") || 
        query.toLowerCase().includes("recent") ||
        query.toLowerCase().includes("current") ||
        query.toLowerCase().includes("today") ||
        query.toLowerCase().includes("news")) {
      return "searxng";
    }
    
    // Default to combined for complex queries or if unsure
    return "combined";
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
      const newUserMessage: Message = {
        id: crypto.randomUUID(),
        type: "user",
        content: userInput,
        timestamp: Date.now(),
      };
      
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
      
      if (userInput.toLowerCase().includes("stock") || 
          userInput.toLowerCase().includes("market") || 
          userInput.toLowerCase().includes("finance") ||
          userInput.toLowerCase().includes("invest")) {
        
        const symbolMatch = userInput.match(/stock (?:of|for|price|quote) ([A-Za-z]+)/i) || 
                           userInput.match(/([A-Za-z]{1,5}) stock/i);
        
        if (symbolMatch && symbolMatch[1]) {
          const symbol = symbolMatch[1].trim().toUpperCase();
          try {
            const quoteData = await getStockQuote(symbol);
            if (quoteData) {
              query.source = "stocks";
              query.context = { quote: quoteData };
            }
          } catch (error) {
            console.error("Error fetching stock data:", error);
          }
        } else {
          const companyMatch = userInput.match(/(?:about|for|of) ([A-Za-z\s]+?)(?:\'s)? stock/i);
          if (companyMatch && companyMatch[1]) {
            const companyName = companyMatch[1].trim();
            try {
              const searchResults = await searchCompanies(companyName);
              if (searchResults.length > 0) {
                const symbol = searchResults[0]["1. symbol"];
                const quoteData = await getStockQuote(symbol);
                if (quoteData) {
                  query.source = "stocks";
                  query.context = { 
                    quote: quoteData,
                    company: { name: companyName, symbol: symbol }
                  };
                }
              }
            } catch (error) {
              console.error("Error searching for company:", error);
            }
          }
        }
      }
      
      if (userInput.toLowerCase().includes("search") || 
          userInput.toLowerCase().includes("find") || 
          userInput.toLowerCase().includes("look up") ||
          userInput.toLowerCase().startsWith("what is") ||
          userInput.toLowerCase().startsWith("who is") ||
          userInput.toLowerCase().startsWith("how to")) {
        
        let searchTerm = userInput;
        searchTerm = searchTerm.replace(/^(search for|search|find|look up|tell me about)/i, '').trim();
        
        if (searchTerm) {
          try {
            let searchResults;
            const searchProvider = determineSearchProvider(userInput);
            
            if (searchProvider === "exa") {
              searchResults = await searchWithExaOnly(searchTerm);
            } else if (searchProvider === "searxng") {
              searchResults = await searchWithSearXNGOnly(searchTerm);
            } else {
              searchResults = await searchWeb(searchTerm);
            }
            
            if (searchResults && searchResults.length > 0) {
              query.source = "search";
              query.context = { 
                results: searchResults.slice(0, 5), 
                query: searchTerm,
                provider: searchProvider
              };
            }
          } catch (error) {
            console.error("Error searching the web:", error);
          }
        }
      }
      
      if (userInput.toLowerCase().includes("weather") || 
          userInput.toLowerCase().includes("temperature") || 
          userInput.toLowerCase().includes("forecast")) {
        
        let location = userPreferences.defaultLocation;
        const locationMatch = userInput.match(/weather (?:in|at|for) ([a-zA-Z\s,]+)/i);
        if (locationMatch && locationMatch[1]) {
          location = locationMatch[1].trim();
        }
        
        try {
          const weatherData = await getWeather(location);
          query.source = "weather";
          query.context = weatherData;
        } catch (error) {
          console.error("Error fetching weather data:", error);
        }
      }
      
      if (userInput.toLowerCase().includes("news") || 
          userInput.toLowerCase().includes("headlines") || 
          userInput.toLowerCase().includes("current events")) {
        
        let topic = userPreferences.preferredTopics[0] || "latest";
        const topicMatch = userInput.match(/news (?:about|on) ([a-zA-Z\s,]+)/i);
        if (topicMatch && topicMatch[1]) {
          topic = topicMatch[1].trim();
        }
        
        try {
          const newsData = await getNews(topic);
          query.source = "news";
          query.context = newsData;
        } catch (error) {
          console.error("Error fetching news data:", error);
        }
      }
      
      if (userInput.toLowerCase().includes("calendar") || 
          userInput.toLowerCase().includes("schedule") || 
          userInput.toLowerCase().includes("event")) {
        query.source = "calendar";
        query.context = getUpcomingEvents(10);
      }
      
      if (userInput.toLowerCase().includes("bookmark") || 
          userInput.toLowerCase().includes("website") || 
          userInput.toLowerCase().includes("link")) {
        query.source = "bookmarks";
        query.context = getBookmarks();
      }
      
      const aiResponse = await queryGemini(query);
      
      const finalResponseText = await handleCommand(aiResponse);
      
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
