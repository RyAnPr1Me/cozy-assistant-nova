
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: number; // timestamp
  end: number; // timestamp
  location?: string;
  allDay: boolean;
  color?: string;
}

// Local storage key for calendar events
const EVENTS_STORAGE_KEY = 'gemini-assistant-calendar-events';

// Get all events
export const getEvents = (): CalendarEvent[] => {
  const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
  return storedEvents ? JSON.parse(storedEvents) : [];
};

// Add a new event
export const addEvent = (event: Omit<CalendarEvent, 'id'>): CalendarEvent => {
  const events = getEvents();
  
  const newEvent: CalendarEvent = {
    ...event,
    id: crypto.randomUUID(),
  };
  
  const updatedEvents = [...events, newEvent];
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
  
  return newEvent;
};

// Update an existing event
export const updateEvent = (id: string, updates: Partial<CalendarEvent>): CalendarEvent | null => {
  const events = getEvents();
  const eventIndex = events.findIndex((e) => e.id === id);
  
  if (eventIndex === -1) return null;
  
  const updatedEvent = { ...events[eventIndex], ...updates };
  events[eventIndex] = updatedEvent;
  
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  return updatedEvent;
};

// Delete an event
export const deleteEvent = (id: string): boolean => {
  const events = getEvents();
  const filteredEvents = events.filter((e) => e.id !== id);
  
  if (filteredEvents.length === events.length) return false;
  
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(filteredEvents));
  return true;
};

// Get events for a specific date range
export const getEventsForRange = (start: number, end: number): CalendarEvent[] => {
  const events = getEvents();
  
  return events.filter((event) => {
    return (
      (event.start >= start && event.start <= end) || 
      (event.end >= start && event.end <= end) || 
      (event.start <= start && event.end >= end)
    );
  });
};

// Get upcoming events
export const getUpcomingEvents = (count: number = 5): CalendarEvent[] => {
  const events = getEvents();
  const now = Date.now();
  
  return events
    .filter((event) => event.start >= now)
    .sort((a, b) => a.start - b.start)
    .slice(0, count);
};
