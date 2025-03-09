
import { CardGlass, CardGlassHeader, CardGlassTitle, CardGlassContent } from "@/components/ui/card-glass";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { getUpcomingEvents } from "@/services/calendar-service";
import { getBookmarks } from "@/services/bookmarks-service";
import { getStockQuote } from "@/services/alphavantage-service";
import { Calendar, Bookmark, BarChart3, Search, CloudSun } from "lucide-react";
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
    <div className="space-y-6">
      <section className="mb-8">
        <h1 className="text-3xl font-bold animate-fade-in">Hello there</h1>
        <p className="text-muted-foreground animate-fade-in delay-75">
          Your AI assistant with enhanced capabilities - what can I help you with today?
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <CloudSun size={14} className="text-yellow-500" /> Weather
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <BarChart3 size={14} className="text-green-500" /> Stocks
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Search size={14} className="text-blue-500" /> Web Search
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar size={14} className="text-purple-500" /> Calendar
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Bookmark size={14} className="text-orange-500" /> Bookmarks
          </Badge>
        </div>
      </section>

      <div className={isMobile ? "space-y-6" : "grid grid-cols-3 gap-6"}>
        <div className="col-span-2">
          <ChatInterface />
        </div>

        <div className="space-y-6">
          <CardGlass variant="accent" hover="lift">
            <CardGlassHeader>
              <CardGlassTitle className="flex items-center gap-2">
                <Calendar size={18} />
                Upcoming Events
              </CardGlassTitle>
            </CardGlassHeader>
            <CardGlassContent>
              {upcomingEvents.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <li key={event.id} className="flex flex-col">
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

          <CardGlass variant="default" hover="lift">
            <CardGlassHeader>
              <CardGlassTitle className="flex items-center gap-2">
                <BarChart3 size={18} />
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

          <CardGlass variant="default" hover="lift">
            <CardGlassHeader>
              <CardGlassTitle className="flex items-center gap-2">
                <Bookmark size={18} />
                Recent Bookmarks
              </CardGlassTitle>
            </CardGlassHeader>
            <CardGlassContent>
              {recentBookmarks.length > 0 ? (
                <ul className="space-y-3">
                  {recentBookmarks.map((bookmark) => (
                    <li key={bookmark.id} className="flex flex-col">
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
