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

type AuthContextType = {
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  openAuthModal: (message?: string) => void;
  closeAuthModal: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (user) {
      localStorage.setItem("hb_store_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("hb_store_user");
    }
  }, [user]);

  const login = (email: string, name?: string) => {
    setUser({ email, name });
    setIsModalOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  const openAuthModal = (message?: string) => {
    setAuthMessage(message || null);
    setIsModalOpen(true);
    setEmail("");
    setName("");
  };

  const closeAuthModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      login(email, name);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, openAuthModal, closeAuthModal }}>
      {children}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("auth.signIn")}</DialogTitle>
            <DialogDescription>
              {authMessage || t("auth.loginRequired")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-4">
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
                <Label htmlFor="auth-name">{t("auth.name")}</Label>
                <Input
                  id="auth-name"
                  placeholder={t("auth.namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full h-11">
                {t("auth.submit")}
              </Button>
            </div>
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
