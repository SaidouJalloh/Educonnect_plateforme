import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, MapPin, BookOpen, Edit, Save, Loader2 } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  firstname: string;
  lastname: string;
  email: string;
  location: string;
  niveau: string;
  filiere: string;
  interets: string;
}

const Profile = () => {
  const { user, profile, updateProfile, refreshProfile, loading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // État du formulaire
  const [formData, setFormData] = useState<ProfileData>({
    firstname: "",
    lastname: "",
    email: "",
    location: "",
    niveau: "",
    filiere: "",
    interets: "",
  });

  // Données originales pour détecter les changements
  const [originalData, setOriginalData] = useState<ProfileData>({
    firstname: "",
    lastname: "",
    email: "",
    location: "",
    niveau: "",
    filiere: "",
    interets: "",
  });

  // Charger les données utilisateur existantes depuis le profil backend
  useEffect(() => {
    if (profile) {
      const [firstname, ...lastnameParts] = (profile.name || "").split(" ");
      const data: ProfileData = {
        firstname: firstname || "",
        lastname: lastnameParts.join(" ") || "",
        email: profile.email || user?.email || "",
        location: profile.ville ? `${profile.ville}${profile.pays ? `, ${profile.pays}` : ""}` : "",
        niveau: profile.niveau || "",
        filiere: profile.filiere || "",
        interets: profile.interets?.join(", ") || "",
      };
      setFormData(data);
      setOriginalData(data);
    } else if (user) {
      // Fallback to user email if no profile yet
      setFormData(prev => ({ ...prev, email: user.email || "" }));
      setOriginalData(prev => ({ ...prev, email: user.email || "" }));
    }
  }, [profile, user]);

  // Détecter les changements
  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(changed);
  }, [formData, originalData]);

  // Gérer les changements de champs
  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Annuler les modifications
  const handleCancel = () => {
    setFormData(originalData);
    toast({
      title: "Modifications annulées",
      description: "Les données ont été restaurées.",
    });
  };

  // Sauvegarder le profil
  const handleSave = async () => {
    // Validation basique
    if (!formData.firstname.trim() || !formData.email.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le prénom et l'email sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    // Valider le format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Préparer les données pour l'API
      const [ville, pays] = formData.location.split(",").map(s => s.trim());
      const interetsArray = formData.interets
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const updateData = {
        name: `${formData.firstname} ${formData.lastname}`.trim(),
        email: formData.email,
        niveau: formData.niveau || null,
        filiere: formData.filiere || null,
        pays: pays || null,
        ville: ville || null,
        interets: interetsArray.length > 0 ? interetsArray : null,
      };

      const { error } = await updateProfile(updateData);

      if (error) {
        throw error;
      }

      // Refresh profile data
      await refreshProfile();
      
      setOriginalData(formData);
      setHasChanges(false);

      toast({
        title: "Profil enregistré !",
        description: "Tes informations ont été mises à jour avec succès.",
      });
    } catch (error) {
      console.error("Erreur sauvegarde profil:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppLayout activePanel="profil">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="max-w-3xl mx-auto mb-8">
            <h1 className="text-2xl font-bold mb-1">
              Mon{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">Profil</span>
            </h1>
            <p className="text-sm text-muted-foreground">Gérer tes informations personnelles et préférences</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Profile Picture */}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
                      {formData.firstname ? (
                        <span className="text-2xl font-bold text-primary-foreground">
                          {formData.firstname.charAt(0).toUpperCase()}
                          {formData.lastname.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <User className="w-10 h-10 text-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <CardTitle>
                        {formData.firstname || formData.lastname 
                          ? `${formData.firstname} ${formData.lastname}`.trim()
                          : "Photo de profil"
                        }
                      </CardTitle>
                      <CardDescription>
                        {formData.email || "Personnalise ton profil"}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Personal Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Tes informations de base pour personnaliser ton expérience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstname">Prénom *</Label>
                    <Input 
                      id="firstname" 
                      placeholder="Jean" 
                      className="rounded-xl"
                      value={formData.firstname}
                      onChange={(e) => handleChange("firstname", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Nom</Label>
                    <Input 
                      id="lastname" 
                      placeholder="Dupont" 
                      className="rounded-xl"
                      value={formData.lastname}
                      onChange={(e) => handleChange("lastname", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="jean.dupont@example.com"
                      className="pl-10 rounded-xl"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      disabled // Email comes from auth, shouldn't be editable here
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">L'email est lié à votre compte</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Dakar, Sénégal"
                      className="pl-10 rounded-xl"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Format : Ville, Pays</p>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Parcours académique</CardTitle>
                <CardDescription>
                  Aide EduBot à mieux comprendre ton profil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Niveau d'études</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="level"
                      placeholder="Licence, Master..."
                      className="pl-10 rounded-xl"
                      value={formData.niveau}
                      onChange={(e) => handleChange("niveau", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="field">Domaine d'études</Label>
                  <Input
                    id="field"
                    placeholder="Informatique, Médecine, Commerce..."
                    className="rounded-xl"
                    value={formData.filiere}
                    onChange={(e) => handleChange("filiere", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interests">Centres d'intérêt</Label>
                  <Textarea
                    id="interests"
                    placeholder="Ex: Intelligence artificielle, Entrepreneuriat, Sciences..."
                    className="min-h-[100px] rounded-xl resize-none"
                    value={formData.interets}
                    onChange={(e) => handleChange("interets", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Sépare tes intérêts par des virgules</p>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button 
                variant="outline" 
                className="rounded-xl"
                onClick={handleCancel}
                disabled={!hasChanges || isSaving}
              >
                Annuler
              </Button>
              <Button 
                className="bg-gradient-primary hover:opacity-90 rounded-xl"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>

            {/* Indicateur de changements non sauvegardés */}
            {hasChanges && (
              <p className="text-center text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ Tu as des modifications non sauvegardées
              </p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
