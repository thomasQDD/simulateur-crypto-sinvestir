import { SettingsIcon, BulbIcon, LogoutIcon } from "@/components/ui/icons";
import { NAV_ITEMS } from "./navItems";

export function Sidebar() {
  return (
    <div className="flex h-full flex-col bg-white/[0.02] px-4 py-6">
      {/* Profil */}
      <div className="flex items-center gap-3 rounded-2xl px-2 pb-6">
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

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
              item.active
                ? "bg-white/[0.06] font-normal text-white"
                : "font-light text-white/55 hover:bg-white/[0.04] hover:text-white/80"
            }`}
          >
            {item.active && (
              <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-accent" />
            )}
            <span className={item.active ? "text-accent" : "text-white/55"}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bas de sidebar */}
      <div className="mt-auto flex flex-col gap-1 pt-6">
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-light text-white/55 transition-colors hover:text-white/80"
        >
          <SettingsIcon width={18} height={18} /> Gérer mon compte
        </button>
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-light text-white/55 transition-colors hover:text-white/80"
        >
          <BulbIcon width={18} height={18} /> Faire une suggestion
        </button>
        <button
          type="button"
          className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-light text-white transition-colors hover:bg-primary-600"
        >
          <LogoutIcon width={18} height={18} /> Déconnexion
        </button>
      </div>
    </div>
  );
}
