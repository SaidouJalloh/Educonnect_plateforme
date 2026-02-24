import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { GraduationCap, Mail, Lock, User, Loader2, Phone, KeyRound } from 'lucide-react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" className="mr-2">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// Detect if value looks like a phone number
const isPhone = (value: string) => /^\+?[\d\s\-()]{6,}$/.test(value) && value.replace(/\D/g, '').length >= 6;
const looksLikePhone = (value: string) => value.startsWith('+') || /^\d/.test(value);

const formatPhone = (value: string) => {
  let formatted = value.replace(/[^\d+]/g, '');
  if (formatted && !formatted.startsWith('+')) formatted = '+' + formatted;
  return formatted;
};

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn, signUp } = useAuthContext();

  const [isLoading, setIsLoading] = useState(false);

  // Unified identifier (email or phone)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup
  const [signupName, setSignupName] = useState('');
  const [signupIdentifier, setSignupIdentifier] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Password reset
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpPhone, setOtpPhone] = useState(''); // phone used for OTP
  const [otpMode, setOtpMode] = useState<'login' | 'signup'>('login');
  const [otpName, setOtpName] = useState('');

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    if (accessToken && type === 'recovery') setShowResetPassword(true);
  }, []);

  useEffect(() => {
    if (!authLoading && user) navigate('/');
  }, [user, authLoading, navigate]);

  // ─── Detect login method ──────────────────────────────────────────────────
  const loginIsPhone = looksLikePhone(loginIdentifier);
  const signupIsPhone = looksLikePhone(signupIdentifier);

  // ─── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier) { toast.error('Veuillez entrer votre email ou numéro'); return; }

    if (loginIsPhone) {
      // Phone OTP flow
      const phone = formatPhone(loginIdentifier);
      if (phone.replace(/\D/g, '').length < 8) { toast.error('Numéro de téléphone invalide'); return; }
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) { toast.error(error.message); }
        else {
          setOtpPhone(phone);
          setOtpMode('login');
          setOtpSent(true);
          toast.success('Code OTP envoyé par SMS!');
        }
      } catch { toast.error('Une erreur est survenue'); }
      finally { setIsLoading(false); }
    } else {
      // Email/password flow
      if (!loginPassword) { toast.error('Veuillez entrer votre mot de passe'); return; }
      setIsLoading(true);
      try {
        const { error } = await signIn(loginIdentifier, loginPassword);
        if (error) {
          toast.error(error.message.includes('Invalid login credentials') ? 'Email ou mot de passe incorrect' : error.message);
        } else {
          toast.success('Connexion réussie!');
          navigate('/');
        }
      } catch { toast.error('Une erreur est survenue'); }
      finally { setIsLoading(false); }
    }
  };

  // ─── Signup ───────────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) { toast.error('Veuillez entrer votre nom'); return; }
    if (!signupIdentifier) { toast.error('Veuillez entrer votre email ou numéro'); return; }

    if (signupIsPhone) {
      // Phone OTP signup
      const phone = formatPhone(signupIdentifier);
      if (phone.replace(/\D/g, '').length < 8) { toast.error('Numéro de téléphone invalide'); return; }
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) { toast.error(error.message); }
        else {
          setOtpPhone(phone);
          setOtpMode('signup');
          setOtpName(signupName.trim());
          setOtpSent(true);
          toast.success('Code OTP envoyé par SMS!');
        }
      } catch { toast.error('Une erreur est survenue'); }
      finally { setIsLoading(false); }
    } else {
      // Email signup
      if (!signupPassword) { toast.error('Veuillez entrer un mot de passe'); return; }
      if (signupPassword.length < 6) { toast.error('Le mot de passe doit contenir au moins 6 caractères'); return; }
      if (signupPassword !== signupConfirmPassword) { toast.error('Les mots de passe ne correspondent pas'); return; }
      setIsLoading(true);
      try {
        const { error } = await signUp(signupIdentifier, signupPassword, signupName.trim());
        if (error) {
          toast.error(error.message.includes('already registered') ? 'Cet email est déjà utilisé' : error.message);
        } else {
          toast.success('Compte créé avec succès!');
          navigate('/');
        }
      } catch { toast.error('Une erreur est survenue'); }
      finally { setIsLoading(false); }
    }
  };

  // ─── OTP Verify ───────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) { toast.error('Veuillez entrer le code reçu'); return; }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ phone: otpPhone, token: otpCode, type: 'sms' });
      if (error) { toast.error(error.message); }
      else {
        if (otpMode === 'signup' && data.user && otpName) {
          await (supabase as any).from('profiles').upsert({
            user_id: data.user.id,
            name: otpName,
            email: data.user.email || null,
          });
        }
        toast.success('Connexion réussie!');
        navigate('/');
      }
    } catch { toast.error('Une erreur est survenue'); }
    finally { setIsLoading(false); }
  };

  // ─── Forgot / Reset password ──────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) { toast.error('Veuillez entrer votre email'); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      if (error) { toast.error(error.message); }
      else { toast.success('Email de récupération envoyé!'); setShowForgotPassword(false); setResetEmail(''); }
    } catch { toast.error('Une erreur est survenue'); }
    finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) { toast.error('Veuillez remplir tous les champs'); return; }
    if (newPassword.length < 6) { toast.error('Le mot de passe doit contenir au moins 6 caractères'); return; }
    if (newPassword !== confirmNewPassword) { toast.error('Les mots de passe ne correspondent pas'); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) { toast.error(error.message); }
      else {
        toast.success('Mot de passe mis à jour!');
        setShowResetPassword(false);
        window.history.replaceState(null, '', window.location.pathname);
        navigate('/');
      }
    } catch { toast.error('Une erreur est survenue'); }
    finally { setIsLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
      if (error) toast.error(error.message);
    } catch { toast.error('Une erreur est survenue'); }
    finally { setIsLoading(false); }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ─── OTP verification screen (shared for login & signup) ─────────────────
  if (otpSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">EduConnect</h1>
          </div>
          <Card className="border-border/50 shadow-xl">
            <form onSubmit={handleVerifyOtp}>
              <CardHeader>
                <CardTitle>Vérification SMS</CardTitle>
                <CardDescription>Code envoyé au <span className="font-medium text-foreground">{otpPhone}</span></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp-code">Code de vérification</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="pl-10 text-center tracking-widest text-lg"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button type="button" variant="link" className="px-0 text-sm" onClick={() => { setOtpSent(false); setOtpCode(''); }}>
                  ← Modifier le numéro / Renvoyer
                </Button>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Vérification...</> : 'Confirmer'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">EduConnect</h1>
          <p className="text-muted-foreground mt-2">Votre assistant pour réussir vos études</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          {showResetPassword ? (
            <form onSubmit={handleResetPassword}>
              <CardHeader>
                <CardTitle>Nouveau mot de passe</CardTitle>
                <CardDescription>Entrez votre nouveau mot de passe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="new-password" type="password" placeholder="Minimum 6 caractères" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10" disabled={isLoading} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">Confirmer</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="confirm-new-password" type="password" placeholder="Confirmez votre mot de passe" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="pl-10" disabled={isLoading} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mise à jour...</> : 'Mettre à jour'}
                </Button>
              </CardFooter>
            </form>
          ) : showForgotPassword ? (
            <form onSubmit={handleForgotPassword}>
              <CardHeader>
                <CardTitle>Récupération de mot de passe</CardTitle>
                <CardDescription>Entrez votre email pour recevoir un lien de réinitialisation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="reset-email" type="email" placeholder="votre@email.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="pl-10" disabled={isLoading} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi...</> : 'Envoyer le lien'}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)} disabled={isLoading}>
                  Retour à la connexion
                </Button>
              </CardFooter>
            </form>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              {/* ── LOGIN TAB ── */}
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardHeader className="pb-2">
                    <CardTitle>Connexion</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-identifier">Email ou numéro de téléphone</Label>
                      <div className="relative">
                        {loginIsPhone
                          ? <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          : <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        }
                        <Input
                          id="login-identifier"
                          type="text"
                          inputMode={loginIsPhone ? 'tel' : 'email'}
                          placeholder="votre@email.com ou +221 77 000 00 00"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                      {loginIsPhone && (
                        <p className="text-xs text-muted-foreground">Format international requis (ex: +221 pour le Sénégal)</p>
                      )}
                    </div>

                    {/* Password only for email */}
                    {!loginIsPhone && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="login-password">Mot de passe</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="pl-10" disabled={isLoading} />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button type="button" variant="link" className="px-0 text-sm text-muted-foreground" onClick={() => setShowForgotPassword(true)}>
                            Mot de passe oublié?
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{loginIsPhone ? 'Envoi du code...' : 'Connexion...'}</>
                        : loginIsPhone ? 'Recevoir le code SMS' : 'Se connecter'
                      }
                    </Button>
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">ou</span></div>
                    </div>
                    <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                      <GoogleIcon /> Continuer avec Google
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              {/* ── SIGNUP TAB ── */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup}>
                  <CardHeader className="pb-2">
                    <CardTitle>Inscription</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nom complet</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="signup-name" type="text" placeholder="Votre nom" value={signupName} onChange={(e) => setSignupName(e.target.value)} className="pl-10" disabled={isLoading} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-identifier">Email ou numéro de téléphone</Label>
                      <div className="relative">
                        {signupIsPhone
                          ? <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          : <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        }
                        <Input
                          id="signup-identifier"
                          type="text"
                          inputMode={signupIsPhone ? 'tel' : 'email'}
                          placeholder="votre@email.com ou +221 77 000 00 00"
                          value={signupIdentifier}
                          onChange={(e) => setSignupIdentifier(e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                      {signupIsPhone && (
                        <p className="text-xs text-muted-foreground">Format international requis (ex: +221 pour le Sénégal)</p>
                      )}
                    </div>

                    {/* Password only for email */}
                    {!signupIsPhone && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Mot de passe</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input id="signup-password" type="password" placeholder="Minimum 6 caractères" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="pl-10" disabled={isLoading} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-confirm-password">Confirmer le mot de passe</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input id="signup-confirm-password" type="password" placeholder="Confirmez votre mot de passe" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} className="pl-10" disabled={isLoading} />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{signupIsPhone ? 'Envoi du code...' : 'Création...'}</>
                        : signupIsPhone ? 'Recevoir le code SMS' : "S'inscrire"
                      }
                    </Button>
                    {!signupIsPhone && (
                      <>
                        <div className="relative w-full">
                          <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
                          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">ou</span></div>
                        </div>
                        <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                          <GoogleIcon /> Continuer avec Google
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          En vous inscrivant, vous acceptez nos conditions d'utilisation
        </p>
      </div>
    </div>
  );
};

export default Auth;
