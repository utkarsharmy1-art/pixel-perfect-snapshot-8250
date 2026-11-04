import { Link } from "@tanstack/react-router";
import { Menu, X, Phone } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useSiteInfo } from "@/lib/site-settings";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Our Services" },
  { to: "/assistant", label: "AI Assistant" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const info = useSiteInfo();
  return (
    <>
    {info.announcement && (
      <div className="no-print bg-gold px-4 py-2 text-center text-sm font-semibold text-gold-foreground">{info.announcement}</div>
    )}
    <header className="no-print sticky top-0 z-40 border-b border-border/70 glass-light">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-navy data-[status=active]:bg-secondary data-[status=active]:text-navy"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/track">Track</Link>
          </Button>
          <Button asChild variant="gold">
            <Link to="/book">Book Appointment</Link>
          </Button>
        </div>
        <div className="flex items-center gap-1 lg:hidden">
          <Button asChild variant="ghost" size="icon" aria-label="Call us">
            <a href={info.tel}><Phone /></a>
          </Button>
          <Button variant="ghost" size="icon" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-card px-4 pb-5 pt-2 lg:hidden" aria-label="Mobile">
          {[...NAV, { to: "/checklist", label: "Document Checklist" }, { to: "/track", label: "Track Application" }].map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-medium text-navy hover:bg-secondary">
              {n.label}
            </Link>
          ))}
          <Button asChild variant="gold" className="mt-3 w-full">
            <Link to="/book" onClick={() => setOpen(false)}>Book Appointment</Link>
          </Button>
        </nav>
      )}
    </header>
    </>
  );
}
