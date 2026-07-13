import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Search, ShoppingBag, Plus, LogOut, User as UserIcon } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const [location] = useLocation();
  const { t, language, setLanguage, dir } = useLanguage();
  const { user, openAuthModal, logout } = useAuth();

  const isRTL = dir === "rtl";

  const handleSellClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthModal(t("auth.loginToSell"));
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center transform group-hover:-rotate-6 transition-transform">
            <span className="text-primary-foreground font-serif font-bold text-xl leading-none pt-1">HB</span>
          </div>
          <span className="font-serif font-bold text-2xl tracking-tighter hidden sm:inline-block">HB.store</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className={cn(
            "transition-colors hover:text-primary",
            location === "/" ? "text-primary" : "text-muted-foreground"
          )}>
            {t("nav.marketplace")}
          </Link>
          <Link href="/seller" onClick={handleSellClick} className={cn(
            "transition-colors hover:text-primary",
            location === "/seller" ? "text-primary" : "text-muted-foreground"
          )}>
            {t("nav.sell")}
          </Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Language Switcher */}
          <div className="hidden lg:flex bg-secondary/50 p-1 rounded-full border border-border/50">
            {(["ku", "en", "ar"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-full transition-all duration-200",
                  language === lang 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                {lang === "ku" ? "کوردی" : lang === "en" ? "EN" : "العربية"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-l border-border/50 pl-2 sm:pl-4 ml-0 sm:ml-2">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium leading-none">{user.name || user.email.split('@')[0]}</span>
                  <span className="text-xs text-muted-foreground mt-1">{user.email}</span>
                </div>
                <button 
                  onClick={logout}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" 
                  aria-label={t("auth.signOut")}
                  title={t("auth.signOut")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => openAuthModal()}
                className="text-sm font-medium px-4 h-10 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
              >
                {t("auth.signIn")}
              </button>
            )}

            <Link href="/seller" onClick={handleSellClick} className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0" aria-label="Sell">
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}