
import { getWeather } from "../weather-service";
import { searchSpotify, getRecommendations } from "../spotify-service";
import { getNews } from "../news-service";
import { getEvents } from "../calendar-service";
import { getBookmarks } from "../bookmarks-service";
import {
  getStockQuote,
  getCompanyOverview,
  searchCompanies
} from "../alphavantage-service";
import { searchWeb, searchWithExaOnly, searchWithSearXNGOnly } from "../searxng-service";
import { UserQuery } from "./types";

/**
 * Determines which search provider to use based on query content
 */
export const determineSearchProvider = (query: string) => {
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

/**
 * Enhances the query with contextual information from various services
 */
export async function enhanceQueryWithContext(query: UserQuery): Promise<UserQuery> {
  const userInput = query.query;
  const enhancedQuery = { ...query };

  // Check for stock-related queries
  if (userInput.toLowerCase().includes("stock") || 
      userInput.toLowerCase().includes("price") || 
      userInput.toLowerCase().includes("market") ||
      userInput.toLowerCase().includes("invest") ||
      userInput.toLowerCase().includes("finance")) {
    
    let symbol = "";
    const symbolMatch = userInput.match(/stock (?:of|for|price|quote) ([A-Za-z]+)/i) || 
                        userInput.match(/([A-Za-z]{1,5}) stock/i) ||
                        userInput.match(/symbol (?:is|:) ([A-Za-z]+)/i);
    
    if (symbolMatch && symbolMatch[1]) {
      symbol = symbolMatch[1].trim().toUpperCase();
    } else {
      const companyMatch = userInput.match(/(?:about|for|of) ([A-Za-z\s]+?)(?:\'s)? stock/i) ||
                           userInput.match(/([A-Za-z\s]+?)(?:\'s)? (?:stock|share|price)/i);
      
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
          enhancedQuery.source = "stocks";
          enhancedQuery.context = { quote: quoteData, company: companyData };
        }
      } catch (stockError) {
        console.error("Error getting stock data:", stockError);
      }
    }
  }

  // Check for search-related queries
  if (userInput.toLowerCase().includes("search") || 
      userInput.toLowerCase().includes("find") || 
      userInput.toLowerCase().includes("look up") ||
      userInput.toLowerCase().includes("google") ||
      userInput.toLowerCase().startsWith("what is") ||
      userInput.toLowerCase().startsWith("who is") ||
      userInput.toLowerCase().startsWith("when did") ||
      userInput.toLowerCase().startsWith("how to")) {
    
    let searchTerm = userInput;
    
    searchTerm = searchTerm.replace(/^(search for|search|find|look up|google|tell me about)/i, '').trim();
    
    if (searchTerm) {
      const actualProvider = query.searchProvider || determineSearchProvider(userInput);
      
      let searchResults;
      if (actualProvider === "exa") {
        searchResults = await searchWithExaOnly(searchTerm);
      } else if (actualProvider === "searxng") {
        searchResults = await searchWithSearXNGOnly(searchTerm);
      } else {
        searchResults = await searchWeb(searchTerm);
      }
      
      if (searchResults && searchResults.length > 0) {
        enhancedQuery.source = "search";
        enhancedQuery.context = { 
          results: searchResults.slice(0, 5), 
          query: searchTerm,
          provider: actualProvider 
        };
      }
    }
  }
  
  // Check for weather-related queries
  if (userInput.toLowerCase().includes("weather") || 
      userInput.toLowerCase().includes("temperature") || 
      userInput.toLowerCase().includes("forecast")) {
    
    let location = "New York";
    const locationMatch = userInput.match(/weather (?:in|at|for) ([a-zA-Z\s,]+)/i);
    if (locationMatch && locationMatch[1]) {
      location = locationMatch[1].trim();
    }
    
    try {
      const weatherData = await getWeather(location);
      if (weatherData) {
        enhancedQuery.source = "weather";
        enhancedQuery.context = weatherData;
      }
    } catch (weatherError) {
      console.error("Error getting weather data:", weatherError);
    }
  }
  
  // Check for music-related queries
  if (userInput.toLowerCase().includes("music") || 
      userInput.toLowerCase().includes("song") || 
      userInput.toLowerCase().includes("artist") ||
      userInput.toLowerCase().includes("playlist") ||
      userInput.toLowerCase().includes("spotify")) {
    
    const searchMatch = userInput.match(/(?:find|search|play|recommend|about) (.*?)(?:\s+by\s+|$)/i);
    if (searchMatch && searchMatch[1]) {
      const searchTerm = searchMatch[1].trim();
      
      try {
        const spotifyResults = await searchSpotify(searchTerm);
        if (spotifyResults) {
          enhancedQuery.source = "spotify";
          enhancedQuery.context = spotifyResults;
          
          if (userInput.toLowerCase().includes("recommend") || userInput.toLowerCase().includes("similar")) {
            const seedTracks = spotifyResults.tracks.slice(0, 2).map(track => track.id);
            if (seedTracks.length > 0) {
              const recommendations = await getRecommendations(seedTracks);
              if (recommendations) {
                enhancedQuery.context.recommendations = recommendations;
              }
            }
          }
        }
      } catch (spotifyError) {
        console.error("Error getting Spotify data:", spotifyError);
      }
    }
  }
  
  // Check for news-related queries
  if (userInput.toLowerCase().includes("news") || 
      userInput.toLowerCase().includes("article") || 
      userInput.toLowerCase().includes("report") ||
      userInput.toLowerCase().includes("update") ||
      userInput.toLowerCase().includes("headline")) {
    
    try {
      let searchTerm = "";
      const newsMatch = userInput.match(/(?:news|articles?|headlines?) (?:about|on|regarding) (.*?)(?:\s+in\s+|$)/i);
      if (newsMatch && newsMatch[1]) {
        searchTerm = newsMatch[1].trim();
      } else {
        const keywords = userInput.split(" ")
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
          enhancedQuery.source = "news";
          enhancedQuery.context = newsData;
        }
      }
    } catch (newsError) {
      console.error("Error getting news data:", newsError);
    }
  }

  // Check for calendar-related queries
  if (userInput.toLowerCase().includes("add event") || 
      userInput.toLowerCase().includes("create event") ||
      userInput.toLowerCase().includes("schedule") ||
      userInput.toLowerCase().includes("appointment") ||
      (userInput.toLowerCase().includes("calendar") && 
       (userInput.toLowerCase().includes("add") || 
        userInput.toLowerCase().includes("create") || 
        userInput.toLowerCase().includes("remove") ||
        userInput.toLowerCase().includes("delete") ||
        userInput.toLowerCase().includes("update") ||
        userInput.toLowerCase().includes("edit")))) {
    enhancedQuery.source = "calendar";
    enhancedQuery.context = getEvents();
  }

  // Check for bookmark-related queries
  if (userInput.toLowerCase().includes("add bookmark") || 
      userInput.toLowerCase().includes("save bookmark") ||
      userInput.toLowerCase().includes("bookmark this") ||
      (userInput.toLowerCase().includes("bookmark") && 
       (userInput.toLowerCase().includes("add") || 
        userInput.toLowerCase().includes("save") || 
        userInput.toLowerCase().includes("remove") ||
        userInput.toLowerCase().includes("delete")))) {
    enhancedQuery.source = "bookmarks";
    enhancedQuery.context = getBookmarks();
  }

  return enhancedQuery;
}
