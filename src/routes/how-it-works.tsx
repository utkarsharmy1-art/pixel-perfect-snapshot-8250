import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, ListChecks, CalendarCheck, FileStack, Radar } from "lucide-react";
import { PageHero, seo } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => seo("How It Works | ALL IN ONE Digital Service Centre", "From your first question to collecting your documents — how ALL IN ONE in Mira Road helps you step by step."),
  component: HowPage,
});

const STEPS = [
  { icon: MessageSquare, title: "Ask", text: "Chat with our AI assistant, use the service finder or WhatsApp us to find the right service." },
  { icon: ListChecks, title: "Prepare", text: "Get a personalised document checklist so you bring everything in a single visit." },
  { icon: CalendarCheck, title: "Book", text: "Request a time slot online. We confirm it with you before your visit." },
  { icon: FileStack, title: "We assist", text: "We help fill forms, scan, print and submit applications on the official portals." },
  { icon: Radar, title: "Track", text: "Follow progress with your reference ID until your work is ready for collection." },
];

function HowPage() {
  return (
    <>
      <PageHero eyebrow="How it works" title="Five simple steps, zero confusion" />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <ol className="grid gap-5 md:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="text-xs font-bold text-gold">STEP {i + 1}</span>
              <s.icon className="mt-3 h-7 w-7 text-navy" />
              <h2 className="mt-3 text-lg font-semibold text-navy">{s.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 rounded-2xl bg-secondary p-6 text-sm text-navy">
          <strong>Good to know:</strong> We're a private service centre. For government services we assist with the application; the decision and processing time rest with the official authority.
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="gold"><Link to="/checklist">Build a checklist</Link></Button>
          <Button asChild variant="outline"><Link to="/book">Book appointment</Link></Button>
        </div>
      </section>
    </>
  );
}
