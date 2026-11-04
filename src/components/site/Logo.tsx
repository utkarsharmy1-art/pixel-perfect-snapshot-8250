import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-10 w-10", className)} aria-hidden="true">
      <rect width="40" height="40" rx="11" className="fill-navy" />
      <rect x="9" y="8" width="16" height="21" rx="3" className="fill-navy-foreground" opacity="0.95" />
      <rect x="15" y="12" width="16" height="21" rx="3" className="fill-gold" />
      <path d="M19 22.5l3 3 5.5-6" fill="none" className="stroke-navy" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="ALL IN ONE home">
      <LogoMark />
      <span className="leading-none">
        <span className={cn("block font-display text-lg font-bold tracking-tight", inverted ? "text-navy-foreground" : "text-navy")}>
          ALL <span className="text-gold">IN</span> ONE
        </span>
        <span className={cn("mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em]", inverted ? "text-navy-foreground/60" : "text-muted-foreground")}>
          Digital Service Centre
        </span>
      </span>
    </Link>
  );
}
