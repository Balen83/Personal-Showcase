import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Search, ShoppingBag, Plus } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center transform group-hover:-rotate-6 transition-transform">
            <span className="text-primary-foreground font-serif font-bold text-xl leading-none">K</span>
          </div>
          <span className="font-serif font-bold text-2xl tracking-tighter">KICKS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className={cn(
            "transition-colors hover:text-primary",
            location === "/" ? "text-primary" : "text-muted-foreground"
          )}>
            Marketplace
          </Link>
          <Link href="/seller" className={cn(
            "transition-colors hover:text-primary",
            location === "/seller" ? "text-primary" : "text-muted-foreground"
          )}>
            Sell
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors" data-testid="button-search">
            <Search className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors relative" data-testid="button-cart">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          <Link href="/seller" className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors" data-testid="link-sell">
            <Plus className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}