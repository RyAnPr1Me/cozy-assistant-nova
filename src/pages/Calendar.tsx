
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { CardGlass, CardGlassHeader, CardGlassTitle, CardGlassContent } from "@/components/ui/card-glass";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CalendarEvent, addEvent, getEventsForRange, deleteEvent } from "@/services/calendar-service";
import { format, startOfDay, endOfDay, addDays } from "date-fns";
import { PlusCircle, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const CalendarPage = () => {
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    description: "",
    start: Date.now(),
    end: Date.now() + 3600000, // 1 hour later
    allDay: false,
  });
  
  // Get events for the selected date
  const eventsForDay = getEventsForRange(
    startOfDay(selectedDate).getTime(),
    endOfDay(selectedDate).getTime()
  );
  
  // Get upcoming events for the next 7 days
  const start = startOfDay(new Date()).getTime();
  const end = endOfDay(addDays(new Date(), 7)).getTime();
  const upcomingEvents = getEventsForRange(start, end).sort((a, b) => a.start - b.start);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleAddEvent = () => {
    if (!newEvent.title) {
      toast.error("Please enter an event title");
      return;
    }
    
    try {
      const eventToAdd = {
        ...newEvent,
        title: newEvent.title || "",
        start: selectedDate.getTime(),
        end: selectedDate.getTime() + 3600000,
        allDay: newEvent.allDay || false,
      } as Omit<CalendarEvent, "id">;
      
      addEvent(eventToAdd);
      
      toast.success("Event added successfully");
      setIsAddEventDialogOpen(false);
      setNewEvent({
        title: "",
        description: "",
        start: Date.now(),
        end: Date.now() + 3600000,
        allDay: false,
      });
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Failed to add event");
    }
  };

  const handleDeleteEvent = (id: string) => {
    try {
      deleteEvent(id);
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Calendar</h1>
      
      <div className={isMobile ? "space-y-6" : "grid grid-cols-3 gap-6"}>
        <div className="col-span-2 space-y-6">
          <CardGlass className="flex flex-col items-center overflow-hidden">
            <CardGlassHeader className="w-full">
              <CardGlassTitle>Your Schedule</CardGlassTitle>
            </CardGlassHeader>
            <CardGlassContent className="flex justify-center w-full">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="p-4 rounded-md max-w-full glassmorphism pointer-events-auto"
              />
            </CardGlassContent>
          </CardGlass>
          
          <CardGlass>
            <CardGlassHeader className="flex justify-between items-center">
              <CardGlassTitle>
                Events for {format(selectedDate, "MMMM d, yyyy")}
              </CardGlassTitle>
              <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1">
                    <PlusCircle size={16} />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="glassmorphism sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title || ""}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        className="glassmorphism"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Input
                        id="description"
                        value={newEvent.description || ""}
                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                        className="glassmorphism"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="all-day"
                        checked={newEvent.allDay || false}
                        onCheckedChange={(checked) => setNewEvent({...newEvent, allDay: checked})}
                      />
                      <Label htmlFor="all-day">All day event</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddEvent}>Add Event</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardGlassHeader>
            <CardGlassContent>
              {eventsForDay.length > 0 ? (
                <ul className="space-y-4">
                  {eventsForDay.map((event) => (
                    <li key={event.id} className="flex justify-between items-center glassmorphism p-3 rounded-md">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {event.allDay 
                            ? "All day"
                            : `${format(new Date(event.start), "h:mm a")} - ${format(new Date(event.end), "h:mm a")}`}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 size={18} className="text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-4">No events scheduled for this day</p>
              )}
            </CardGlassContent>
          </CardGlass>
        </div>
        
        <div>
          <CardGlass variant="accent" hover="lift">
            <CardGlassHeader>
              <CardGlassTitle>Upcoming Events</CardGlassTitle>
            </CardGlassHeader>
            <CardGlassContent>
              {upcomingEvents.length > 0 ? (
                <ul className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <li key={event.id} className="flex flex-col glassmorphism p-3 rounded-md">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(event.start), "MMMM d, yyyy")}
                      </div>
                      {!event.allDay && (
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(event.start), "h:mm a")} - {format(new Date(event.end), "h:mm a")}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-4">No upcoming events</p>
              )}
            </CardGlassContent>
          </CardGlass>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
