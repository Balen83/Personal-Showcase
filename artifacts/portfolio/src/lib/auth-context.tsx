import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./language-context";

export type User = {
  email: string;
  name?: string;
};

type StoredAccount = {
  email: string;
  password: string;
  name?: string;
};

type AuthMode = "login" | "signup";

type AuthContextType = {
  user: User | null;
  logout: () => void;
  openAuthModal: (message?: string, mode?: AuthMode) => void;
  closeAuthModal: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getAccounts(): StoredAccount[] {
  const stored = localStorage.getItem("hb_store_accounts");
  if (!stored) return [];
  try {
    return JSON.parse(stored) || [];
  } catch (e) {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem("hb_store_accounts", JSON.stringify(accounts));
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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
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

    setIsSubmitting(true);

    // Simulate a brief secure check
    setTimeout(() => {
      const accounts = getAccounts();

      if (mode === "signup") {
        const exists = accounts.some((acc) => acc.email === normalizedEmail);
        if (exists) {
          setError(t("auth.error.emailExists"));
          setIsSubmitting(false);
          return;
        }
        const newAccount: StoredAccount = { email: normalizedEmail, password, name: name.trim() || undefined };
        saveAccounts([...accounts, newAccount]);
        setUser({ email: newAccount.email, name: newAccount.name });
        setIsSubmitting(false);
        setIsModalOpen(false);
      } else {
        const match = accounts.find((acc) => acc.email === normalizedEmail && acc.password === password);
        if (!match) {
          setError(t("auth.error.invalidCredentials"));
          setIsSubmitting(false);
          return;
        }
        setUser({ email: match.email, name: match.name });
        setIsSubmitting(false);
        setIsModalOpen(false);
      }
    }, 400);
  };

  return (
    <AuthContext.Provider value={{ user, logout, openAuthModal, closeAuthModal }}>
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
                <div className="space-y-2">
                  <Label htmlFor="auth-name">{t("auth.name")}</Label>
                  <Input
                    id="auth-name"
                    placeholder={t("auth.namePlaceholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
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
              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
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
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
