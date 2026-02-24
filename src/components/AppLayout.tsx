import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import ChatSidebar, { type ActivePanel } from '@/components/chat/ChatSidebar';
import { Button } from '@/components/ui/button';
import { Bell, Menu } from 'lucide-react';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  activePanel?: ActivePanel;
  onNavigate?: (panel: ActivePanel) => void;
  /** Sidebar starts open on desktop */
  defaultSidebarOpen?: boolean;
}

const AppLayout = ({
  children,
  activePanel = 'chat',
  onNavigate,
  defaultSidebarOpen = true,
}: AppLayoutProps) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile && defaultSidebarOpen);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* ── Topbar minimale ── */}
      <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-lg z-40">
        {/* Left: hamburger/retour + logo */}
        <div className="flex items-center gap-3">
          {activePanel === 'chat' ? (
            // En mode EduBot : bouton retour visible dans la sidebar EduBot, ici on garde juste le menu
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg w-9 h-9"
              onClick={() => setSidebarOpen(v => !v)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg w-9 h-9"
              onClick={() => setSidebarOpen(v => !v)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => { onNavigate?.('dashboard'); }}
          >
            <img src={logo} alt="EduConnect" className="w-7 h-7 rounded-md" />
            <span className="font-bold text-[15px] hidden sm:block">
              <span className="text-foreground">Edu</span>
              <span className="text-primary">Connect</span>
            </span>
          </div>
        </div>

        {/* Right: bell */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full w-9 h-9"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
          </Button>
        </div>
      </header>

      {/* ── Body: sidebar + contenu ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* En mode EduBot, le sidebar principal est en overlay via mobile mode */}
        {activePanel === 'chat' ? (
          // Overlay sidebar quand EduBot est actif
          <>
            {sidebarOpen && (
              <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />
            )}
            <aside
              className={cn(
                'fixed inset-y-0 left-0 z-50 w-[200px] bg-background border-r border-border flex flex-col shadow-xl transition-transform duration-300',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              )}
            >
              <ChatSidebar
                isOpen={true}
                onClose={() => setSidebarOpen(false)}
                isMobile={true}
                onNavigate={(panel) => { onNavigate?.(panel); setSidebarOpen(false); }}
                activePanel={activePanel}
              />
            </aside>
          </>
        ) : (
          <ChatSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isMobile={isMobile}
            onNavigate={onNavigate}
            activePanel={activePanel}
          />
        )}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;


