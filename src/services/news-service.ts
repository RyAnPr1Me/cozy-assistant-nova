
import { toast } from "sonner";

const API_KEY = "pub_735389f375c91f3d0aa14268bc0dee9fcac25";
const API_URL = "https://newsdata.io/api/1/news";

export interface NewsArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source_id: string;
  creator?: string | string[];
  image_url?: string;
  category: string[];
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  results: NewsArticle[];
  nextPage?: string;
}

export async function getNews(query: string, language = "en"): Promise<NewsResponse | null> {
  try {
    const url = `${API_URL}?apikey=${API_KEY}&q=${encodeURIComponent(query)}&language=${language}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("News API network error:", errorText);
      throw new Error(`News API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== "success") {
      console.error("News API returned error:", data);
      throw new Error(`News API error: ${data.results?.message || "Unknown error"}`);
    }
    
    return data as NewsResponse;
  } catch (error) {
    console.error("Error fetching news data:", error);
    toast.error("Failed to get news information");
    
    // Return null or a minimal fallback
    return {
      status: "error",
      totalResults: 0,
      results: [],
    };
  }
}
