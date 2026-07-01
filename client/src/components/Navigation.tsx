import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { usePublishedApps } from "@/hooks/use-apps";
import {
  LogOut,
  LayoutDashboard,
  Layers,
  Settings,
  User as UserIcon,
  Globe
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const { user, signOut } = useAuth();
  const [location] = useLocation();
  const { data: publishedApps } = usePublishedApps();

  if (!user) return null;

  const initials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              F
            </div>
            FLEXA
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/templates"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/templates" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Templates
            </Link>
            {publishedApps && publishedApps.length > 0 && (
              <Link
                href="/published"
                className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                  location === "/published" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Globe className="h-4 w-4" />
                Published Apps
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.email ?? "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
