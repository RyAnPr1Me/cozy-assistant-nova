
import { toast } from "sonner";
import { getWeather } from "./weather-service";
import { searchSpotify, getRecommendations } from "./spotify-service";
import { getNews } from "./news-service";
import { sendMessageToPlayAI } from "./playai-service";
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
import {
  getStockQuote,
  getCompanyOverview,
  searchCompanies
} from "./alphavantage-service";
import { searchWeb, searchWithExaOnly, searchWithSearXNGOnly } from "./searxng-service";

const getApiKey = () => {
  return localStorage.getItem("gemini-assistant-api-key") || "AIzaSyD36BugamnLHIhQRLv3V4HXu_hg4B9-WFQ";
};

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
  source?: "calendar" | "bookmarks" | "weather" | "spotify" | "news" | "general" | "playai" | "stocks" | "search";
  context?: any;
  usePlayAI?: boolean;
  searchProvider?: "exa" | "searxng" | "combined";
}

export interface AiResponse {
  text: string;
  command?: {
    type: "calendar" | "bookmark" | "app" | "stocks";
    action: "add" | "update" | "delete" | "search";
    data: any;
  };
}

const parseAiResponse = (text: string): AiResponse => {
  try {
    const commandRegex = /\[COMMAND:(.*?)\]/s;
    const match = text.match(commandRegex);
    
    if (match && match[1]) {
      const commandStr = match[1].trim();
      const command = JSON.parse(commandStr);
      
      const cleanText = text.replace(commandRegex, '').trim();
      
      return {
        text: cleanText,
        command
      };
    }
  } catch (err) {
    console.error("Error parsing AI command:", err);
  }
  
  return { text };
};

// Export the executeCommand function so it can be imported in other files
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
    } else if (command.type === "stocks") {
      if (command.action === "search" && command.data?.symbol) {
        const quote = await getStockQuote(command.data.symbol);
        return quote ? `Retrieved latest stock quote for ${quote.symbol}` : "Could not find stock information";
      }
    }
    
    return "Could not execute command";
  } catch (error) {
    console.error("Error executing command:", error);
    return "Error executing command";
  }
};

const determineSearchProvider = (query: string) => {
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
  
  if (query.toLowerCase().includes("latest") || 
      query.toLowerCase().includes("recent") ||
      query.toLowerCase().includes("current") ||
      query.toLowerCase().includes("today") ||
      query.toLowerCase().includes("news")) {
    return "searxng";
  }
  
  return "combined";
};

export async function queryGemini({ query, source = "general", context, usePlayAI = false, searchProvider }: UserQuery): Promise<AiResponse> {
  if (usePlayAI || query.toLowerCase().includes("playai")) {
    try {
      console.log("Using PlayAI for query:", query);
      
      let contextData;
      if (source === "weather" || source === "news" || source === "calendar" || 
          source === "bookmarks" || source === "stocks" || source === "search") {
        contextData = {
          type: source,
          data: context
        };
      }
      
      const playAIResponse = await sendMessageToPlayAI(query, [], contextData);
      return { text: playAIResponse };
    } catch (playAIError) {
      console.error("PlayAI error, falling back to Gemini:", playAIError);
    }
  }

  try {
    if (query.toLowerCase().includes("stock") || 
        query.toLowerCase().includes("price") || 
        query.toLowerCase().includes("market") ||
        query.toLowerCase().includes("invest") ||
        query.toLowerCase().includes("finance")) {
      
      let symbol = "";
      const symbolMatch = query.match(/stock (?:of|for|price|quote) ([A-Za-z]+)/i) || 
                         query.match(/([A-Za-z]{1,5}) stock/i) ||
                         query.match(/symbol (?:is|:) ([A-Za-z]+)/i);
      
      if (symbolMatch && symbolMatch[1]) {
        symbol = symbolMatch[1].trim().toUpperCase();
      } else {
        const companyMatch = query.match(/(?:about|for|of) ([A-Za-z\s]+?)(?:\'s)? stock/i) ||
                            query.match(/([A-Za-z\s]+?)(?:\'s)? (?:stock|share|price)/i);
        
        if (companyMatch && companyMatch[1]) {
          const companyName = companyMatch[1].trim();
          try {
            const searchResults = await searchCompanies(companyName);
            if (searchResults.length > 0) {
              symbol = searchResults[0]["1. symbol"];
            }
          } catch (searchError) {
            console.error("Error searching for company:", searchError);
          }
        }
      }
      
      if (symbol) {
        try {
          const [quoteData, companyData] = await Promise.all([
            getStockQuote(symbol),
            getCompanyOverview(symbol)
          ]);
          
          if (quoteData || companyData) {
            source = "stocks";
            context = { quote: quoteData, company: companyData };
          }
        } catch (stockError) {
          console.error("Error getting stock data:", stockError);
        }
      }
    }

    if (query.toLowerCase().includes("search") || 
        query.toLowerCase().includes("find") || 
        query.toLowerCase().includes("look up") ||
        query.toLowerCase().includes("google") ||
        query.toLowerCase().startsWith("what is") ||
        query.toLowerCase().startsWith("who is") ||
        query.toLowerCase().startsWith("when did") ||
        query.toLowerCase().startsWith("how to")) {
      
      let searchTerm = query;
      
      searchTerm = searchTerm.replace(/^(search for|search|find|look up|google|tell me about)/i, '').trim();
      
      if (searchTerm) {
        const actualProvider = searchProvider || determineSearchProvider(query);
        
        let searchResults;
        if (actualProvider === "exa") {
          searchResults = await searchWithExaOnly(searchTerm);
        } else if (actualProvider === "searxng") {
          searchResults = await searchWithSearXNGOnly(searchTerm);
        } else {
          searchResults = await searchWeb(searchTerm);
        }
        
        if (searchResults && searchResults.length > 0) {
          source = "search";
          context = { 
            results: searchResults.slice(0, 5), 
            query: searchTerm,
            provider: actualProvider 
          };
        }
      }
    }
    
    if (query.toLowerCase().includes("weather") || 
        query.toLowerCase().includes("temperature") || 
        query.toLowerCase().includes("forecast")) {
      
      let location = "New York";
      const locationMatch = query.match(/weather (?:in|at|for) ([a-zA-Z\s,]+)/i);
      if (locationMatch && locationMatch[1]) {
        location = locationMatch[1].trim();
      }
      
      try {
        const weatherData = await getWeather(location);
        if (weatherData) {
          source = "weather";
          context = weatherData;
        }
      } catch (weatherError) {
        console.error("Error getting weather data:", weatherError);
      }
    }
    
    if (query.toLowerCase().includes("music") || 
        query.toLowerCase().includes("song") || 
        query.toLowerCase().includes("artist") ||
        query.toLowerCase().includes("playlist") ||
        query.toLowerCase().includes("spotify")) {
      
      const searchMatch = query.match(/(?:find|search|play|recommend|about) (.*?)(?:\s+by\s+|$)/i);
      if (searchMatch && searchMatch[1]) {
        const searchTerm = searchMatch[1].trim();
        
        try {
          const spotifyResults = await searchSpotify(searchTerm);
          if (spotifyResults) {
            source = "spotify";
            context = spotifyResults;
            
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
        }
      }
    }
    
    if (query.toLowerCase().includes("news") || 
        query.toLowerCase().includes("article") || 
        query.toLowerCase().includes("report") ||
        query.toLowerCase().includes("update") ||
        query.toLowerCase().includes("headline")) {
      
      try {
        let searchTerm = "";
        const newsMatch = query.match(/(?:news|articles?|headlines?) (?:about|on|regarding) (.*?)(?:\s+in\s+|$)/i);
        if (newsMatch && newsMatch[1]) {
          searchTerm = newsMatch[1].trim();
        } else {
          const keywords = query.split(" ")
            .filter(word => word.length > 3 && 
              !["news", "article", "headline", "latest", "recent", "tell", "about", "what"].includes(word.toLowerCase())
            );
          if (keywords.length > 0) {
            searchTerm = keywords[0];
          } else {
            searchTerm = "latest";
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
      }
    }

    if (query.toLowerCase().includes("add event") || 
        query.toLowerCase().includes("create event") ||
        query.toLowerCase().includes("schedule") ||
        query.toLowerCase().includes("appointment") ||
        (query.toLowerCase().includes("calendar") && 
         (query.toLowerCase().includes("add") || 
          query.toLowerCase().includes("create") || 
          query.toLowerCase().includes("remove") ||
          query.toLowerCase().includes("delete") ||
          query.toLowerCase().includes("update") ||
          query.toLowerCase().includes("edit")))) {
      source = "calendar";
      context = getEvents();
    }

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

Respond in a helpful, conversational way. If you're executing a command, explain what you're doing.
Please include all necessary details in your command, including timestamps for the event. For calendar events, convert date strings to timestamps in milliseconds.`;
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
    } else if (source === "stocks") {
      prompt = `[CONTEXT: The user is asking about stocks or financial information. Financial data: ${JSON.stringify(context)}]

You can search for stock information by returning a command in your response.

To search for a stock quote, include a command like this:
[COMMAND:{"type":"stocks","action":"search","data":{"symbol":"AAPL"}}]

User query: ${query}

Respond in a helpful, conversational way. Provide a comprehensive analysis of the stock data provided, including current price, changes, and relevant company information if available. If no specific financial metrics are available, provide general information about the company and industry.`;
    } else if (source === "search") {
      const providerInfo = context.provider === "exa" ? "Exa search engine" : 
                          context.provider === "searxng" ? "SearXNG search engine" : 
                          "combined web search engines";
      
      prompt = `[CONTEXT: The user is asking for web search results. I've used ${providerInfo} to find information about "${context.query}": ${JSON.stringify(context.results)}]

User query: ${query}

Respond in a helpful, conversational way. Use the search results to provide an informative answer. Cite sources when appropriate by including the website name in parentheses. If articles have publication dates or authors, consider mentioning that information to provide context about how recent the information is.`;
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
