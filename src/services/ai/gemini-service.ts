
import { toast } from "sonner";
import { AiResponse, UserQuery } from "./types";
import { parseAiResponse } from "./command-handler";

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

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

/**
 * Gets the Gemini API key from local storage
 */
const getApiKey = () => {
  return localStorage.getItem("gemini-assistant-api-key") || "AIzaSyD36BugamnLHIhQRLv3V4HXu_hg4B9-WFQ";
};

/**
 * Queries the Gemini API with the given prompt
 */
export async function queryGeminiAPI(prompt: string): Promise<AiResponse> {
  try {
    const apiKey = getApiKey();
    
    const response = await fetch(`${API_URL}?key=${apiKey}`, {
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
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("Gemini API error:", errorData || errorText);
      
      if (response.status === 429) {
        throw new Error("API rate limit exceeded. Please try again later.");
      }
      
      if (response.status === 401 || response.status === 403) {
        throw new Error("API key invalid or expired. Please update your API key in settings.");
      }
      
      throw new Error(`API request failed (${response.status}): ${errorData?.error?.message || errorText}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return parseAiResponse(data.candidates[0].content.parts[0].text);
    } else {
      throw new Error("No valid response received from Gemini API");
    }
  } catch (error) {
    console.error("Error querying Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (errorMessage.includes("API key invalid")) {
      return { text: "I'm having trouble accessing my AI capabilities. Please check your API key in the settings page." };
    }
    
    if (errorMessage.includes("rate limit")) {
      return { text: "I've reached my usage limit. Please try again in a few minutes." };
    }
    
    return { text: "I'm sorry, I encountered an error processing your request. Please try again later." };
  }
}
