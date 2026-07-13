import { RootLayout } from "@/components/layout/RootLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <RootLayout>
      <div className="container mx-auto px-6 py-32 flex flex-col items-center justify-center text-center">
        <h1 className="font-serif text-8xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-medium mb-6">{t("404.title")}</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          {t("404.desc")}
        </p>
        <Button asChild>
          <Link href="/">{t("404.back")}</Link>
        </Button>
      </div>
    </RootLayout>
  );
}