
import { searchWithExa, ExaSearchResult } from "./exa-service";

// SearXNG Web Search Service
const SEARXNG_URL = "https://searx.be/search";

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  engine?: string;
  source?: string;
  publication_date?: string;
  author?: string;
}

/**
 * Search the web using SearXNG
 */
async function searchWithSearXNG(query: string): Promise<SearchResult[]> {
  try {
    // SearXNG uses URL parameters for the search
    const searchUrl = `${SEARXNG_URL}?q=${encodeURIComponent(query)}&format=json`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`SearXNG API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.log("No SearXNG search results found for query:", query);
      return [];
    }
    
    // Map and normalize the results
    return data.results.map((result: any) => ({
      title: result.title || "No Title",
      url: result.url,
      content: result.content || result.snippet || "No description available",
      engine: result.engine,
      source: result.parsed_url?.[0] || new URL(result.url).hostname
    }));
  } catch (error) {
    console.error("Error searching with SearXNG:", error);
    return [];
  }
}

/**
 * Search the web using both Exa and SearXNG with a preference for Exa results
 */
export async function searchWeb(query: string): Promise<SearchResult[]> {
  try {
    // Try Exa first
    const exaResults = await searchWithExa(query);
    
    // If Exa returns results, use them
    if (exaResults && exaResults.length > 0) {
      console.log(`Found ${exaResults.length} results from Exa API`);
      return exaResults;
    }
    
    // Fall back to SearXNG if Exa returns no results
    console.log("No results from Exa, trying SearXNG");
    const searxngResults = await searchWithSearXNG(query);
    return searxngResults;
  } catch (error) {
    console.error("Error in combined web search:", error);
    
    // Try SearXNG as a final fallback
    try {
      return await searchWithSearXNG(query);
    } catch (fallbackError) {
      console.error("All search methods failed:", fallbackError);
      return [];
    }
  }
}

/**
 * Search the web using Exa API only
 */
export async function searchWithExaOnly(query: string): Promise<SearchResult[]> {
  return searchWithExa(query);
}

/**
 * Search the web using SearXNG only
 */
export async function searchWithSearXNGOnly(query: string): Promise<SearchResult[]> {
  return searchWithSearXNG(query);
}
