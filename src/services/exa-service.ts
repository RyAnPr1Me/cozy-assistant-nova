
// Exa Web Search API Service
const EXA_API_KEY = "7cccfeff-e8f7-4b35-8f5d-21efa7ff0ae3";
const EXA_API_URL = "https://api.exa.ai/search";

export interface ExaSearchResult {
  title: string;
  url: string;
  content: string;
  publication_date?: string;
  author?: string;
  source?: string;
}

/**
 * Search the web using Exa API
 */
export async function searchWithExa(query: string): Promise<ExaSearchResult[]> {
  try {
    const response = await fetch(EXA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": EXA_API_KEY,
      },
      body: JSON.stringify({
        query: query,
        numResults: 10,
        highlights: true,
        useAutoprompt: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Exa API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.log("No Exa search results found for query:", query);
      return [];
    }
    
    // Map and normalize the results
    return data.results.map((result: any) => ({
      title: result.title || "No Title",
      url: result.url,
      content: result.text || result.highlight || result.snippet || "No description available",
      publication_date: result.publishedDate || result.published_date,
      author: result.author,
      source: result.source || new URL(result.url).hostname,
    }));
  } catch (error) {
    console.error("Error searching with Exa:", error);
    return [];
  }
}
