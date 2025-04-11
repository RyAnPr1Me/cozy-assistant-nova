
import { CardGlass, CardGlassHeader, CardGlassTitle, CardGlassContent } from "@/components/ui/card-glass";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { getUpcomingEvents } from "@/services/calendar-service";
import { getBookmarks } from "@/services/bookmarks-service";
import { getStockQuote } from "@/services/alphavantage-service";
import { Calendar, Bookmark, BarChart3, Search, CloudSun, Atom, Zap, Brain, Shield, FileCode, PenTool, Palette } from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const isMobile = useIsMobile();
  const upcomingEvents = getUpcomingEvents(3);
  const recentBookmarks = getBookmarks().slice(0, 3);
  const [stockQuote, setStockQuote] = useState<any>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(true);

  // Fetch a sample stock quote for display
  useEffect(() => {
    async function fetchSampleStock() {
      try {
        const quote = await getStockQuote("AAPL");
        setStockQuote(quote);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      } finally {
        setIsLoadingStock(false);
      }
    }
    
    fetchSampleStock();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in bg-gradient-to-br from-black/20 via-background to-purple-950/10 min-h-screen">
      <section className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Atom size={32} className="text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-purple-300">OMEGA-3</h1>
            <p className="text-muted-foreground bg-clip-text text-transparent bg-gradient-to-r from-purple-200/80 to-blue-200/80">
              Advanced AI with multi-generative capabilities
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 my-4 bg-black/30 p-4 rounded-xl border border-purple-500/20 backdrop-blur-md">
          <Badge variant="outline" className="flex items-center gap-1.5 py-2 px-3 bg-purple-600/10 text-purple-300 border-purple-500/30">
            <Zap size={16} className="text-purple-400" /> Super-Fast Responses
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5 py-2 px-3 bg-blue-600/10 text-blue-300 border-blue-500/30">
            <Brain size={16} className="text-blue-400" /> Advanced Intelligence
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5 py-2 px-3 bg-green-600/10 text-green-300 border-green-500/30">
            <Shield size={16} className="text-green-400" /> Personalized Experience
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5 py-2 px-3 bg-indigo-600/10 text-indigo-300 border-indigo-500/30">
            <FileCode size={16} className="text-indigo-400" /> Code Generation
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5 py-2 px-3 bg-pink-600/10 text-pink-300 border-pink-500/30">
            <PenTool size={16} className="text-pink-400" /> Creative Writing
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5 py-2 px-3 bg-teal-600/10 text-teal-300 border-teal-500/30">
            <Palette size={16} className="text-teal-400" /> Visual Descriptions
          </Badge>
        </div>
      </section>

      <div className={isMobile ? "space-y-6" : "grid grid-cols-3 gap-6"}>
        <div className="col-span-2">
          <ChatInterface />
        </div>

        <div className="space-y-6">
          <CardGlass variant="accent" hover="lift" className="border border-purple-500/30 bg-black/50 backdrop-blur-lg">
            <CardGlassHeader className="bg-gradient-to-r from-purple-500/20 to-purple-500/10 border-b border-purple-500/20">
              <CardGlassTitle className="flex items-center gap-2 text-purple-300">
                <Calendar size={18} className="text-purple-400" />
                Upcoming Events
              </CardGlassTitle>
            </CardGlassHeader>
            <CardGlassContent>
              {upcomingEvents.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <li key={event.id} className="flex flex-col p-2 rounded-md hover:bg-purple-900/20 transition-colors border border-purple-500/10">
                      <span className="font-medium text-purple-200">{event.title}</span>
                      <span className="text-xs text-purple-300/70">
                        {format(new Date(event.start), "PPP 'at' p")}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              )}
            </CardGlassContent>
          </CardGlass>

          <CardGlass variant="default" hover="lift" className="border border-green-500/30 bg-black/50 backdrop-blur-lg">
            <CardGlassHeader className="bg-gradient-to-r from-green-500/20 to-green-500/10 border-b border-green-500/20">
              <CardGlassTitle className="flex items-center gap-2 text-green-300">
                <BarChart3 size={18} className="text-green-400" />
                Stock Market
              </CardGlassTitle>
            </CardGlassHeader>
            <CardGlassContent>
              {isLoadingStock ? (
                <p className="text-sm text-muted-foreground">Loading stock data...</p>
              ) : stockQuote ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-200">{stockQuote.symbol}</span>
                    <span className={`text-${stockQuote.change >= 0 ? 'green' : 'red'}-400 font-medium`}>
                      ${stockQuote.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-300/80">Change</span>
                    <span className={`text-${stockQuote.change >= 0 ? 'green' : 'red'}-400`}>
                      {stockQuote.change >= 0 ? '+' : ''}{stockQuote.change.toFixed(2)} ({stockQuote.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="text-xs text-green-300/60 mt-1">
                    Last updated: {stockQuote.latestTradingDay}
                  </div>
                  <div className="text-xs bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400 mt-2 font-medium">
                    Ask Omega-3 about any stock!
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unable to load stock data</p>
              )}
            </CardGlassContent>
          </CardGlass>

          <CardGlass variant="default" hover="lift" className="border border-orange-500/30 bg-black/50 backdrop-blur-lg">
            <CardGlassHeader className="bg-gradient-to-r from-orange-500/20 to-orange-500/10 border-b border-orange-500/20">
              <CardGlassTitle className="flex items-center gap-2 text-orange-300">
                <Bookmark size={18} className="text-orange-400" />
                Recent Bookmarks
              </CardGlassTitle>
            </CardGlassHeader>
            <CardGlassContent>
              {recentBookmarks.length > 0 ? (
                <ul className="space-y-3">
                  {recentBookmarks.map((bookmark) => (
                    <li key={bookmark.id} className="flex flex-col p-2 rounded-md hover:bg-orange-900/20 transition-colors border border-orange-500/10">
                      <a 
                        href={bookmark.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-orange-200 hover:text-orange-100 transition-colors"
                      >
                        {bookmark.title}
                      </a>
                      {bookmark.description && (
                        <span className="text-xs text-orange-300/70">
                          {bookmark.description.substring(0, 60)}
                          {bookmark.description.length > 60 ? "..." : ""}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No bookmarks saved yet</p>
              )}
            </CardGlassContent>
          </CardGlass>
        </div>
      </div>
    </div>
  );
};

export default Index;
