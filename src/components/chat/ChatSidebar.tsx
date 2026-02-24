import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  LayoutDashboard,
  Globe,
  Moon,
  Sun,
  X,
  Check,
  LogOut,
  Loader2,
  Bot,
  Briefcase,
  User,
  Settings,
  Sparkles,
  Palette,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { useTheme } from 'next-themes';
import { useLanguage, type Language } from '@/i18n/LanguageContext';

export type ActivePanel = 'dashboard' | 'chat' | 'opportunites' | 'profil' | 'parametres';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  onNavigate?: (panel: ActivePanel) => void;
  activePanel?: ActivePanel;
}

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

const ChatSidebar = ({ isOpen, onClose, isMobile, onNavigate, activePanel = 'chat' }: ChatSidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { user, signOut, profile } = useAuthContext();
  const { language, setLanguage, t } = useLanguage();

  const [accountOpen, setAccountOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ── Nav items ─────────────────────────────────────────────────────────────────
  const NAV_ITEMS: { panel: ActivePanel; label: string; Icon: React.ElementType; badge?: boolean }[] = [
    { panel: 'dashboard',    label: t.nav.home,          Icon: LayoutDashboard },
    { panel: 'chat',         label: t.nav.edubot,        Icon: Bot },
    { panel: 'opportunites', label: t.nav.opportunities, Icon: Briefcase, badge: true },
  ];

  const handleThemeChange = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    const info = LANGUAGES.find(l => l.code === lang);
    toast({ title: `${info?.flag} ${t.settings.languageChanged}`, description: `${info?.label}` });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await signOut();
      if (error) sonnerToast.error('Erreur lors de la déconnexion');
      else { sonnerToast.success('Déconnexion réussie'); navigate('/auth'); }
    } catch { sonnerToast.error('Une erreur est survenue'); }
    finally { setIsLoggingOut(false); }
  };

  const handleNavClick = (panel: ActivePanel) => {
    onNavigate?.(panel);
    if (isMobile) onClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">

      {/* ── Navigation principale ── */}
      <nav className="px-3 pt-4 pb-2 flex-1">
        {/* Mobile close */}
        {isMobile && (
          <div className="flex justify-end mb-3 px-1">
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        <div className="space-y-1">
          {NAV_ITEMS.map(({ panel, label, Icon, badge }) => (
            <button
              key={panel}
              onClick={() => handleNavClick(panel)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                activePanel === panel
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">3</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Account Popover (en bas) ── */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <Popover open={accountOpen} onOpenChange={setAccountOpen}>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm font-medium transition-all duration-150 hover:bg-muted/60 text-foreground">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {profile?.name ? profile.name.split(' ').map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('') : user?.email?.charAt(0).toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left truncate">
                <p className="text-sm font-semibold leading-tight truncate">{profile?.name || 'Utilisateur'}</p>
                <p className="text-[11px] text-muted-foreground truncate">@{profile?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}</p>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-[220px] p-1.5 rounded-2xl" sideOffset={8}>
            {/* User info */}
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold leading-tight">{profile?.name || 'Utilisateur'}</p>
              <p className="text-xs text-muted-foreground truncate">@{profile?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}</p>
            </div>

            <div className="h-px bg-border mx-1 my-1" />

            {/* Menu items */}
            <div className="space-y-0.5">
              <button
                onClick={() => { setAccountOpen(false); handleNavClick('profil'); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/60 transition-colors text-foreground"
              >
                <Palette className="w-4 h-4 text-muted-foreground" />
                {t.nav.customization}
              </button>
              <button
                onClick={() => { setAccountOpen(false); handleNavClick('parametres'); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/60 transition-colors text-foreground"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                {t.nav.settings}
              </button>
            </div>

            <div className="h-px bg-border mx-1 my-1" />

            {/* Theme + Language */}
            <div className="space-y-0.5">
              <button
                onClick={handleThemeChange}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/60 transition-colors text-foreground"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
                {theme === 'dark' ? t.nav.lightMode : t.nav.darkMode}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/60 transition-colors text-foreground">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-left">{t.nav.language}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-40">
                  <DropdownMenuLabel className="text-xs">{t.nav.language}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {LANGUAGES.map(lang => (
                    <DropdownMenuItem key={lang.code} onClick={() => handleLanguageChange(lang.code)} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2"><span>{lang.flag}</span><span>{lang.label}</span></span>
                      {language === lang.code && <Check className="w-3.5 h-3.5 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="h-px bg-border mx-1 my-1" />

            {/* Logout */}
            <button
              onClick={() => { setAccountOpen(false); handleLogout(); }}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/60 transition-colors text-destructive"
            >
              {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              {t.nav.logout}
            </button>
          </PopoverContent>
        </Popover>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.chat.deleteConversation}</AlertDialogTitle>
            <AlertDialogDescription>{t.chat.deleteIrreversible}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t.common.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
        <aside className={cn('fixed inset-y-0 left-0 z-50 w-[220px] bg-background border-r border-border flex flex-col shadow-xl transition-transform duration-300', isOpen ? 'translate-x-0' : '-translate-x-full')}>
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside className={cn('bg-background border-r border-border flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden', isOpen ? 'w-[200px]' : 'w-0')}>
      {sidebarContent}
    </aside>
  );
};

export default ChatSidebar;

