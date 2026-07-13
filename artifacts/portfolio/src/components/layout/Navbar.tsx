import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Search, ShoppingBag, Plus } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function Navbar() {
  const [location] = useLocation();
  const { t, language, setLanguage, dir } = useLanguage();

  const isRTL = dir === "rtl";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center transform group-hover:-rotate-6 transition-transform">
            <span className="text-primary-foreground font-serif font-bold text-xl leading-none pt-1">HB</span>
          </div>
          <span className="font-serif font-bold text-2xl tracking-tighter">HB.store</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className={cn(
            "transition-colors hover:text-primary",
            location === "/" ? "text-primary" : "text-muted-foreground"
          )}>
            {t("nav.marketplace")}
          </Link>
          <Link href="/seller" className={cn(
            "transition-colors hover:text-primary",
            location === "/seller" ? "text-primary" : "text-muted-foreground"
          )}>
            {t("nav.sell")}
          </Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Language Switcher */}
          <div className="flex bg-secondary/50 p-1 rounded-full border border-border/50">
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

          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors relative" aria-label="Cart">
              <ShoppingBag className="w-5 h-5" />
              <span className={cn(
                "absolute top-2 w-2 h-2 bg-primary rounded-full",
                isRTL ? "left-2" : "right-2"
              )}></span>
            </button>
            <Link href="/seller" className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors" aria-label="Sell">
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}