
import { toast } from "sonner";

// Gemini API Key
const API_KEY = "AIzaSyD36BugamnLHIhQRLv3V4HXu_hg4B9-WFQ";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
}

export interface UserQuery {
  query: string;
  source?: "calendar" | "bookmarks" | "general";
  context?: any;
}

export async function queryGemini({ query, source = "general", context }: UserQuery): Promise<string> {
  try {
    // Build the request based on the source and context
    let prompt = query;
    
    if (source === "calendar") {
      prompt = `[CONTEXT: The user is asking about their calendar. Calendar context: ${JSON.stringify(context)}]\n\nUser query: ${query}`;
    } else if (source === "bookmarks") {
      prompt = `[CONTEXT: The user is asking about their bookmarks. Bookmark context: ${JSON.stringify(context)}]\n\nUser query: ${query}`;
    }

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("No valid response received from Gemini API");
    }
  } catch (error) {
    console.error("Error querying Gemini:", error);
    toast.error("Failed to get a response from the AI assistant");
    return "I'm sorry, I encountered an error processing your request. Please try again later.";
  }
}
