"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileMenu } from "./MobileMenu";

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar flottante (desktop) */}
      <div className="hidden py-6 pl-6 lg:block">
        <div className="sticky top-6 h-[calc(100vh-3rem)]">
          <div
            className={`h-full transition-[width] duration-200 ${
              collapsed ? "w-[88px]" : "w-[252px]"
            }`}
          >
            <Sidebar
              collapsed={collapsed}
              onToggle={() => setCollapsed((v) => !v)}
            />
          </div>
        </div>
      </div>

      {/* Menu plein écran mobile */}
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}

      {/* Contenu */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="flex-1 px-5 py-8 sm:px-8 lg:px-12">{children}</main>
      </div>
    </div>
  );
}
