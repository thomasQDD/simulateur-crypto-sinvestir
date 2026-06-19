import { Logo } from "@/components/ui/Logo";
import { MenuIcon } from "@/components/ui/icons";

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Ouvrir le menu"
          className="text-white/80 lg:hidden"
        >
          <MenuIcon />
        </button>
        <Logo />
      </div>
      <a
        href="https://sinvestir.fr/?utm_source=simulateurs"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-light text-white/80 transition-colors hover:text-white"
      >
        Découvrir S&apos;investir
      </a>
    </header>
  );
}
