
import { CardGlass, CardGlassHeader, CardGlassTitle, CardGlassContent } from "@/components/ui/card-glass";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { getUpcomingEvents } from "@/services/calendar-service";
import { getBookmarks } from "@/services/bookmarks-service";
import { Calendar, Bookmark } from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  const upcomingEvents = getUpcomingEvents(3);
  const recentBookmarks = getBookmarks().slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="mb-8">
        <h1 className="text-3xl font-bold animate-fade-in">Hello there</h1>
        <p className="text-muted-foreground animate-fade-in delay-75">
          What can I help you with today?
        </p>
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
