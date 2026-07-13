import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Toaster } from "@/components/ui/toaster";

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border/40 py-12 mt-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center opacity-50">
              <span className="text-primary-foreground font-serif font-bold text-xs leading-none">K</span>
            </div>
            <span className="font-serif font-bold tracking-tighter opacity-50">KICKS MARKET</span>
          </div>
          <p className="text-sm text-muted-foreground">Premium Sneaker Resale. Authenticity Guaranteed.</p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}