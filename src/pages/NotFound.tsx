
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CardGlass } from "@/components/ui/card-glass";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <CardGlass className="max-w-md w-full text-center animate-scale-in">
        <div className="flex flex-col items-center justify-center py-8 px-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <AlertTriangle size={32} className="text-destructive" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-gradient-primary">404</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Oops! The page you're looking for doesn't exist.
          </p>
          
          <Button asChild className="w-full sm:w-auto">
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </CardGlass>
    </div>
  );
};

export default NotFound;
