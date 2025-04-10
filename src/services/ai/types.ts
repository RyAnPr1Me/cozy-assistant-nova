
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
