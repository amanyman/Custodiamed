"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface DashboardShellProps {
  role: "patient" | "provider";
  user: {
    email: string;
    full_name: string;
  };
  children: React.ReactNode;
}

export function DashboardShell({ role, user, children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Desktop sidebar */}
      <div
        className={`hidden md:flex shrink-0 transition-[width] duration-300 ease-in-out ${
          collapsed ? "w-[72px]" : "w-64 lg:w-72"
        }`}
      >
        <Sidebar
          role={role}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 border-r-0" showCloseButton={false}>
          <Sidebar
            role={role}
            collapsed={false}
            onMobileClose={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header
          user={{ ...user, role }}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-auto bg-background p-4 md:p-6">
          <div className="mx-auto max-w-6xl animate-page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
