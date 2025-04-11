
import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Monitor, Info, Key, Save, User, LogOut, LogIn, Database } from "lucide-react";
import { CardGlass, CardGlassHeader, CardGlassTitle, CardGlassContent, CardGlassFooter } from "@/components/ui/card-glass";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getUserPreferences, updateUserPreferences } from "@/services/user-preferences-service";

// Local storage keys
const GEMINI_API_KEY_STORAGE = "gemini-assistant-api-key";
const SPEECH_ENABLED_STORAGE = "gemini-assistant-speech-enabled";

const SettingsPage = () => {
  // Get initial values from local storage
  const initialApiKey = localStorage.getItem(GEMINI_API_KEY_STORAGE) || "AIzaSyD36BugamnLHIhQRLv3V4HXu_hg4B9-WFQ";
  const initialSpeechEnabled = localStorage.getItem(SPEECH_ENABLED_STORAGE) === "true" || false;
  
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [speechEnabled, setSpeechEnabled] = useState(initialSpeechEnabled);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [defaultLocation, setDefaultLocation] = useState("");
  const [aiProvider, setAIProvider] = useState<"gemini" | "playai">("gemini");

  // Check for active session
  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
        
        // Load preferences if authenticated
        if (data.session?.user) {
          const prefs = await getUserPreferences();
          if (prefs) {
            setDefaultLocation(prefs.location || "");
            setAIProvider(prefs.ai_provider as "gemini" | "playai");
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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

  const handleSavePreferences = async () => {
    if (!user) {
      toast.error("You must be logged in to save preferences");
      return;
    }
    
    try {
      await updateUserPreferences({
        location: defaultLocation,
        ai_provider: aiProvider
      });
      
      toast.success("Preferences saved successfully");
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    }
  };

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Signed in successfully");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      toast.error(`Error signing in: ${error.message}`);
    }
  };

  const handleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Check your email for the confirmation link");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      toast.error(`Error signing up: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(`Error signing out: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="space-y-6">
        {!user ? (
          <CardGlass variant="accent">
            <CardGlassHeader>
              <CardGlassTitle className="flex items-center gap-2">
                <User size={18} />
                Authentication
              </CardGlassTitle>
            </CardGlassHeader>
            <CardGlassContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="glassmorphism"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glassmorphism"
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                Sign in to save your preferences and get personalized AI responses.
              </p>
            </CardGlassContent>
            <CardGlassFooter className="flex gap-2 justify-end">
              <Button onClick={handleSignUp} variant="outline">
                Sign Up
              </Button>
              <Button onClick={handleSignIn} className="flex items-center gap-2">
                <LogIn size={16} />
                Sign In
              </Button>
            </CardGlassFooter>
          </CardGlass>
        ) : (
          <CardGlass variant="accent">
            <CardGlassHeader>
              <CardGlassTitle className="flex items-center gap-2">
                <User size={18} />
                Account
              </CardGlassTitle>
            </CardGlassHeader>
            <CardGlassContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Database size={20} className="text-primary" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultLocation">Default Location</Label>
                <Input
                  id="defaultLocation"
                  value={defaultLocation}
                  onChange={(e) => setDefaultLocation(e.target.value)}
                  placeholder="New York"
                  className="glassmorphism"
                />
                <p className="text-xs text-muted-foreground">
                  This location will be used for weather and local information
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Preferred AI Provider</Label>
                <div className="flex gap-2">
                  <Button 
                    variant={aiProvider === "gemini" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAIProvider("gemini")}
                  >
                    Gemini
                  </Button>
                  <Button 
                    variant={aiProvider === "playai" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAIProvider("playai")}
                  >
                    PlayAI
                  </Button>
                </div>
              </div>
            </CardGlassContent>
            <CardGlassFooter className="flex gap-2 justify-between">
              <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2">
                <LogOut size={16} />
                Sign Out
              </Button>
              <Button 
                onClick={handleSavePreferences} 
                className="flex items-center gap-2"
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
                    Save Preferences
                  </>
                )}
              </Button>
            </CardGlassFooter>
          </CardGlass>
        )}
        
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
              <p className="text-xs text-muted-foreground">
                <a 
                  href="https://ai.google.dev/tutorials/setup" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-primary hover:underline"
                >
                  Get an API key from Google AI Studio
                </a>
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
              Your data is stored securely in Supabase when you're signed in, allowing for personalized experiences.
              For anonymous users, preferences are stored locally in your browser.
            </p>
          </CardGlassContent>
        </CardGlass>
      </div>
    </div>
  );
}

export default SettingsPage;
