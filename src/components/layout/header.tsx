"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Settings, User, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const breadcrumbLabels: Record<string, string> = {
  patient: "Patient Portal",
  provider: "Provider Portal",
  files: "My Files",
  upload: "Upload",
  shares: "Shared Files",
  settings: "Settings",
  studies: "Shared Studies",
  invite: "Invite Patient",
  viewer: "Viewer",
  share: "Share",
  providers: "My Providers",
};

interface HeaderProps {
  user: {
    email: string;
    full_name: string;
    role: "patient" | "provider";
  };
  onMobileMenuToggle: () => void;
}

export function Header({ user, onMobileMenuToggle }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Build breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = breadcrumbLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
    return { label, href };
  });

  // On mobile: show only the current (last) page title
  const currentPage = breadcrumbs[breadcrumbs.length - 1];

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 px-3 md:px-6">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Mobile: hamburger + brand */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0 h-9 w-9"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile brand mark */}
        <Link href={`/${user.role}`} className="md:hidden shrink-0">
          <span className="text-lg font-bold">
            C<span className="text-primary">M.</span>
          </span>
        </Link>

        {/* Mobile: show just current page */}
        {currentPage && (
          <span className="md:hidden text-sm font-medium text-foreground truncate">
            {currentPage.label}
          </span>
        )}

        {/* Desktop: full breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground min-w-0">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1 shrink-0">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
              {i === breadcrumbs.length - 1 ? (
                <span className="font-medium text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 md:h-10 md:w-10 rounded-full">
              <Avatar className="h-8 w-8 md:h-9 md:w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${user.role}/settings`} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${user.role}/settings`} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
