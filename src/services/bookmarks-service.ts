
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  createdAt: number; // timestamp
  tags?: string[];
  favicon?: string;
}

// Local storage key for bookmarks
const BOOKMARKS_STORAGE_KEY = 'gemini-assistant-bookmarks';

// Get all bookmarks
export const getBookmarks = (): Bookmark[] => {
  const storedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
  return storedBookmarks ? JSON.parse(storedBookmarks) : [];
};

// Add a new bookmark
export const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark => {
  const bookmarks = getBookmarks();
  
  const newBookmark: Bookmark = {
    ...bookmark,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  
  const updatedBookmarks = [newBookmark, ...bookmarks];
  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updatedBookmarks));
  
  return newBookmark;
};

// Update an existing bookmark
export const updateBookmark = (id: string, updates: Partial<Bookmark>): Bookmark | null => {
  const bookmarks = getBookmarks();
  const bookmarkIndex = bookmarks.findIndex((b) => b.id === id);
  
  if (bookmarkIndex === -1) return null;
  
  const updatedBookmark = { ...bookmarks[bookmarkIndex], ...updates };
  bookmarks[bookmarkIndex] = updatedBookmark;
  
  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  return updatedBookmark;
};

// Delete a bookmark
export const deleteBookmark = (id: string): boolean => {
  const bookmarks = getBookmarks();
  const filteredBookmarks = bookmarks.filter((b) => b.id !== id);
  
  if (filteredBookmarks.length === bookmarks.length) return false;
  
  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(filteredBookmarks));
  return true;
};

// Search bookmarks
export const searchBookmarks = (query: string): Bookmark[] => {
  const bookmarks = getBookmarks();
  
  if (!query) return bookmarks;
  
  const lowerCaseQuery = query.toLowerCase();
  
  return bookmarks.filter((bookmark) => {
    return (
      bookmark.title.toLowerCase().includes(lowerCaseQuery) ||
      (bookmark.description || '').toLowerCase().includes(lowerCaseQuery) ||
      (bookmark.url || '').toLowerCase().includes(lowerCaseQuery) ||
      (bookmark.category || '').toLowerCase().includes(lowerCaseQuery) ||
      (bookmark.tags || []).some((tag) => tag.toLowerCase().includes(lowerCaseQuery))
    );
  });
};
