import { Logo } from "@/components/ui/Logo";
import { MenuIcon } from "@/components/ui/icons";

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-8">
      <Logo />
      <div className="flex items-center gap-4">
        <a
          href="https://sinvestir.fr/?utm_source=simulateurs"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden text-sm font-light text-white/80 transition-colors hover:text-white lg:block"
        >
          Découvrir S&apos;investir
        </a>
        <button
          type="button"
          onClick={onMenu}
          aria-label="Ouvrir le menu"
          className="text-white/80 lg:hidden"
        >
          <MenuIcon />
        </button>
      </div>
    </header>
  );
}
