"use client";

import { Logo } from "@/components/ui/Logo";
import { CloseIcon, SettingsIcon, LogoutIcon } from "@/components/ui/icons";
import { NAV_ITEMS } from "./navItems";

/** Menu mobile plein écran (comme la suite S'investir) : logo + croix en haut,
 *  profil, navigation, puis actions de compte en bas. */
export function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col lg:hidden"
      style={{
        backgroundColor: "#000519",
        backgroundImage: "var(--bg-glow), var(--bg-base)",
      }}
    >
      {/* En-tête : logo à gauche, croix à droite */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <Logo />
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={onClose}
          className="text-white/80 transition-colors hover:text-white"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
        {/* Profil */}
        <div className="flex items-center gap-3 pb-5">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white">
            TC
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">Thomas Charreyron</p>
            <p className="truncate text-xs font-light text-accent">
              thomas@quiditdev.com
            </p>
          </div>
        </div>

        <div className="border-t border-white/10" />

        {/* Navigation */}
        <nav className="mt-5 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={onClose}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-3.5 text-sm transition-colors ${
                item.active
                  ? "font-normal text-white"
                  : "font-light text-white/70 hover:text-white"
              }`}
            >
              <span className={item.active ? "text-accent" : "text-white/70"}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Actions de compte en bas */}
        <div className="mt-auto flex flex-col gap-4 pt-6">
          <button
            type="button"
            className="flex items-center justify-center gap-2 text-sm font-light text-white/70 transition-colors hover:text-white"
          >
            <SettingsIcon width={18} height={18} /> Gérer mon compte
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-4 text-sm font-light text-white transition-colors hover:bg-primary-600"
          >
            <LogoutIcon width={18} height={18} /> Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
