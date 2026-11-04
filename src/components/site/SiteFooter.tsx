import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Logo } from "./Logo";
import { BUSINESS, telLink, waLink } from "@/lib/business";

export function SiteFooter() {
  return (
    <footer className="no-print bg-navy-gradient text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo inverted />
          <p className="mt-4 text-sm text-navy-foreground/70">{BUSINESS.tagline2}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gold">Services</h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/75">
            <li><Link to="/services" className="hover:text-gold">All services</Link></li>
            <li><Link to="/checklist" className="hover:text-gold">Document checklist</Link></li>
            <li><Link to="/assistant" className="hover:text-gold">AI assistant</Link></li>
            <li><Link to="/book" className="hover:text-gold">Book appointment</Link></li>
            <li><Link to="/track" className="hover:text-gold">Track application</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gold">Company</h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/75">
            <li><Link to="/about" className="hover:text-gold">About us</Link></li>
            <li><Link to="/how-it-works" className="hover:text-gold">How it works</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            <li><Link to="/admin" className="hover:text-gold">Staff login</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gold">Visit us</h3>
          <ul className="mt-4 space-y-3 text-sm text-navy-foreground/75">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{BUSINESS.address}</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 text-gold" /><a href={telLink} className="hover:text-gold">{BUSINESS.phoneDisplay}</a></li>
            <li className="flex gap-2"><Mail className="h-4 w-4 text-gold" /><a href={`mailto:${BUSINESS.email}`} className="break-all hover:text-gold">{BUSINESS.email}</a></li>
            <li className="flex gap-2"><Clock className="h-4 w-4 text-gold" />{BUSINESS.hours}</li>
            <li><a href={waLink("Hello ALL IN ONE, I have an enquiry.")} target="_blank" rel="noreferrer" className="font-semibold text-gold hover:underline">Chat on WhatsApp →</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-foreground/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-navy-foreground/55 sm:px-6">
          © {new Date().getFullYear()} ALL IN ONE · Owned by {BUSINESS.owner}. ALL IN ONE is a private service centre and is not affiliated with any government department. Government applications are processed and approved only by the relevant official authorities.
        </p>
      </div>
    </footer>
  );
}
