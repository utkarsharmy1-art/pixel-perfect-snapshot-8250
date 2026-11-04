import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, ShieldCheck, Clock } from "lucide-react";
import { PageHero, seo } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/about")({
  head: () => seo("About Us | ALL IN ONE, Mira Road East", "ALL IN ONE is a customer-focused digital service centre in Mira Road East, owned by Shaikh Mubeen."),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About us" title="Making documentation simple for everyone" />
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5 text-lg leading-relaxed text-foreground/85">
          <p>ALL IN ONE is a customer-focused digital service centre located in Mira Road East. We help individuals, families and businesses with documentation assistance, government-related applications, printing, Xerox, certificates, tax filing and various digital services.</p>
          <p>Our mission is to make everyday documentation and digital services simpler, more accessible and convenient for everyone.</p>
          <Button asChild variant="gold" className="mt-2"><Link to="/contact">Visit our shop</Link></Button>
        </div>
        <aside className="rounded-3xl bg-navy-gradient p-8 text-navy-foreground shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Owner</p>
          <p className="mt-2 font-display text-2xl font-bold">{BUSINESS.owner}</p>
          <ul className="mt-6 space-y-4 text-sm text-navy-foreground/80">
            <li className="flex gap-3"><HeartHandshake className="h-5 w-5 shrink-0 text-gold" /> Personal, patient help with every application</li>
            <li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-gold" /> Honest guidance — no false promises about approvals</li>
            <li className="flex gap-3"><Clock className="h-5 w-5 shrink-0 text-gold" /> {BUSINESS.hours}</li>
          </ul>
        </aside>
      </section>
    </>
  );
}
