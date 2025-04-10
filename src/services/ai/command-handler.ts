
import { toast } from "sonner";
import { AiResponse } from "./types";
import { 
  getEvents, 
  addEvent, 
  updateEvent, 
  deleteEvent 
} from "../calendar-service";
import {
  getBookmarks,
  addBookmark,
  updateBookmark,
  deleteBookmark
} from "../bookmarks-service";
import {
  getStockQuote
} from "../alphavantage-service";

// Parse AI response to extract commands
export const parseAiResponse = (text: string): AiResponse => {
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

// Execute commands from AI response
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
