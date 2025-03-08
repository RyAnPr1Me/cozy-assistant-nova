
import { useState } from "react";
import { Settings as SettingsIcon, Monitor, Info, Key, Save } from "lucide-react";
import { CardGlass, CardGlassHeader, CardGlassTitle, CardGlassContent, CardGlassFooter } from "@/components/ui/card-glass";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// Local storage keys
const GEMINI_API_KEY_STORAGE = "gemini-assistant-api-key";
const SPEECH_ENABLED_STORAGE = "gemini-assistant-speech-enabled";
const DARK_MODE_STORAGE = "gemini-assistant-dark-mode";

const SettingsPage = () => {
  // Get initial values from local storage
  const initialApiKey = localStorage.getItem(GEMINI_API_KEY_STORAGE) || "AIzaSyD36BugamnLHIhQRLv3V4HXu_hg4B9-WFQ";
  const initialSpeechEnabled = localStorage.getItem(SPEECH_ENABLED_STORAGE) === "true" || false;
  
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [speechEnabled, setSpeechEnabled] = useState(initialSpeechEnabled);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = () => {
    // Save settings to local storage
    localStorage.setItem(GEMINI_API_KEY_STORAGE, apiKey);
    localStorage.setItem(SPEECH_ENABLED_STORAGE, speechEnabled.toString());
    
    // Show success message
    toast.success("Settings saved successfully");
    setSaveSuccess(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="space-y-6">
        <CardGlass>
          <CardGlassHeader>
            <CardGlassTitle className="flex items-center gap-2">
              <SettingsIcon size={18} />
              General Settings
            </CardGlassTitle>
          </CardGlassHeader>
          <CardGlassContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  The app is currently using dark mode by default
                </p>
              </div>
              <Monitor size={24} className="text-muted-foreground" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Speech Recognition</Label>
                <p className="text-sm text-muted-foreground">
                  Enable voice input for the AI assistant
                </p>
              </div>
              <Switch
                checked={speechEnabled}
                onCheckedChange={setSpeechEnabled}
              />
            </div>
          </CardGlassContent>
          <CardGlassFooter>
            <Button 
              onClick={handleSaveSettings} 
              className="ml-auto flex items-center gap-2"
              variant={saveSuccess ? "outline" : "default"}
            >
              {saveSuccess ? (
                <>
                  <Save size={16} className="text-green-500" />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Settings
                </>
              )}
            </Button>
          </CardGlassFooter>
        </CardGlass>
        
        <CardGlass variant="accent">
          <CardGlassHeader>
            <CardGlassTitle className="flex items-center gap-2">
              <Key size={18} />
              API Settings
            </CardGlassTitle>
          </CardGlassHeader>
          <CardGlassContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Gemini API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="glassmorphism"
              />
              <p className="text-xs text-muted-foreground">
                Your Gemini API key is stored locally and never sent to our servers
              </p>
            </div>
          </CardGlassContent>
          <CardGlassFooter>
            <Button 
              onClick={handleSaveSettings} 
              className="ml-auto flex items-center gap-2"
              variant={saveSuccess ? "outline" : "default"}
            >
              {saveSuccess ? (
                <>
                  <Save size={16} className="text-green-500" />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save API Key
                </>
              )}
            </Button>
          </CardGlassFooter>
        </CardGlass>
        
        <CardGlass variant="dark">
          <CardGlassHeader>
            <CardGlassTitle className="flex items-center gap-2">
              <Info size={18} />
              About
            </CardGlassTitle>
          </CardGlassHeader>
          <CardGlassContent>
            <p className="text-muted-foreground">
              Gemini AI Assistant is a personal assistant powered by Google's Gemini AI. 
              It helps you manage your calendar, bookmarks, and provides intelligent responses to your queries.
            </p>
            <p className="text-muted-foreground mt-4">
              Your data is stored locally in your browser and is never sent to any server unless explicitly required to call the Gemini API.
            </p>
          </CardGlassContent>
        </CardGlass>
      </div>
    </div>
  );
};

export default SettingsPage;
