import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./language-context";
import { useSignup, useLogin, useUpdateUser } from "@workspace/api-client-react";
import { fileToResizedBase64 } from "./image-utils";
import { Camera } from "lucide-react";

export type Role = "user" | "admin" | "super_admin";

export type User = {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  role: Role;
};

type AuthMode = "login" | "signup";

type AuthContextType = {
  user: User | null;
  logout: () => void;
  openAuthModal: (message?: string, mode?: AuthMode) => void;
  closeAuthModal: () => void;
  openProfileModal: () => void;
  updateProfile: (data: { name?: string; avatarUrl?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function extractApiError(err: unknown): string | null {
  if (err && typeof err === "object" && "error" in err && typeof (err as { error?: unknown }).error === "string") {
    return (err as { error: string }).error;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("hb_store_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState<string | undefined>(undefined);
  const [profileError, setProfileError] = useState<string | null>(null);

  const signupMutation = useSignup();
  const loginMutation = useLogin();
  const updateUserMutation = useUpdateUser();

  useEffect(() => {
    if (user) {
      localStorage.setItem("hb_store_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("hb_store_user");
    }
  }, [user]);

  const logout = () => {
    setUser(null);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setAvatarUrl(undefined);
    setError(null);
  };

  const openAuthModal = (message?: string, initialMode: AuthMode = "login") => {
    setAuthMessage(message || null);
    setMode(initialMode);
    resetForm();
    setIsModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsModalOpen(false);
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
  };

  const openProfileModal = () => {
    if (!user) return;
    setProfileName(user.name || "");
    setProfileAvatar(user.avatarUrl || undefined);
    setProfileError(null);
    setIsProfileOpen(true);
  };

  const updateProfile = async (data: { name?: string; avatarUrl?: string }) => {
    if (!user) return;
    const updated = await updateUserMutation.mutateAsync({ email: user.email, data });
    setUser({ ...user, name: updated.name, avatarUrl: updated.avatarUrl });
  };

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>, target: "signup" | "profile") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const base64 = await fileToResizedBase64(file, 400, 0.85);
      if (target === "signup") setAvatarUrl(base64);
      else setProfileAvatar(base64);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    try {
      await updateProfile({ name: profileName.trim() || undefined, avatarUrl: profileAvatar });
      setIsProfileOpen(false);
    } catch (err) {
      setProfileError(extractApiError(err) || t("auth.error.invalidCredentials"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError(t("auth.error.invalidEmail"));
      return;
    }
    if (!password || password.length < 6) {
      setError(t("auth.error.passwordShort"));
      return;
    }

    try {
      if (mode === "signup") {
        const result = await signupMutation.mutateAsync({
          data: { email: normalizedEmail, password, name: name.trim() || undefined, avatarUrl },
        });
        setUser(result);
      } else {
        const result = await loginMutation.mutateAsync({ data: { email: normalizedEmail, password } });
        setUser(result);
      }
      setIsModalOpen(false);
    } catch (err) {
      const apiMessage = extractApiError(err);
      if (mode === "signup") {
        setError(apiMessage || t("auth.error.emailExists"));
      } else {
        setError(apiMessage || t("auth.error.invalidCredentials"));
      }
    }
  };

  const isSubmitting = signupMutation.isPending || loginMutation.isPending;

  return (
    <AuthContext.Provider value={{ user, logout, openAuthModal, closeAuthModal, openProfileModal, updateProfile }}>
      {children}
      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{mode === "signup" ? t("auth.signUp") : t("auth.signIn")}</DialogTitle>
            <DialogDescription>
              {authMessage || t("auth.loginRequired")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex rounded-full bg-secondary/50 p-1 border border-border/50">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                mode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("auth.login")}
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                mode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("auth.signUp")}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-4">
              {mode === "signup" && (
                <div className="flex items-center gap-4">
                  <label className="relative w-16 h-16 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center overflow-hidden cursor-pointer shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-muted-foreground" />
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarPick(e, "signup")} />
                  </label>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="auth-name">{t("auth.name")}</Label>
                    <Input
                      id="auth-name"
                      placeholder={t("auth.namePlaceholder")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="auth-email">{t("auth.email")}</Label>
                <Input
                  id="auth-email"
                  type="email"
                  required
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-left"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-password">{t("auth.password")}</Label>
                <Input
                  id="auth-password"
                  type="password"
                  required
                  placeholder={t("auth.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-left"
                  dir="ltr"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full h-11" disabled={isSubmitting || isUploadingAvatar}>
                {isSubmitting ? t("auth.submitting") : mode === "signup" ? t("auth.signUp") : t("auth.submit")}
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <>
                  {t("auth.noAccount")}{" "}
                  <button type="button" onClick={() => switchMode("signup")} className="text-foreground font-medium hover:underline">
                    {t("auth.signUp")}
                  </button>
                </>
              ) : (
                <>
                  {t("auth.haveAccount")}{" "}
                  <button type="button" onClick={() => switchMode("login")} className="text-foreground font-medium hover:underline">
                    {t("auth.login")}
                  </button>
                </>
              )}
            </p>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t("profile.title")}</DialogTitle>
            <DialogDescription>{t("profile.subtitle")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <label className="relative w-16 h-16 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center overflow-hidden cursor-pointer shrink-0">
                {profileAvatar ? (
                  <img src={profileAvatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-5 h-5 text-muted-foreground" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarPick(e, "profile")} />
              </label>
              <div className="space-y-2 flex-1">
                <Label htmlFor="profile-name">{t("auth.name")}</Label>
                <Input id="profile-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
              </div>
            </div>
            {profileError && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                {profileError}
              </p>
            )}
            <Button type="submit" className="w-full h-11" disabled={updateUserMutation.isPending || isUploadingAvatar}>
              {t("profile.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
