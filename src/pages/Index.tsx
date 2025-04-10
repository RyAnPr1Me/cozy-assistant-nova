
import { CardGlass, CardGlassHeader, CardGlassTitle, CardGlassContent } from "@/components/ui/card-glass";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { getUpcomingEvents } from "@/services/calendar-service";
import { getBookmarks } from "@/services/bookmarks-service";
import { getStockQuote } from "@/services/alphavantage-service";
import { Calendar, Bookmark, BarChart3, Search, CloudSun, Sparkles } from "lucide-react";
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
    <div className="space-y-8 animate-fade-in">
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Assistant</h1>
            <p className="text-muted-foreground">
              Your intelligent companion with enhanced capabilities
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="flex items-center gap-1 py-1.5 px-3 bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
            <CloudSun size={14} className="text-yellow-500" /> Weather
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 py-1.5 px-3 bg-green-500/10 text-green-500 border-green-500/30">
            <BarChart3 size={14} className="text-green-500" /> Stocks
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 py-1.5 px-3 bg-blue-500/10 text-blue-500 border-blue-500/30">
            <Search size={14} className="text-blue-500" /> Web Search
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 py-1.5 px-3 bg-purple-500/10 text-purple-500 border-purple-500/30">
            <Calendar size={14} className="text-purple-500" /> Calendar
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 py-1.5 px-3 bg-orange-500/10 text-orange-500 border-orange-500/30">
            <Bookmark size={14} className="text-orange-500" /> Bookmarks
          </Badge>
        </div>
      </section>

      <div className={isMobile ? "space-y-6" : "grid grid-cols-3 gap-6"}>
        <div className="col-span-2">
          <ChatInterface />
        </div>

        <div className="space-y-6">
          <CardGlass variant="accent" hover="lift" className="border border-muted/30 bg-card/50 backdrop-blur-sm">
            <CardGlassHeader className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border-b border-purple-500/20">
              <CardGlassTitle className="flex items-center gap-2 text-purple-500">
                <Calendar size={18} className="text-purple-500" />
                Upcoming Events
              </CardGlassTitle>
            </CardGlassHeader>
            <CardGlassContent>
              {upcomingEvents.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <li key={event.id} className="flex flex-col p-2 rounded-md hover:bg-muted/30 transition-colors">
                      <span className="font-medium">{event.title}</span>
                      <span className="text-xs text-muted-foreground">
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

          <CardGlass variant="default" hover="lift" className="border border-muted/30 bg-card/50 backdrop-blur-sm">
            <CardGlassHeader className="bg-gradient-to-r from-green-500/10 to-green-500/5 border-b border-green-500/20">
              <CardGlassTitle className="flex items-center gap-2 text-green-500">
                <BarChart3 size={18} className="text-green-500" />
                Stock Market
              </CardGlassTitle>
            </CardGlassHeader>
            <CardGlassContent>
              {isLoadingStock ? (
                <p className="text-sm text-muted-foreground">Loading stock data...</p>
              ) : stockQuote ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{stockQuote.symbol}</span>
                    <span className={`text-${stockQuote.change >= 0 ? 'green' : 'red'}-500 font-medium`}>
                      ${stockQuote.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Change</span>
                    <span className={`text-${stockQuote.change >= 0 ? 'green' : 'red'}-500`}>
                      {stockQuote.change >= 0 ? '+' : ''}{stockQuote.change.toFixed(2)} ({stockQuote.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Last updated: {stockQuote.latestTradingDay}
                  </div>
                  <div className="text-xs text-primary mt-2">
                    Ask the assistant about any stock!
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unable to load stock data</p>
              )}
            </CardGlassContent>
          </CardGlass>

          <CardGlass variant="default" hover="lift" className="border border-muted/30 bg-card/50 backdrop-blur-sm">
            <CardGlassHeader className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 border-b border-orange-500/20">
              <CardGlassTitle className="flex items-center gap-2 text-orange-500">
                <Bookmark size={18} className="text-orange-500" />
                Recent Bookmarks
              </CardGlassTitle>
            </CardGlassHeader>
            <CardGlassContent>
              {recentBookmarks.length > 0 ? (
                <ul className="space-y-3">
                  {recentBookmarks.map((bookmark) => (
                    <li key={bookmark.id} className="flex flex-col p-2 rounded-md hover:bg-muted/30 transition-colors">
                      <a 
                        href={bookmark.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {bookmark.title}
                      </a>
                      {bookmark.description && (
                        <span className="text-xs text-muted-foreground">
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
