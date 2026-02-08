"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  FolderOpen,
  Upload,
  LogOut,
  Mail,
  FileText,
  ChevronRight,
  ChevronLeft,
  Settings,
  X,
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
  { title: "Getting Started", href: "/provider", icon: LayoutDashboard },
  { title: "Upload Files", href: "/provider/files/upload", icon: Upload },
  { title: "My Files", href: "/provider/files", icon: FolderOpen },
  { title: "Shared Studies", href: "/provider/studies", icon: FileText },
  { title: "Invite Patient", href: "/provider/invite", icon: Mail },
];

interface SidebarProps {
  role: "patient" | "provider";
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onMobileClose?: () => void;
}

export function Sidebar({
  role,
  collapsed = false,
  onToggleCollapse,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = role === "patient" ? patientNavItems : providerNavItems;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleNavClick = () => {
    onMobileClose?.();
  };

  return (
    <div className="flex h-full w-full flex-col border-r border-border/50 bg-gradient-to-b from-sidebar to-background">
      {/* Logo */}
      <div className="flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        <Link
          href={`/${role}`}
          className="group min-w-0"
          onClick={handleNavClick}
        >
          {collapsed ? (
            <span className="text-xl font-bold text-primary transition-transform duration-300 group-hover:scale-105 inline-block">
              CM.
            </span>
          ) : (
            <>
              <span className="text-xl font-bold transition-transform duration-300 group-hover:scale-105 inline-block">
                Custodia<span className="text-primary">Med.</span>
              </span>
              <p className="text-[11px] text-muted-foreground capitalize">
                {role} Portal
              </p>
            </>
          )}
        </Link>

        {/* Mobile close button */}
        {onMobileClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 md:hidden"
            onClick={onMobileClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 md:px-3 py-4 md:py-6">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            let isActive = pathname === item.href;
            if (!isActive && item.href !== `/${role}`) {
              const startsWithHref = pathname.startsWith(item.href);
              const hasMoreSpecificMatch = navItems.some(
                (other) =>
                  other.href !== item.href &&
                  pathname.startsWith(other.href) &&
                  other.href.length > item.href.length
              );
              isActive = startsWithHref && !hasMoreSpecificMatch;
            }

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-11 font-medium transition-all duration-200 rounded-lg",
                    collapsed
                      ? "justify-center px-0"
                      : "justify-between gap-3 px-3",
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/15 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center",
                      collapsed ? "justify-center" : "gap-3"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors shrink-0",
                        isActive ? "bg-primary/10" : "bg-transparent"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px] transition-colors",
                          isActive ? "text-primary" : ""
                        )}
                      />
                    </div>
                    {!collapsed && (
                      <span className="text-sm">{item.title}</span>
                    )}
                  </div>
                  {!collapsed && isActive && (
                    <ChevronRight className="h-4 w-4 text-primary animate-fade-in-up" />
                  )}
                </Button>
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>
      </ScrollArea>

      <Separator className="opacity-50" />

      {/* Footer - Settings & Logout */}
      <div className="p-2 md:p-3 space-y-1">
        {collapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/${role}/settings`} onClick={handleNavClick}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-center h-11 px-0 font-medium rounded-lg",
                      pathname === `/${role}/settings`
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Settings className="h-[18px] w-[18px]" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-center h-11 px-0 font-medium rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-[18px] w-[18px]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Log out</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <Link href={`/${role}/settings`} onClick={handleNavClick}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-11 px-3 font-medium rounded-lg",
                  pathname === `/${role}/settings`
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0">
                  <Settings className="h-[18px] w-[18px]" />
                </div>
                <span className="text-sm">Settings</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 px-3 font-medium rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0">
                <LogOut className="h-[18px] w-[18px]" />
              </div>
              <span className="text-sm">Log out</span>
            </Button>
          </>
        )}

        {/* Collapse toggle - desktop only */}
        {onToggleCollapse && (
          <>
            <Separator className="opacity-50" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="w-full justify-center h-8 text-muted-foreground hover:text-foreground rounded-lg"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
