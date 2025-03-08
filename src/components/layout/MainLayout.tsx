
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className={cn(
        "transition-all duration-300 ease-in-out min-h-screen",
        isMobile ? "ml-0 p-4" : "ml-64 p-6"
      )}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
