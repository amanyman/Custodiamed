"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  FolderOpen,
  Upload,
  Users,
  LogOut,
  Mail,
  FileText,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const patientNavItems: NavItem[] = [
  { title: "Getting Started", href: "/patient", icon: LayoutDashboard },
  { title: "Upload Files", href: "/patient/files/upload", icon: Upload },
  { title: "My Files", href: "/patient/files", icon: FolderOpen },
];

const providerNavItems: NavItem[] = [
  { title: "Dashboard", href: "/provider", icon: LayoutDashboard },
  { title: "My Patients", href: "/provider/patients", icon: Users },
  { title: "Received Files", href: "/provider/received", icon: FileText },
  { title: "Invitations", href: "/provider/invitations", icon: Mail },
];

interface SidebarProps {
  role: "patient" | "provider";
  user?: {
    email: string;
    full_name: string;
  };
}

export function Sidebar({ role, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = role === "patient" ? patientNavItems : providerNavItems;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="flex h-full w-72 flex-col border-r border-border/50 bg-gradient-to-b from-sidebar to-background">
      {/* Logo + Profile */}
      <div className="flex h-20 items-center justify-between px-6">
        <Link href={`/${role}`} className="group">
          <span className="text-2xl font-bold transition-transform duration-300 group-hover:scale-105 inline-block">
            Custodia<span className="text-primary">Med.</span>
          </span>
        </Link>

        {user && (
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
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
        )}
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            // Smart matching: exact match, or starts with (for nested pages like /files/study/[id])
            // but exclude when a more specific nav item matches (upload is under files)
            let isActive = pathname === item.href;
            if (!isActive && item.href !== `/${role}`) {
              const startsWithHref = pathname.startsWith(item.href);
              // Check if another nav item is a more specific match
              const hasMoreSpecificMatch = navItems.some(
                other => other.href !== item.href &&
                         pathname.startsWith(other.href) &&
                         other.href.length > item.href.length
              );
              isActive = startsWithHref && !hasMoreSpecificMatch;
            }

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between gap-3 h-12 px-4 font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/15 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                        isActive
                          ? "bg-primary/10"
                          : "bg-transparent"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-colors",
                          isActive ? "text-primary" : ""
                        )}
                      />
                    </div>
                    {item.title}
                  </div>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-primary animate-fade-in-up" />
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
