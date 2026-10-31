import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LogOut,
  Globe,
  Menu,
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navigation() {
  const { user, signOut } = useAuth();
  const [location] = useLocation();

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
            <Link
              href="/published"
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                location === "/published" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Globe className="h-4 w-4" />
              Published Apps
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(18rem,85vw)]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-left">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    F
                  </span>
                  FLEXA
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className="mt-8 grid gap-1">
                <SheetClose asChild>
                  <Link
                    href="/"
                    aria-current={location === "/" ? "page" : undefined}
                    className={`flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent ${
                      location === "/" ? "bg-primary/10 text-primary" : "text-foreground"
                    }`}
                  >
                    Dashboard
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/templates"
                    aria-current={location === "/templates" ? "page" : undefined}
                    className={`flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent ${
                      location === "/templates" ? "bg-primary/10 text-primary" : "text-foreground"
                    }`}
                  >
                    Templates
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/published"
                    aria-current={location === "/published" ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent ${
                      location === "/published" ? "bg-primary/10 text-primary" : "text-foreground"
                    }`}
                  >
                    <Globe className="h-4 w-4" />
                    Published Apps
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
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
