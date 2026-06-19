import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  highlight = false,
}: {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[15px] border p-5 sm:p-6 ${
        highlight
          ? "border-primary/40 bg-primary/10"
          : "border-white/10 bg-white/[0.03]"
      } ${className}`}
    >
      {children}
    </div>
  );
}
