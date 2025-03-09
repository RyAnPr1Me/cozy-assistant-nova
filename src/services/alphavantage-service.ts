
// AlphaVantage API service for financial data
const API_KEY = "Q4I1C025YSO12AWT";
const BASE_URL = "https://www.alphavantage.co/query";

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  latestTradingDay: string;
}

export interface StockOverview {
  Symbol: string;
  Name: string;
  Description: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  MarketCapitalization: string;
  PERatio: string;
  DividendYield: string;
  EPS: string;
  Beta: string;
  FiftyTwoWeekHigh: string;
  FiftyTwoWeekLow: string;
}

/**
 * Get real-time stock quote information
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`AlphaVantage API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if we have valid data
    if (!data["Global Quote"] || Object.keys(data["Global Quote"]).length === 0) {
      console.error("No stock data found for symbol:", symbol);
      return null;
    }

    const quote = data["Global Quote"];
    
    return {
      symbol: quote["01. symbol"],
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"]),
      volume: parseInt(quote["06. volume"]),
      latestTradingDay: quote["07. latest trading day"],
    };
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return null;
  }
}

/**
 * Get company overview information
 */
export async function getCompanyOverview(symbol: string): Promise<StockOverview | null> {
  try {
    const response = await fetch(
      `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`AlphaVantage API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if we have valid data
    if (!data.Symbol) {
      console.error("No company overview found for symbol:", symbol);
      return null;
    }

    return data as StockOverview;
  } catch (error) {
    console.error("Error fetching company overview:", error);
    return null;
  }
}

/**
 * Search for companies by keywords
 */
export async function searchCompanies(keywords: string): Promise<any[]> {
  try {
    const response = await fetch(
      `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`AlphaVantage API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if we have valid data
    if (!data.bestMatches) {
      console.error("No search results found for keywords:", keywords);
      return [];
    }

    return data.bestMatches;
  } catch (error) {
    console.error("Error searching companies:", error);
    return [];
  }
}
