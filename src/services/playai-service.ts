
// PlayAI Conversation API service
const API_KEY = "ak-04a4c515562e45b7b2b2cf76ae8031ba";
const USER_ID = "hk0Todwennh2qTn91pgHYcyAFsD3";
const PLAYAI_API_URL = "https://api.play.ai/api/v1/chat";

export interface PlayAIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PlayAIResponse {
  id: string;
  message: {
    role: "assistant";
    content: string;
  };
}

interface ContextData {
  type: "weather" | "news" | "stocks" | "search" | "calendar" | "bookmarks";
  data: any;
}

export async function sendMessageToPlayAI(
  message: string,
  conversationHistory: PlayAIMessage[] = [],
  contextData?: ContextData
): Promise<string> {
  try {
    // Build system message with context if available
    let systemMessage = "You are a helpful, friendly assistant capable of answering questions about various topics.";
    
    if (contextData) {
      systemMessage += ` Here is relevant ${contextData.type} data that might help with your response: ${JSON.stringify(contextData.data)}`;
    }
    
    const messages = [
      { role: "system" as const, content: systemMessage },
      ...conversationHistory,
      { role: "user" as const, content: message }
    ];

    const response = await fetch(PLAYAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        user_id: USER_ID,
        messages: messages,
        model: "gpt-4o"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PlayAI API error:", errorText);
      throw new Error(`PlayAI API request failed: ${response.status}`);
    }

    const data: PlayAIResponse = await response.json();
    return data.message.content;
  } catch (error) {
    console.error("Error sending message to PlayAI:", error);
    throw new Error("Failed to communicate with PlayAI service");
  }
}
