import { RootLayout } from "@/components/layout/RootLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <RootLayout>
      <div className="container mx-auto px-6 py-32 flex flex-col items-center justify-center text-center">
        <h1 className="font-serif text-8xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-medium mb-6">Page not found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          The pair you're looking for seems to have sold out or the link is broken.
        </p>
        <Button asChild>
          <Link href="/">Back to Marketplace</Link>
        </Button>
      </div>
    </RootLayout>
  );
}