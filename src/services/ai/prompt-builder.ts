
import { UserQuery } from "./types";

/**
 * Builds context-aware prompts for the AI model based on query source
 */
export function buildPrompt(query: UserQuery): string {
  const { query: userInput, source, context } = query;
  
  // Default to user's query if no special source
  if (!source || source === "general") {
    return userInput;
  }
  
  // Build specialized prompts based on the source
  switch (source) {
    case "calendar":
      return `[CONTEXT: The user is asking about their calendar or wants to modify calendar events. Calendar context: ${JSON.stringify(context)}]

You can create, update, or delete calendar events by returning a command in your response.

To add an event, include a command like this:
[COMMAND:{"type":"calendar","action":"add","data":{"title":"Meeting with John","description":"Discuss project timeline","start":1652918400000,"end":1652925600000,"allDay":false,"location":"Office"}}]

To delete an event, include a command like this:
[COMMAND:{"type":"calendar","action":"delete","data":{"id":"event-id-to-delete"}}]

To update an event, include a command like this:
[COMMAND:{"type":"calendar","action":"update","data":{"id":"event-id-to-update","title":"Updated title","description":"Updated description"}}]

User query: ${userInput}

Respond in a helpful, conversational way. If you're executing a command, explain what you're doing.
Please include all necessary details in your command, including timestamps for the event. For calendar events, convert date strings to timestamps in milliseconds.`;

    case "bookmarks":
      return `[CONTEXT: The user is asking about their bookmarks or wants to modify bookmarks. Bookmark context: ${JSON.stringify(context)}]

You can create, update, or delete bookmarks by returning a command in your response.

To add a bookmark, include a command like this:
[COMMAND:{"type":"bookmark","action":"add","data":{"title":"Example Website","url":"https://example.com","description":"An example website"}}]

To delete a bookmark, include a command like this:
[COMMAND:{"type":"bookmark","action":"delete","data":{"id":"bookmark-id-to-delete"}}]

To update a bookmark, include a command like this:
[COMMAND:{"type":"bookmark","action":"update","data":{"id":"bookmark-id-to-update","title":"Updated title","description":"Updated description"}}]

User query: ${userInput}

Respond in a helpful, conversational way. If you're executing a command, explain what you're doing.`;

    case "weather":
      return `[CONTEXT: The user is asking about weather. Weather data: ${JSON.stringify(context)}]\n\nUser query: ${userInput}`;

    case "spotify":
      return `[CONTEXT: The user is asking about music. Spotify results: ${JSON.stringify(context)}]\n\nUser query: ${userInput}`;

    case "news":
      return `[CONTEXT: The user is asking about news. News results: ${JSON.stringify(context)}]\n\nUser query: ${userInput}. Please summarize the main points from these news articles and provide insights. Include sources when relevant.`;

    case "stocks":
      return `[CONTEXT: The user is asking about stocks or financial information. Financial data: ${JSON.stringify(context)}]

You can search for stock information by returning a command in your response.

To search for a stock quote, include a command like this:
[COMMAND:{"type":"stocks","action":"search","data":{"symbol":"AAPL"}}]

User query: ${userInput}

Respond in a helpful, conversational way. Provide a comprehensive analysis of the stock data provided, including current price, changes, and relevant company information if available. If no specific financial metrics are available, provide general information about the company and industry.`;

    case "search":
      const providerInfo = context.provider === "exa" ? "Exa search engine" : 
                          context.provider === "searxng" ? "SearXNG search engine" : 
                          "combined web search engines";
      
      return `[CONTEXT: The user is asking for web search results. I've used ${providerInfo} to find information about "${context.query}": ${JSON.stringify(context.results)}]

User query: ${userInput}

Respond in a helpful, conversational way. Use the search results to provide an informative answer. Cite sources when appropriate by including the website name in parentheses. If articles have publication dates or authors, consider mentioning that information to provide context about how recent the information is.`;

    default:
      return userInput;
  }
}
