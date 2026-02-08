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
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div
        className={`hidden md:flex transition-[width] duration-300 ease-in-out ${
          collapsed ? "w-[72px]" : "w-72"
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
        <SheetContent side="left" className="w-72 p-0 border-r-0">
          <Sidebar
            role={role}
            collapsed={false}
            onMobileClose={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          user={{ ...user, role }}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-auto bg-background p-6">
          <div className="mx-auto max-w-6xl animate-page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
