
// SearXNG Web Search Service
const SEARXNG_URL = "https://searx.be/search";

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  engine?: string;
  source?: string;
}

/**
 * Search the web using SearXNG
 */
export async function searchWeb(query: string): Promise<SearchResult[]> {
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
      console.log("No search results found for query:", query);
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
    console.error("Error searching the web:", error);
    return [];
  }
}
