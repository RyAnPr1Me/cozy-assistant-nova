
import { useState } from "react";
import { toast } from "sonner";
import { getUpcomingEvents } from "@/services/calendar-service";
import { getBookmarks } from "@/services/bookmarks-service";
import { queryGemini, UserQuery, executeCommand, AiResponse } from "@/services/gemini-service";

export interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  error?: boolean;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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

  const sendMessage = async (userInput: string, isRetry = false) => {
    if (!userInput.trim()) return;
    
    // If this is a retry, don't add a new user message
    if (!isRetry) {
      const newUserMessage: Message = {
        id: crypto.randomUUID(),
        type: "user",
        content: userInput,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, newUserMessage]);
    }
    
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
      
      const aiResponse = await queryGemini(query);
      
      // Handle any commands in the response
      const finalResponseText = await handleCommand(aiResponse);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: "assistant",
        content: finalResponseText,
        timestamp: Date.now(),
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
    retryLastMessage
  };
}
