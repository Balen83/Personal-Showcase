import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Toaster } from "@/components/ui/toaster";
import { useLanguage } from "@/lib/language-context";
import { Logo } from "@/components/Logo";

export function RootLayout({ children }: { children: ReactNode }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-[#D4AF37]/15 py-12 mt-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-60">
            <Logo className="w-6 h-6" />
            <span className="font-serif font-bold tracking-tighter">{t("brand.name")}</span>
          </div>
          <p className="text-sm text-muted-foreground">{t("footer.tagline")}</p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
