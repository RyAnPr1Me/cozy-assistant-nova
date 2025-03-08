
import { toast } from "sonner";
import { getWeather } from "./weather-service";
import { searchSpotify, getRecommendations } from "./spotify-service";

// Gemini API Key
const API_KEY = "AIzaSyD36BugamnLHIhQRLv3V4HXu_hg4B9-WFQ";
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

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
  source?: "calendar" | "bookmarks" | "weather" | "spotify" | "general";
  context?: any;
}

export async function queryGemini({ query, source = "general", context }: UserQuery): Promise<string> {
  try {
    // Check for weather-related queries
    if (query.toLowerCase().includes("weather") || 
        query.toLowerCase().includes("temperature") || 
        query.toLowerCase().includes("forecast")) {
      
      // Try to extract location from query
      let location = "New York"; // Default location
      const locationMatch = query.match(/weather (?:in|at|for) ([a-zA-Z\s,]+)/i);
      if (locationMatch && locationMatch[1]) {
        location = locationMatch[1].trim();
      }
      
      // Get weather data
      const weatherData = await getWeather(location);
      if (weatherData) {
        source = "weather";
        context = weatherData;
      }
    }
    
    // Check for music/Spotify-related queries
    if (query.toLowerCase().includes("music") || 
        query.toLowerCase().includes("song") || 
        query.toLowerCase().includes("artist") ||
        query.toLowerCase().includes("playlist") ||
        query.toLowerCase().includes("spotify")) {
      
      // Extract search term from query
      const searchMatch = query.match(/(?:find|search|play|recommend|about) (.*?)(?:\s+by\s+|$)/i);
      if (searchMatch && searchMatch[1]) {
        const searchTerm = searchMatch[1].trim();
        
        // Search Spotify
        const spotifyResults = await searchSpotify(searchTerm);
        if (spotifyResults) {
          source = "spotify";
          context = spotifyResults;
          
          // Get recommendations if asked for
          if (query.toLowerCase().includes("recommend") || query.toLowerCase().includes("similar")) {
            const seedTracks = spotifyResults.tracks.slice(0, 2).map(track => track.id);
            if (seedTracks.length > 0) {
              const recommendations = await getRecommendations(seedTracks);
              if (recommendations) {
                context.recommendations = recommendations;
              }
            }
          }
        }
      }
    }

    // Build the request based on the source and context
    let prompt = query;
    
    if (source === "calendar") {
      prompt = `[CONTEXT: The user is asking about their calendar. Calendar context: ${JSON.stringify(context)}]\n\nUser query: ${query}`;
    } else if (source === "bookmarks") {
      prompt = `[CONTEXT: The user is asking about their bookmarks. Bookmark context: ${JSON.stringify(context)}]\n\nUser query: ${query}`;
    } else if (source === "weather") {
      prompt = `[CONTEXT: The user is asking about weather. Weather data: ${JSON.stringify(context)}]\n\nUser query: ${query}`;
    } else if (source === "spotify") {
      prompt = `[CONTEXT: The user is asking about music. Spotify results: ${JSON.stringify(context)}]\n\nUser query: ${query}`;
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
