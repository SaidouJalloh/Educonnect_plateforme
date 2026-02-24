import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { Bell, LogOut, User, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";

interface NavigationProps {
  onToggleSidebar?: () => void;
  showMenuButton?: boolean;
}

const Navigation = ({ onToggleSidebar, showMenuButton }: NavigationProps) => {
  const { user, profile, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await signOut();
      if (error) toast.error("Erreur lors de la déconnexion");
      else { toast.success("Déconnexion réussie"); navigate("/auth"); }
    } catch { toast.error("Une erreur est survenue"); }
    finally { setIsLoggingOut(false); }
  };

  const getInitials = () => {
    if (profile?.name) {
      const parts = profile.name.split(" ");
      return parts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join("");
    }
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="EduConnect" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-base hidden sm:block">
            <span className="text-foreground">Edu</span><span className="text-primary">Connect</span>
          </span>
        </div>

        {/* Right: bell + avatar */}
        <div className="flex items-center gap-1">
          {user && (
            <Button variant="ghost" size="icon" className="relative rounded-full w-9 h-9" title="Notifications">
              <Bell className="w-4 h-4" />
              {/* Badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{profile?.name || "Utilisateur"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profil")}>
                  <User className="mr-2 h-4 w-4" />
                  Mon Profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="text-destructive focus:text-destructive">
                  {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")} className="bg-gradient-primary hover:opacity-90 rounded-full text-sm px-4">
              Se connecter
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
