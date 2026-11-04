import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, Bot, ShieldCheck, Clock, MapPin, FileCheck2, Printer, Landmark, Briefcase,
  Sparkles, ArrowRight, ListChecks, Radar, CalendarCheck, Languages,
} from "lucide-react";
import heroImg from "@/assets/hero-documents.jpg";
import { Button } from "@/components/ui/button";
import { chatStore } from "@/lib/chat-store";
import { BUSINESS } from "@/lib/business";
import { seo } from "@/components/site/PageHero";

const TITLE = "ALL IN ONE – Xerox, PAN, Passport & GST Services in Mira Road";
const DESC =
  "Your one-stop digital service centre in Mira Road East: PAN card, passport assistance, certificates, GST & ITR filing, colour Xerox, printing and passport size photos.";

const LOCAL_BUSINESS = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "ALL IN ONE",
  description: DESC,
  telephone: "+91-8779018806",
  email: BUSINESS.email,
  founder: { "@type": "Person", name: BUSINESS.owner },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Shop No. B-12, Bella Dona 4 Co-operative Society Ltd., Queens Park, Mira-Bhayandar Road",
    addressLocality: "Mira Road East, Thane",
    addressRegion: "Maharashtra",
    postalCode: "401107",
    addressCountry: "IN",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "10:00",
      closes: "21:00",
    },
  ],
};

export const Route = createFileRoute("/")({
  head: () => ({
    ...seo(TITLE, DESC),
    scripts: [{ type: "application/ld+json", children: JSON.stringify(LOCAL_BUSINESS) }],
  }),
  component: Index,
});

const CATEGORY_CARDS = [
  { icon: Landmark, title: "Government Documentation", text: "PAN, passport, voter ID, driving licence, certificates and more — application assistance." },
  { icon: Briefcase, title: "Business & Tax", text: "GST registration & filing, ITR, Udyam (MSME), FSSAI, PF withdrawal and IEC." },
  { icon: Printer, title: "Printing & Digital", text: "B&W and colour Xerox, printouts, lamination, scanning, photos and PVC cards." },
  { icon: FileCheck2, title: "Other Services", text: "Gazette name change, marriage certificate assistance and newspaper notices." },
];

function Index() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-gradient text-navy-foreground">
        <div className="absolute inset-0 grid-pattern opacity-60" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pb-28 lg:pt-20">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-navy-foreground/15 glass px-3.5 py-1.5 text-xs font-semibold text-gold">
              <Sparkles className="h-3.5 w-3.5" /> {BUSINESS.tagline}
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Every Document. Every Service. <span className="text-gold-gradient">One Destination.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-navy-foreground/75">
              Your trusted digital service partner in Mira Road. Get assistance with documentation, government-related applications, printing, certificates and more.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); navigate({ to: "/services", search: { q: q.trim() || undefined } }); }}
              className="mt-8 flex max-w-xl items-center gap-2 rounded-full bg-card p-1.5 shadow-soft"
              role="search"
            >
              <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
              <label htmlFor="hero-search" className="sr-only">Search services</label>
              <input
                id="hero-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder='Try "certificate to prove my address"'
                className="h-11 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Button type="submit" variant="default">Find</Button>
            </form>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link to="/services">Explore Our Services <ArrowRight /></Link>
              </Button>
              <Button variant="glass" size="lg" onClick={() => chatStore.openWith()}>
                <Bot /> Chat With AI Assistant
              </Button>
            </div>

            <ul className="mt-10 grid max-w-xl grid-cols-1 gap-3 text-sm text-navy-foreground/80 sm:grid-cols-3">
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold" /> Open 7 days · 10 AM–9 PM</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> Queens Park, Mira Road E</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" /> Honest, clear guidance</li>
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gold/10 blur-3xl" aria-hidden="true" />
            <img
              src={heroImg}
              alt="Passport, ID card, certificate and printer illustrated as floating digital documents"
              width={1200}
              height={1008}
              className="relative w-full rounded-[2rem] border border-navy-foreground/10 shadow-soft animate-float"
            />
            <div className="absolute -bottom-6 left-4 hidden rounded-2xl glass border border-navy-foreground/15 p-4 sm:block">
              <p className="flex items-center gap-2 text-sm font-semibold"><Languages className="h-4 w-4 text-gold" /> AI help in English, हिंदी, मराठी</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">What we do</p>
            <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">Everything under one roof</h2>
          </div>
          <Button asChild variant="outline"><Link to="/services">View all 33 services <ArrowRight /></Link></Button>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_CARDS.map((c) => (
            <Link key={c.title} to="/services" className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-gold/60">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy text-gold transition-colors group-hover:bg-gold group-hover:text-navy"><c.icon className="h-6 w-6" /></span>
              <h3 className="mt-5 text-lg font-semibold text-navy">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* SIGNATURE FEATURES */}
      <section className="bg-secondary/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Smart tools</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-bold text-navy sm:text-4xl">Save a trip. Know exactly what to bring.</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <Feature icon={Bot} title="AI Documentation Assistant" text="Ask in plain English, Hindi or Marathi. Get the process, a personalised checklist and next steps." to="/assistant" cta="Start chatting" />
            <Feature icon={ListChecks} title="What Documents Do I Need?" text="Answer two quick questions and get a printable checklist with the official portal link." to="/checklist" cta="Build my checklist" />
            <Feature icon={Radar} title="Application Status Tracker" text="Enter your reference ID and mobile number to see where your work stands at our shop." to="/track" cta="Track progress" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-navy-gradient p-10 text-navy-foreground sm:p-14">
          <div className="absolute inset-0 grid-pattern opacity-50" aria-hidden="true" />
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-3xl font-bold">Skip the queue — book a time slot</h2>
              <p className="mt-2 max-w-xl text-navy-foreground/75">Tell us what you need and when. We'll confirm your appointment on call or WhatsApp.</p>
            </div>
            <Button asChild variant="gold" size="lg"><Link to="/book"><CalendarCheck /> Book Appointment</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Feature({ icon: Icon, title, text, to, cta }: { icon: typeof Bot; title: string; text: string; to: "/assistant" | "/checklist" | "/track"; cta: string }) {
  return (
    <div className="flex flex-col rounded-3xl border border-border bg-card p-7 shadow-card">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-gradient text-gold-foreground"><Icon className="h-6 w-6" /></span>
      <h3 className="mt-5 text-xl font-semibold text-navy">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{text}</p>
      <Link to={to} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold">{cta} <ArrowRight className="h-4 w-4" /></Link>
    </div>
  );
}
