import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive animate-in zoom-in duration-300">
          <AlertCircle className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-display font-bold tracking-tight">
          Page Not Found
        </h1>
        
        <p className="text-muted-foreground text-lg">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link href="/">
          <Button size="lg" className="mt-4 gap-2 btn-primary">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
