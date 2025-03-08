
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Bookmark, 
  Settings, 
  Command, 
  Menu, 
  X
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({ to, icon, label, isCollapsed }: SidebarLinkProps) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ease-in-out group",
        isActive 
          ? "bg-primary/10 text-primary"  
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        isCollapsed && "justify-center"
      )}
    >
      {icon}
      {!isCollapsed && <span className="animate-slide-down">{label}</span>}
      {isCollapsed && (
        <div className="absolute left-16 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </NavLink>
  );
};

export function Sidebar() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  if (isMobile && !isOpen) {
    return (
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        <Menu size={20} />
      </Button>
    );
  }

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={cn(
        "fixed top-0 left-0 h-full z-50 glassmorphism transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        isMobile && "w-64",
        isMobile && !isOpen && "-translate-x-full",
        "animate-slide-down"
      )}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <Command size={24} className="text-primary" />
                <h1 className="text-xl font-semibold">Gemini</h1>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
              {isMobile ? <X size={18} /> : isCollapsed ? <Menu size={18} /> : <X size={18} />}
            </Button>
          </div>
          
          <nav className="space-y-2">
            <SidebarLink 
              to="/" 
              icon={<Home size={20} />} 
              label="Home" 
              isCollapsed={isCollapsed} 
            />
            <SidebarLink 
              to="/calendar" 
              icon={<Calendar size={20} />} 
              label="Calendar" 
              isCollapsed={isCollapsed} 
            />
            <SidebarLink 
              to="/bookmarks" 
              icon={<Bookmark size={20} />} 
              label="Bookmarks" 
              isCollapsed={isCollapsed} 
            />
            <SidebarLink 
              to="/settings" 
              icon={<Settings size={20} />} 
              label="Settings" 
              isCollapsed={isCollapsed} 
            />
          </nav>
          
          <div className="mt-auto">
            <div className={cn(
              "p-3 rounded-lg glassmorphism",
              isCollapsed && "flex justify-center"
            )}>
              {!isCollapsed && (
                <div className="text-xs text-muted-foreground">
                  <p>Gemini AI Assistant</p>
                  <p>Version 1.0.0</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
