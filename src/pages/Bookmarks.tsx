
import { useState } from "react";
import { Bookmark as BookmarkIcon, Plus, Search, Trash2, ExternalLink } from "lucide-react";
import { CardGlass, CardGlassHeader, CardGlassTitle, CardGlassContent } from "@/components/ui/card-glass";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Bookmark, addBookmark, getBookmarks, deleteBookmark, searchBookmarks } from "@/services/bookmarks-service";
import { useIsMobile } from "@/hooks/use-mobile";

const BookmarksPage = () => {
  const isMobile = useIsMobile();
  const [isAddBookmarkDialogOpen, setIsAddBookmarkDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBookmark, setNewBookmark] = useState<Partial<Bookmark>>({
    title: "",
    url: "",
    description: "",
  });
  
  const bookmarks = searchQuery ? searchBookmarks(searchQuery) : getBookmarks();

  const handleAddBookmark = () => {
    if (!newBookmark.title || !newBookmark.url) {
      toast.error("Please enter a title and URL");
      return;
    }
    
    // Add http:// if missing and not starting with https:// either
    let url = newBookmark.url;
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    
    try {
      addBookmark({
        title: newBookmark.title,
        url: url,
        description: newBookmark.description,
      });
      
      toast.success("Bookmark added successfully");
      setIsAddBookmarkDialogOpen(false);
      setNewBookmark({
        title: "",
        url: "",
        description: "",
      });
    } catch (error) {
      console.error("Error adding bookmark:", error);
      toast.error("Failed to add bookmark");
    }
  };

  const handleDeleteBookmark = (id: string) => {
    try {
      deleteBookmark(id);
      toast.success("Bookmark deleted successfully");
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      toast.error("Failed to delete bookmark");
    }
  };

  const getFavicon = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch (error) {
      return undefined;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Bookmarks</h1>
      
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glassmorphism"
            />
          </div>
          
          <Dialog open={isAddBookmarkDialogOpen} onOpenChange={setIsAddBookmarkDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus size={16} />
                Add Bookmark
              </Button>
            </DialogTrigger>
            <DialogContent className="glassmorphism sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Bookmark</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newBookmark.title || ""}
                    onChange={(e) => setNewBookmark({...newBookmark, title: e.target.value})}
                    className="glassmorphism"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={newBookmark.url || ""}
                    onChange={(e) => setNewBookmark({...newBookmark, url: e.target.value})}
                    placeholder="https://example.com"
                    className="glassmorphism"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={newBookmark.description || ""}
                    onChange={(e) => setNewBookmark({...newBookmark, description: e.target.value})}
                    className="glassmorphism"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddBookmarkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBookmark}>Add Bookmark</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <CardGlass>
          <CardGlassHeader>
            <CardGlassTitle className="flex items-center gap-2">
              <BookmarkIcon size={18} />
              Your Bookmarks
            </CardGlassTitle>
          </CardGlassHeader>
          <CardGlassContent>
            {bookmarks.length > 0 ? (
              <div className={isMobile ? "space-y-4" : "grid grid-cols-2 gap-4"}>
                {bookmarks.map((bookmark) => (
                  <div 
                    key={bookmark.id} 
                    className="flex items-start gap-3 glassmorphism p-4 rounded-md hover:shadow-md transition-all duration-300"
                  >
                    {bookmark.url && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-md bg-secondary/80 flex items-center justify-center overflow-hidden">
                        {getFavicon(bookmark.url) ? (
                          <img 
                            src={getFavicon(bookmark.url)}
                            alt={bookmark.title}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <BookmarkIcon size={20} className="text-primary" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{bookmark.title}</h3>
                      {bookmark.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {bookmark.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <a 
                          href={bookmark.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-primary flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink size={12} />
                          Visit
                        </a>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleDeleteBookmark(bookmark.id)}
                        >
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <BookmarkIcon size={40} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No bookmarks found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "No bookmarks match your search query. Try something else."
                    : "You haven't saved any bookmarks yet. Add your first one!"}
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={() => setIsAddBookmarkDialogOpen(true)}
                    className="animate-pulse"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Your First Bookmark
                  </Button>
                )}
              </div>
            )}
          </CardGlassContent>
        </CardGlass>
      </div>
    </div>
  );
};

export default BookmarksPage;
