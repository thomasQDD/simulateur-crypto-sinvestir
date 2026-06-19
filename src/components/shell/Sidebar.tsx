import {
  SettingsIcon,
  BulbIcon,
  LogoutIcon,
  ChevronLeftIcon,
} from "@/components/ui/icons";
import { NAV_ITEMS } from "./navItems";

const PANEL_BG =
  "radial-gradient(228.26% 65.64% at 100% 2.53%, rgba(255,255,255,0.1) 0%, rgba(16,27,68,0.1) 100%)";

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="relative h-full rounded-[20px] border border-white/10"
      style={{ backgroundImage: PANEL_BG }}
    >
      <div className="flex h-full flex-col px-3 py-6">
        {/* Profil */}
        <div
          className={`flex items-center gap-3 pb-6 ${
            collapsed ? "justify-center" : "px-1"
          }`}
        >
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white">
            TC
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                Thomas Charreyron
              </p>
              <p className="truncate text-xs font-light text-accent">
                thomas@quiditdev.com
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              title={collapsed ? item.label : undefined}
              className={`relative flex items-center gap-3 rounded-xl py-3 text-sm transition-colors ${
                collapsed ? "justify-center px-0" : "px-3"
              } ${
                item.active
                  ? "bg-white/[0.06] font-normal text-white"
                  : "font-light text-white/55 hover:bg-white/[0.04] hover:text-white/80"
              }`}
            >
              {item.active && !collapsed && (
                <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-accent" />
              )}
              <span className={item.active ? "text-accent" : "text-white/55"}>
                {item.icon}
              </span>
              {!collapsed && item.label}
            </button>
          ))}
        </nav>

        {/* Bas de sidebar */}
        <div className="mt-auto flex flex-col gap-1 pt-6">
          <button
            type="button"
            title={collapsed ? "Gérer mon compte" : undefined}
            className={`flex items-center gap-3 rounded-xl py-2.5 text-sm font-light text-white/55 transition-colors hover:text-white/80 ${
              collapsed ? "justify-center px-0" : "px-3"
            }`}
          >
            <SettingsIcon width={18} height={18} />
            {!collapsed && "Gérer mon compte"}
          </button>
          <button
            type="button"
            title={collapsed ? "Faire une suggestion" : undefined}
            className={`flex items-center gap-3 rounded-xl py-2.5 text-sm font-light text-white/55 transition-colors hover:text-white/80 ${
              collapsed ? "justify-center px-0" : "px-3"
            }`}
          >
            <BulbIcon width={18} height={18} />
            {!collapsed && "Faire une suggestion"}
          </button>
          <button
            type="button"
            title={collapsed ? "Déconnexion" : undefined}
            className={`mt-2 flex items-center justify-center gap-2 rounded-full bg-primary text-sm font-light text-white transition-colors hover:bg-primary-600 ${
              collapsed ? "mx-auto h-11 w-11 p-0" : "px-4 py-3"
            }`}
          >
            <LogoutIcon width={18} height={18} />
            {!collapsed && "Déconnexion"}
          </button>
        </div>
      </div>

      {/* Onglet de repli sur le bord droit */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
        className="absolute left-full top-1/2 flex h-16 w-6 -translate-y-1/2 items-center justify-center rounded-r-[14px] border border-l-0 border-white/10 bg-white/[0.06] text-white/70 transition-colors hover:text-white"
        style={{ backgroundImage: PANEL_BG }}
      >
        <ChevronLeftIcon
          width={18}
          height={18}
          className={collapsed ? "rotate-180" : ""}
        />
      </button>
    </div>
  );
}
