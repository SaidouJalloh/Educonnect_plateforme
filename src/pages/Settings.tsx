import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Bell,
  Shield,
  Download,
  Moon,
  Sun,
  Globe,
  Trash2,
  FileDown,
  MessageSquare,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
  Loader2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useChat } from "@/context/ChatContext";
import { useToast } from "@/hooks/use-toast";

// Types pour les paramètres
interface NotificationSettings {
  emailNotifications: boolean;
  chatNotifications: boolean;
  opportunityAlerts: boolean;
  weeklyDigest: boolean;
}

interface PrivacySettings {
  profileVisible: boolean;
  showOnlineStatus: boolean;
  allowDataCollection: boolean;
  shareWithPartners: boolean;
}

type Language = 'fr' | 'en' | 'ar';
type Theme = 'light' | 'dark' | 'system';

const LANGUAGES = [
  { code: 'fr' as Language, label: 'Français', flag: '🇫🇷' },
  { code: 'en' as Language, label: 'English', flag: '🇬🇧' },
  { code: 'ar' as Language, label: 'العربية', flag: '🇸🇦' },
];

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, chatSessions, logout } = useApp();
  const chatContext = useChat();

  // États
  const [isExporting, setIsExporting] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('fr');
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    chatNotifications: true,
    opportunityAlerts: true,
    weeklyDigest: false,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisible: true,
    showOnlineStatus: true,
    allowDataCollection: false,
    shareWithPartners: false,
  });

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('educonnect_theme') as Theme;
    const savedLanguage = localStorage.getItem('educonnect_language') as Language;
    const savedNotifications = localStorage.getItem('educonnect_notifications');
    const savedPrivacy = localStorage.getItem('educonnect_privacy');

    if (savedTheme) setCurrentTheme(savedTheme);
    if (savedLanguage) setCurrentLanguage(savedLanguage);
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
  }, []);

  // Sauvegarder les notifications
  const updateNotification = (key: keyof NotificationSettings, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem('educonnect_notifications', JSON.stringify(updated));
    toast({
      title: "Paramètre mis à jour",
      description: "Tes préférences de notification ont été sauvegardées.",
    });
  };

  // Sauvegarder la confidentialité
  const updatePrivacy = (key: keyof PrivacySettings, value: boolean) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    localStorage.setItem('educonnect_privacy', JSON.stringify(updated));
    toast({
      title: "Paramètre mis à jour",
      description: "Tes préférences de confidentialité ont été sauvegardées.",
    });
  };

  // Changer le thème
  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('educonnect_theme', theme);
    
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }

    toast({
      title: "Thème modifié",
      description: `Le thème ${theme === 'dark' ? 'sombre' : theme === 'light' ? 'clair' : 'système'} a été appliqué.`,
    });
  };

  // Changer la langue
  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('educonnect_language', lang);
    
    const langInfo = LANGUAGES.find(l => l.code === lang);
    toast({
      title: `${langInfo?.flag} Langue changée`,
      description: `La langue a été changée en ${langInfo?.label}.`,
    });
  };

  // Exporter toutes les données
  const handleExportAllData = async () => {
    setIsExporting(true);

    try {
      // Collecter toutes les données
      const exportData = {
        exportedAt: new Date().toISOString(),
        user: currentUser,
        settings: {
          theme: currentTheme,
          language: currentLanguage,
          notifications,
          privacy,
        },
        chatSessions: chatContext?.sessions || chatSessions || [],
      };

      // Créer le fichier JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `educonnect_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi !",
        description: "Toutes tes données ont été exportées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'export.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Exporter uniquement les conversations
  const handleExportChats = () => {
    const sessions = chatContext?.sessions || [];
    
    if (sessions.length === 0) {
      toast({
        title: "Aucune conversation",
        description: "Tu n'as pas encore de conversations à exporter.",
        variant: "destructive",
      });
      return;
    }

    const content = sessions.map(session => {
      const header = `=== ${session.title} ===\nCréée le: ${new Date(session.createdAt).toLocaleString('fr-FR')}\n\n`;
      const messages = session.messages
        .map(m => `[${new Date(m.timestamp).toLocaleTimeString('fr-FR')}] ${m.isUser ? 'Vous' : 'EduBot'}: ${m.text}`)
        .join('\n');
      return header + messages;
    }).join('\n\n' + '='.repeat(50) + '\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `educonnect_conversations_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Conversations exportées",
      description: `${sessions.length} conversation(s) exportée(s) avec succès.`,
    });
  };

  // Supprimer toutes les données
  const handleDeleteAllData = () => {
    // Supprimer du localStorage
    localStorage.removeItem('educonnect_user');
    localStorage.removeItem('educonnect_chat_sessions');
    localStorage.removeItem('educonnect_notifications');
    localStorage.removeItem('educonnect_privacy');
    
    // Déconnecter l'utilisateur
    logout();

    toast({
      title: "Données supprimées",
      description: "Toutes tes données ont été supprimées. Tu vas être redirigé.",
    });

    // Rediriger vers l'accueil
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <AppLayout activePanel="chat">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="max-w-3xl mx-auto mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-3 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            
            <h1 className="text-2xl font-bold mb-1">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Paramètres
              </span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Gère tes préférences et la confidentialité de ton compte
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Apparence */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {currentTheme === 'dark' ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-primary" />
                  )}
                  <div>
                    <CardTitle>Apparence</CardTitle>
                    <CardDescription>Personnalise l'interface</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Thème */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Thème</Label>
                    <p className="text-sm text-muted-foreground">
                      Choisis entre le mode clair, sombre ou système
                    </p>
                  </div>
                  <Select value={currentTheme} onValueChange={(v) => handleThemeChange(v as Theme)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <span className="flex items-center gap-2">
                          <Sun className="w-4 h-4" /> Clair
                        </span>
                      </SelectItem>
                      <SelectItem value="dark">
                        <span className="flex items-center gap-2">
                          <Moon className="w-4 h-4" /> Sombre
                        </span>
                      </SelectItem>
                      <SelectItem value="system">
                        <span className="flex items-center gap-2">
                          ⚙️ Système
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Langue */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base flex items-center gap-2">
                      <Globe className="w-4 h-4" /> Langue
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Langue de l'interface
                    </p>
                  </div>
                  <Select value={currentLanguage} onValueChange={(v) => handleLanguageChange(v as Language)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span className="flex items-center gap-2">
                            {lang.flag} {lang.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Gère tes alertes et rappels</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-base">Notifications par email</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des emails pour les mises à jour importantes
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(v) => updateNotification('emailNotifications', v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-base">Notifications de chat</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertes pour les nouvelles réponses d'EduBot
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.chatNotifications}
                    onCheckedChange={(v) => updateNotification('chatNotifications', v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-base">Alertes opportunités</Label>
                      <p className="text-sm text-muted-foreground">
                        Être notifié des nouvelles bourses et programmes
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.opportunityAlerts}
                    onCheckedChange={(v) => updateNotification('opportunityAlerts', v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-base">Résumé hebdomadaire</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir un récapitulatif chaque semaine
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.weeklyDigest}
                    onCheckedChange={(v) => updateNotification('weeklyDigest', v)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Confidentialité */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle>Confidentialité</CardTitle>
                    <CardDescription>Contrôle tes données personnelles</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-base">Profil visible</Label>
                      <p className="text-sm text-muted-foreground">
                        Permettre aux autres de voir ton profil
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={privacy.profileVisible}
                    onCheckedChange={(v) => updatePrivacy('profileVisible', v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {privacy.showOnlineStatus ? (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div>
                      <Label className="text-base">Statut en ligne</Label>
                      <p className="text-sm text-muted-foreground">
                        Afficher quand tu es connecté
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={privacy.showOnlineStatus}
                    onCheckedChange={(v) => updatePrivacy('showOnlineStatus', v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-base">Collecte de données</Label>
                      <p className="text-sm text-muted-foreground">
                        Autoriser l'analyse pour améliorer le service
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={privacy.allowDataCollection}
                    onCheckedChange={(v) => updatePrivacy('allowDataCollection', v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-base">Partage partenaires</Label>
                      <p className="text-sm text-muted-foreground">
                        Partager avec des universités partenaires
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={privacy.shareWithPartners}
                    onCheckedChange={(v) => updatePrivacy('shareWithPartners', v)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Export des données */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle>Export des données</CardTitle>
                    <CardDescription>Télécharge une copie de tes données</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleExportChats}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Exporter les conversations
                  </Button>
                  
                  <Button
                    className="flex-1 gap-2 bg-gradient-primary hover:opacity-90"
                    onClick={handleExportAllData}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                    Exporter toutes les données
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  L'export inclut ton profil, paramètres et historique de conversations
                </p>
              </CardContent>
            </Card>

            {/* Zone de danger */}
            <Card className="border-destructive/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  <div>
                    <CardTitle className="text-destructive">Zone de danger</CardTitle>
                    <CardDescription>Actions irréversibles</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Supprimer toutes mes données
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer toutes les données ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Toutes tes données seront définitivement supprimées :
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Profil et informations personnelles</li>
                          <li>Historique des conversations</li>
                          <li>Préférences et paramètres</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAllData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Supprimer définitivement
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <p className="text-xs text-muted-foreground mt-3">
                  ⚠️ Cette action supprimera définitivement ton compte et toutes tes données
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
