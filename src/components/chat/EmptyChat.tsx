
export function EmptyChat() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
      <div className="w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
        <div className="text-3xl animate-floating">👋</div>
      </div>
      <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
      <p className="text-muted-foreground max-w-md">
        Ask me anything about your calendar, bookmarks, or just have a conversation.
      </p>
    </div>
  );
}
