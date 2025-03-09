
import { toast } from "sonner";
import { getWeather } from "./weather-service";
import { searchSpotify, getRecommendations } from "./spotify-service";
import { getNews } from "./news-service";
import { 
  getEvents, 
  addEvent, 
  updateEvent, 
  deleteEvent, 
  getUpcomingEvents 
} from "./calendar-service";
import {
  getBookmarks,
  addBookmark,
  updateBookmark,
  deleteBookmark,
  searchBookmarks
} from "./bookmarks-service";

// Get Gemini API Key from localStorage or use the default one
const getApiKey = () => {
  return localStorage.getItem("gemini-assistant-api-key") || "AIzaSyD36BugamnLHIhQRLv3V4HXu_hg4B9-WFQ";
};

// Updated API URL to use the latest API version and endpoint
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

export interface UserQuery {
  query: string;
  source?: "calendar" | "bookmarks" | "weather" | "spotify" | "news" | "general";
  context?: any;
}

// Interface for AI response with possible command
export interface AiResponse {
  text: string;
  command?: {
    type: "calendar" | "bookmark" | "app";
    action: "add" | "update" | "delete" | "search";
    data: any;
  };
}

// Parse AI response for any commands
const parseAiResponse = (text: string): AiResponse => {
  try {
    // Check if there's a command section delimited by [COMMAND:...]
    const commandRegex = /\[COMMAND:(.*?)\]/s;
    const match = text.match(commandRegex);
    
    if (match && match[1]) {
      const commandStr = match[1].trim();
      const command = JSON.parse(commandStr);
      
      // Remove the command section from the displayed text
      const cleanText = text.replace(commandRegex, '').trim();
      
      return {
        text: cleanText,
        command
      };
    }
  } catch (err) {
    console.error("Error parsing AI command:", err);
  }
  
  // Return original text if no command or parsing error
  return { text };
};

// Execute AI command
export const executeCommand = async (command: any): Promise<string> => {
  try {
    if (command.type === "calendar") {
      if (command.action === "add" && command.data?.title) {
        const event = addEvent({
          title: command.data.title,
          description: command.data.description || "",
          start: command.data.start || Date.now(),
          end: command.data.end || (Date.now() + 3600000),
          allDay: command.data.allDay || false,
          location: command.data.location || "",
        });
        return `Added event "${event.title}" to your calendar`;
      } else if (command.action === "delete" && command.data?.id) {
        deleteEvent(command.data.id);
        return "Event deleted successfully";
      } else if (command.action === "update" && command.data?.id) {
        const updated = updateEvent(command.data.id, command.data);
        return updated ? "Event updated successfully" : "Failed to update event";
      }
    } else if (command.type === "bookmark") {
      if (command.action === "add" && command.data?.title && command.data?.url) {
        const bookmark = addBookmark({
          title: command.data.title,
          url: command.data.url,
          description: command.data.description || "",
          category: command.data.category || "",
          tags: command.data.tags || [],
        });
        return `Added bookmark "${bookmark.title}" to your collection`;
      } else if (command.action === "delete" && command.data?.id) {
        deleteBookmark(command.data.id);
        return "Bookmark deleted successfully";
      } else if (command.action === "update" && command.data?.id) {
        const updated = updateBookmark(command.data.id, command.data);
        return updated ? "Bookmark updated successfully" : "Failed to update bookmark";
      }
    }
    
    return "Could not execute command";
  } catch (error) {
    console.error("Error executing command:", error);
    return "Error executing command";
  }
};

export async function queryGemini({ query, source = "general", context }: UserQuery): Promise<AiResponse> {
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
      
      try {
        // Get weather data
        const weatherData = await getWeather(location);
        if (weatherData) {
          source = "weather";
          context = weatherData;
        }
      } catch (weatherError) {
        console.error("Error getting weather data:", weatherError);
        // Continue with query without weather data
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
        
        try {
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
        } catch (spotifyError) {
          console.error("Error getting Spotify data:", spotifyError);
          // Continue with query without Spotify data
        }
      }
    }
    
    // Check for news-related queries
    if (query.toLowerCase().includes("news") || 
        query.toLowerCase().includes("article") || 
        query.toLowerCase().includes("report") ||
        query.toLowerCase().includes("update") ||
        query.toLowerCase().includes("headline")) {
      
      try {
        // Extract search term from query
        let searchTerm = "";
        const newsMatch = query.match(/(?:news|articles?|headlines?) (?:about|on|regarding) (.*?)(?:\s+in\s+|$)/i);
        if (newsMatch && newsMatch[1]) {
          searchTerm = newsMatch[1].trim();
        } else {
          // If no specific term, use the most relevant keyword from the query
          const keywords = query.split(" ")
            .filter(word => word.length > 3 && 
              !["news", "article", "headline", "latest", "recent", "tell", "about", "what"].includes(word.toLowerCase())
            );
          if (keywords.length > 0) {
            searchTerm = keywords[0];
          } else {
            searchTerm = "latest"; // Default search term
          }
        }
        
        if (searchTerm) {
          const newsData = await getNews(searchTerm);
          if (newsData && newsData.results.length > 0) {
            source = "news";
            context = newsData;
          }
        }
      } catch (newsError) {
        console.error("Error getting news data:", newsError);
        // Continue with query without news data
      }
    }

    // Check for calendar-related commands
    if (query.toLowerCase().includes("add event") || 
        query.toLowerCase().includes("create event") ||
        query.toLowerCase().includes("schedule") ||
        query.toLowerCase().includes("appointment") ||
        (query.toLowerCase().includes("calendar") && 
         (query.toLowerCase().includes("add") || 
          query.toLowerCase().includes("create") || 
          query.toLowerCase().includes("remove") ||
          query.toLowerCase().includes("delete")))) {
      source = "calendar";
      context = getEvents();
    }

    // Check for bookmark-related commands
    if (query.toLowerCase().includes("add bookmark") || 
        query.toLowerCase().includes("save bookmark") ||
        query.toLowerCase().includes("bookmark this") ||
        (query.toLowerCase().includes("bookmark") && 
         (query.toLowerCase().includes("add") || 
          query.toLowerCase().includes("save") || 
          query.toLowerCase().includes("remove") ||
          query.toLowerCase().includes("delete")))) {
      source = "bookmarks";
      context = getBookmarks();
    }

    // Build the request based on the source and context
    let prompt = query;
    
    if (source === "calendar") {
      prompt = `[CONTEXT: The user is asking about their calendar or wants to modify calendar events. Calendar context: ${JSON.stringify(context)}]

You can create, update, or delete calendar events by returning a command in your response.

To add an event, include a command like this:
[COMMAND:{"type":"calendar","action":"add","data":{"title":"Meeting with John","description":"Discuss project timeline","start":1652918400000,"end":1652925600000,"allDay":false,"location":"Office"}}]

To delete an event, include a command like this:
[COMMAND:{"type":"calendar","action":"delete","data":{"id":"event-id-to-delete"}}]

To update an event, include a command like this:
[COMMAND:{"type":"calendar","action":"update","data":{"id":"event-id-to-update","title":"Updated title","description":"Updated description"}}]

User query: ${query}

Respond in a helpful, conversational way. If you're executing a command, explain what you're doing.`;
    } else if (source === "bookmarks") {
      prompt = `[CONTEXT: The user is asking about their bookmarks or wants to modify bookmarks. Bookmark context: ${JSON.stringify(context)}]

You can create, update, or delete bookmarks by returning a command in your response.

To add a bookmark, include a command like this:
[COMMAND:{"type":"bookmark","action":"add","data":{"title":"Example Website","url":"https://example.com","description":"An example website"}}]

To delete a bookmark, include a command like this:
[COMMAND:{"type":"bookmark","action":"delete","data":{"id":"bookmark-id-to-delete"}}]

To update a bookmark, include a command like this:
[COMMAND:{"type":"bookmark","action":"update","data":{"id":"bookmark-id-to-update","title":"Updated title","description":"Updated description"}}]

User query: ${query}

Respond in a helpful, conversational way. If you're executing a command, explain what you're doing.`;
    } else if (source === "weather") {
      prompt = `[CONTEXT: The user is asking about weather. Weather data: ${JSON.stringify(context)}]\n\nUser query: ${query}`;
    } else if (source === "spotify") {
      prompt = `[CONTEXT: The user is asking about music. Spotify results: ${JSON.stringify(context)}]\n\nUser query: ${query}`;
    } else if (source === "news") {
      prompt = `[CONTEXT: The user is asking about news. News results: ${JSON.stringify(context)}]\n\nUser query: ${query}. Please summarize the main points from these news articles and provide insights. Include sources when relevant.`;
    }

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
    
    toast.error(`AI assistant error: ${errorMessage}`);
    
    if (errorMessage.includes("API key invalid")) {
      return { text: "I'm having trouble accessing my AI capabilities. Please check your API key in the settings page." };
    }
    
    if (errorMessage.includes("rate limit")) {
      return { text: "I've reached my usage limit. Please try again in a few minutes." };
    }
    
    return { text: "I'm sorry, I encountered an error processing your request. Please try again later." };
  }
}
