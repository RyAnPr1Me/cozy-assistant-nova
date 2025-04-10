
import { toast } from "sonner";
import { UserQuery, AiResponse } from "./types";
import { enhanceQueryWithContext } from "./context-analyzer";
import { buildPrompt } from "./prompt-builder";
import { queryGeminiAPI } from "./gemini-service";
import { executeCommand } from "./command-handler";
import { sendMessageToPlayAI } from "../playai-service";

/**
 * Main entry point for AI queries
 */
export async function queryAI(query: UserQuery): Promise<AiResponse> {
  // Use PlayAI if explicitly requested
  if (query.usePlayAI || query.query.toLowerCase().includes("playai")) {
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
      
      const playAIResponse = await sendMessageToPlayAI(query.query, [], contextData);
      return { text: playAIResponse };
    } catch (playAIError) {
      console.error("PlayAI error, falling back to Gemini:", playAIError);
    }
  }

  try {
    // Enhance the query with contextual information
    const enhancedQuery = await enhanceQueryWithContext(query);
    
    // Build a prompt based on the enhanced query
    const prompt = buildPrompt(enhancedQuery);
    
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

// Re-export types and main functions
export { executeCommand };
export type { UserQuery, AiResponse };
