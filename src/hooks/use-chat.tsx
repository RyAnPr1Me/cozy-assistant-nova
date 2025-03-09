
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getUpcomingEvents } from "@/services/calendar-service";
import { getBookmarks } from "@/services/bookmarks-service";
import { getWeather } from "@/services/weather-service";
import { getNews } from "@/services/news-service";
import { getStockQuote, searchCompanies } from "@/services/alphavantage-service";
import { searchWeb } from "@/services/searxng-service";
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
    preferredTopics: [] as string[]
  });

  // Load user preferences from localStorage
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

  // Save user preferences to localStorage
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
    // Find the last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.type === "user");
    if (lastUserMessageIndex === -1) return;
    
    const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex];
    await sendMessage(lastUserMessage.content, true);
  };

  const handleCommand = async (response: AiResponse) => {
    if (!response.command) return response.text;
    
    try {
      const resultMessage = await executeCommand(response.command);
      
      // Add system message about successful command execution
      const systemMessage: Message = {
        id: crypto.randomUUID(),
        type: "system",
        content: resultMessage,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, systemMessage]);
      
      // Add confirmation details to the response text
      return `${response.text}\n\n✅ ${resultMessage}`;
    } catch (error) {
      console.error("Error executing command:", error);
      return `${response.text}\n\n❌ Sorry, I couldn't complete that action.`;
    }
  };

  // Learn from user interaction to update preferences
  const learnFromUserInteraction = (userInput: string) => {
    // Extract location preferences
    const locationMatch = userInput.match(/(?:i am|i'm|i live) in ([a-zA-Z\s,]+)/i);
    if (locationMatch && locationMatch[1]) {
      const location = locationMatch[1].trim();
      updateUserPreferences({ defaultLocation: location });
      console.log(`Updated default location to: ${location}`);
    }
    
    // Extract topic preferences
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
    
    // Check for commands to switch AI providers
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
    
    // If this is a retry, don't add a new user message
    if (!isRetry) {
      const newUserMessage: Message = {
        id: crypto.randomUUID(),
        type: "user",
        content: userInput,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, newUserMessage]);
      
      // Learn from user interaction
      learnFromUserInteraction(userInput);
    }
    
    setIsLoading(true);
    
    try {
      // Prepare query with potential context
      const query: UserQuery = { 
        query: userInput,
        usePlayAI: usePlayAI
      };
      
      // Check for stock/finance related queries
      if (userInput.toLowerCase().includes("stock") || 
          userInput.toLowerCase().includes("market") || 
          userInput.toLowerCase().includes("finance") ||
          userInput.toLowerCase().includes("invest")) {
        
        // Extract potential symbol
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
          // Try to find company by name
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
      
      // Check for web search queries
      if (userInput.toLowerCase().includes("search") || 
          userInput.toLowerCase().includes("find") || 
          userInput.toLowerCase().includes("look up") ||
          userInput.toLowerCase().startsWith("what is") ||
          userInput.toLowerCase().startsWith("who is") ||
          userInput.toLowerCase().startsWith("how to")) {
        
        // Extract search term
        let searchTerm = userInput;
        searchTerm = searchTerm.replace(/^(search for|search|find|look up|tell me about)/i, '').trim();
        
        if (searchTerm) {
          try {
            const searchResults = await searchWeb(searchTerm);
            if (searchResults && searchResults.length > 0) {
              query.source = "search";
              query.context = { results: searchResults.slice(0, 5), query: searchTerm };
            }
          } catch (error) {
            console.error("Error searching the web:", error);
          }
        }
      }
      
      // Check if the query is related to weather
      if (userInput.toLowerCase().includes("weather") || 
          userInput.toLowerCase().includes("temperature") || 
          userInput.toLowerCase().includes("forecast")) {
        
        // Try to extract location from query, otherwise use user's default location
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
      
      // Check if the query is related to news
      if (userInput.toLowerCase().includes("news") || 
          userInput.toLowerCase().includes("headlines") || 
          userInput.toLowerCase().includes("current events")) {
        
        // Try to extract topic from query, otherwise use a preferred topic
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
      
      const aiResponse = await queryGemini(query);
      
      // Handle any commands in the response
      const finalResponseText = await handleCommand(aiResponse);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: "assistant",
        content: finalResponseText,
        timestamp: Date.now(),
        source: query.source,
      };
      
      // If it's a retry, replace the last assistant message
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
      
      // Reset retry count on successful message
      setRetryCount(0);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // If error message contains "retry", add an error message and option to retry
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      // Only increment retry count if this wasn't already a retry
      if (!isRetry) {
        setRetryCount(prev => prev + 1);
      }
      
      // If we've tried too many times, show a more detailed error
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
    userPreferences,
    updateUserPreferences
  };
}
