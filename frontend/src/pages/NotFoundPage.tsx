import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/Button";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-4xl font-bold text-white shadow-card-hover">
        404
      </div>
      <h1 className="mt-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved. Let&apos;s get you back to where lives are being saved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link to="/">
            <Home className="h-4 w-4" aria-hidden />
            Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/login">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Go to Login
          </Link>
        </Button>
      </div>
    </main>
  );
}
