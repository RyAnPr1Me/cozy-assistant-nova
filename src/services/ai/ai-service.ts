
import { toast } from "sonner";
import { UserQuery, AiResponse } from "./types";
import { enhanceQueryWithContext } from "./context-analyzer";
import { buildPrompt } from "./prompt-builder";
import { queryGeminiAPI } from "./gemini-service";
import { executeCommand } from "./command-handler";
import { sendMessageToPlayAI } from "../playai-service";
import { getUserPreferences } from "../user-preferences-service";

/**
 * Main entry point for AI queries
 */
export async function queryAI(query: UserQuery): Promise<AiResponse> {
  // Try to get user preferences
  const userPreferences = await getUserPreferences();
  
  // Use user's preferred AI if set in Supabase
  let usePlayAI = query.usePlayAI;
  if (userPreferences?.ai_provider === 'playai') {
    usePlayAI = true;
  }
  
  // Use PlayAI if explicitly requested or set in preferences
  if (usePlayAI || query.query.toLowerCase().includes("playai")) {
    try {
      console.log("Using PlayAI for query:", query.query);
      
      let contextData;
      if (query.source === "weather" || query.source === "news" || query.source === "calendar" || 
          query.source === "bookmarks" || query.source === "stocks" || query.source === "search") {
        contextData = {
          type: query.source,
          data: query.context
        };
      }
      
      // Include user preferences in PlayAI context
      if (userPreferences) {
        contextData = {
          ...contextData,
          userPreferences: {
            location: userPreferences.location,
            topics: userPreferences.topics,
          }
        };
      }
      
      const playAIResponse = await sendMessageToPlayAI(query.query, [], contextData);
      return { text: playAIResponse };
    } catch (playAIError) {
      console.error("PlayAI error, falling back to Gemini:", playAIError);
    }
  }

  try {
    // If user has a preferred location, apply it to the query
    if (userPreferences?.location && !query.location) {
      query.location = userPreferences.location;
    }
    
    // If user has preferred search provider, use it
    if (userPreferences?.search_provider && !query.searchProvider) {
      query.searchProvider = userPreferences.search_provider as 'exa' | 'searxng' | 'combined';
    }
    
    // Enhance the query with contextual information
    const enhancedQuery = await enhanceQueryWithContext(query);
    
    // Include user preferences in the prompt
    const userContext = userPreferences ? {
      location: userPreferences.location,
      topics: userPreferences.topics,
    } : null;
    
    // Build a prompt based on the enhanced query
    const prompt = buildPrompt(enhancedQuery, userContext);
    
    // Query the AI model with the prompt
    return await queryGeminiAPI(prompt);
  } catch (error) {
    console.error("Error querying AI:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    toast.error(`AI assistant error: ${errorMessage}`);
    
    return { text: "I'm sorry, I encountered an error processing your request. Please try again later." };
  }
}

/**
 * Handles AI commands and returns the result
 */
export async function handleAICommand(response: AiResponse): Promise<string> {
  if (!response.command) return response.text;
  
  try {
    const resultMessage = await executeCommand(response.command);
    return `${response.text}\n\n✅ ${resultMessage}`;
  } catch (error) {
    console.error("Error executing command:", error);
    return `${response.text}\n\n❌ Sorry, I couldn't complete that action.`;
  }
}

// Re-export the command handler
export { executeCommand };

// Re-export types with corrected TypeScript syntax for isolatedModules
export type { UserQuery, AiResponse };
