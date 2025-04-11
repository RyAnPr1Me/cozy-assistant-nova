
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface UserPreference {
  id: string;
  user_id: string;
  location: string | null;
  topics: string[];
  search_provider: string | null;
  ai_provider: string;
  created_at: string;
  updated_at: string;
}

export interface LearnedPreference {
  type: 'location' | 'topic' | 'search_provider' | 'ai_provider';
  value: string;
}

/**
 * Retrieves the current user's preferences
 */
export async function getUserPreferences(): Promise<UserPreference | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session?.user) {
      console.log("No authenticated user found");
      return null;
    }
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', session.session.user.id)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching user preferences:", error);
      return null;
    }
    
    return data as UserPreference;
  } catch (error) {
    console.error("Error in getUserPreferences:", error);
    return null;
  }
}

/**
 * Updates user preferences in the database
 */
export async function updateUserPreferences(preferences: Partial<UserPreference>): Promise<UserPreference | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session?.user) {
      toast.error("You must be logged in to update preferences");
      return null;
    }
    
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.session.user.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating user preferences:", error);
      toast.error("Failed to update preferences");
      return null;
    }
    
    toast.success("Preferences updated successfully");
    return data as UserPreference;
  } catch (error) {
    console.error("Error in updateUserPreferences:", error);
    toast.error("An error occurred while updating preferences");
    return null;
  }
}

/**
 * Logs an AI interaction and potentially updates user preferences
 */
export async function logAIInteraction(
  query: string, 
  response: string, 
  provider: string,
  learnedPreferences?: LearnedPreference[]
): Promise<void> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session?.user) {
      console.log("No authenticated user found, skipping interaction logging");
      return;
    }
    
    // Convert LearnedPreference[] to Json compatible format
    const preferencesJson = learnedPreferences ? learnedPreferences.map(pref => ({
      type: pref.type,
      value: pref.value
    })) : null;
    
    // Log the interaction
    await supabase
      .from('ai_interactions')
      .insert({
        user_id: session.session.user.id,
        query,
        response,
        provider,
        learned_preferences: preferencesJson as Json
      });
    
    // Update user preferences if we learned something new
    if (learnedPreferences && learnedPreferences.length > 0) {
      const currentPrefs = await getUserPreferences();
      
      if (!currentPrefs) return;
      
      const updates: Partial<UserPreference> = {};
      
      for (const pref of learnedPreferences) {
        if (pref.type === 'location') {
          updates.location = pref.value;
        } else if (pref.type === 'topic') {
          const currentTopics = currentPrefs.topics || [];
          if (!currentTopics.includes(pref.value)) {
            updates.topics = [...currentTopics, pref.value];
          }
        } else if (pref.type === 'search_provider') {
          updates.search_provider = pref.value;
        } else if (pref.type === 'ai_provider') {
          updates.ai_provider = pref.value;
        }
      }
      
      if (Object.keys(updates).length > 0) {
        await updateUserPreferences(updates);
      }
    }
  } catch (error) {
    console.error("Error logging AI interaction:", error);
  }
}

/**
 * Extracts potential preferences from user input
 */
export function extractPreferencesFromInput(userInput: string): LearnedPreference[] {
  const learnedPreferences: LearnedPreference[] = [];
  
  // Extract location preferences
  const locationMatch = userInput.match(/(?:i am|i'm|i live) in ([a-zA-Z\s,]+)/i);
  if (locationMatch && locationMatch[1]) {
    const location = locationMatch[1].trim();
    learnedPreferences.push({
      type: 'location',
      value: location
    });
  }
  
  // Extract topic preferences
  const topicMatch = userInput.match(/(?:i like|i'm interested in|tell me about) ([a-zA-Z\s,]+)/i);
  if (topicMatch && topicMatch[1]) {
    const topic = topicMatch[1].trim().toLowerCase();
    learnedPreferences.push({
      type: 'topic',
      value: topic
    });
  }
  
  // Extract AI provider preferences
  if (userInput.toLowerCase().includes("use playai") || userInput.toLowerCase().includes("switch to playai")) {
    learnedPreferences.push({
      type: 'ai_provider',
      value: 'playai'
    });
  } else if (userInput.toLowerCase().includes("use gemini") || userInput.toLowerCase().includes("switch to gemini")) {
    learnedPreferences.push({
      type: 'ai_provider',
      value: 'gemini'
    });
  }
  
  return learnedPreferences;
}
