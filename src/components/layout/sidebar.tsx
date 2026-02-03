"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FolderOpen,
  Upload,
  Users,
  Share2,
  Settings,
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
  { title: "Dashboard", href: "/patient", icon: LayoutDashboard },
  { title: "My Files", href: "/patient/files", icon: FolderOpen },
  { title: "Upload", href: "/patient/files/upload", icon: Upload },
  { title: "My Providers", href: "/patient/providers", icon: Users },
  { title: "Shared Files", href: "/patient/shares", icon: Share2 },
];

const providerNavItems: NavItem[] = [
  { title: "Dashboard", href: "/provider", icon: LayoutDashboard },
  { title: "My Patients", href: "/provider/patients", icon: Users },
  { title: "Received Files", href: "/provider/received", icon: FileText },
  { title: "Invitations", href: "/provider/invitations", icon: Mail },
];

interface SidebarProps {
  role: "patient" | "provider";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = role === "patient" ? patientNavItems : providerNavItems;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex h-full w-72 flex-col border-r border-border/50 bg-gradient-to-b from-sidebar to-background">
      {/* Logo */}
      <div className="flex h-20 items-center px-6">
        <Link href="/" className="group">
          <span className="text-2xl font-bold transition-transform duration-300 group-hover:scale-105 inline-block">
            Custodia<span className="text-primary">Med.</span>
          </span>
          <p className="text-xs text-muted-foreground capitalize mt-0.5">{role} Portal</p>
        </Link>
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/${role}` && pathname.startsWith(item.href));

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

      <Separator className="opacity-50" />

      {/* Footer */}
      <div className="p-4 space-y-2">
        <Link href={`/${role}/settings`}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-12 px-4 font-medium",
              pathname === `/${role}/settings`
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg">
              <Settings className="h-5 w-5" />
            </div>
            Settings
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-12 px-4 font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <LogOut className="h-5 w-5" />
          </div>
          Log out
        </Button>
      </div>
    </div>
  );
}
