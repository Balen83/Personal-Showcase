import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-serif font-bold text-foreground">
          404
        </h1>
        <p className="text-lg text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <div className="pt-4">
          <Link href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
