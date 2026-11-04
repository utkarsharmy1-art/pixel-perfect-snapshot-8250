import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, CircleDashed, Lightbulb, ExternalLink, Printer, MessageCircle, RotateCcw } from "lucide-react";
import { PageHero, seo } from "@/components/site/PageHero";
import { CHECKLISTS, type ChecklistDef } from "@/lib/checklists";
import { Button } from "@/components/ui/button";
import { serviceWaMessage, waLink, BUSINESS } from "@/lib/business";
import { chatStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checklist")({
  head: () =>
    seo(
      "What Documents Do I Need? – Checklist Generator | ALL IN ONE",
      "Get a personalised, printable document checklist for passport, PAN, voter ID, domicile, income certificate, GST, ITR and birth certificate.",
    ),
  component: ChecklistPage,
});

function ChecklistPage() {
  const [def, setDef] = useState<ChecklistDef | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const complete = def && def.questions.every((q) => answers[q.id]);
  const result = complete ? def.build(answers) : null;

  return (
    <>
      <div className="no-print">
        <PageHero eyebrow="Smart checklist" title="What Documents Do I Need?">
          Pick a service, answer a couple of questions and get a checklist you can print or save as PDF.
        </PageHero>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <section className="no-print">
          <h2 className="text-lg font-semibold text-navy">1. Choose a service</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {CHECKLISTS.map((c) => (
              <button
                key={c.id}
                onClick={() => { setDef(c); setAnswers({}); }}
                className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition-colors", def?.id === c.id ? "border-navy bg-navy text-navy-foreground" : "border-border bg-card text-navy hover:border-gold")}
              >
                {c.name}
              </button>
            ))}
            <button onClick={() => chatStore.openWith("I need a document checklist for a service that isn't listed.")} className="rounded-full border border-dashed border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-gold hover:text-navy">
              Other services → Ask AI
            </button>
          </div>

          {def && (
            <div className="mt-10 space-y-6">
              <h2 className="text-lg font-semibold text-navy">2. Tell us a little more</h2>
              {def.questions.map((q) => (
                <fieldset key={q.id} className="rounded-2xl border border-border bg-card p-5">
                  <legend className="px-1 text-sm font-semibold text-navy">{q.label}</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {q.options.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => setAnswers({ ...answers, [q.id]: o.value })}
                        aria-pressed={answers[q.id] === o.value}
                        className={cn("rounded-full border px-4 py-1.5 text-sm transition-colors", answers[q.id] === o.value ? "border-gold bg-gold-soft font-semibold text-navy" : "border-border hover:border-gold")}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          )}
        </section>

        {def && result && (
          <section className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-10 animate-rise">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">ALL IN ONE · Document checklist</p>
                <h2 className="mt-1 text-2xl font-bold text-navy">{def.name}</h2>
              </div>
              <div className="no-print flex gap-2">
                <Button variant="outline" onClick={() => setAnswers({})}><RotateCcw /> Start over</Button>
                <Button onClick={() => window.print()}><Printer /> Print / Save PDF</Button>
              </div>
            </div>

            <List title="Generally required" items={result.required} icon={<CheckCircle2 className="h-5 w-5 text-success" />} />
            {result.conditional.length > 0 && (
              <List title="May be required depending on your situation" items={result.conditional} icon={<CircleDashed className="h-5 w-5 text-gold" />} />
            )}
            <List title="Preparation tips" items={result.tips} icon={<Lightbulb className="h-5 w-5 text-navy" />} />

            <div className="mt-8 rounded-2xl bg-secondary p-5 text-sm">
              <p className="font-semibold text-navy">Official source</p>
              <a href={def.officialUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-semibold text-navy underline">
                {def.officialName} <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <p className="mt-3 text-muted-foreground">
                This is general guidance, not an official list. Accepted documents, fees and timelines are decided by the authority and may change — always confirm on the official portal.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild variant="whatsapp" className="no-print">
                <a href={waLink(serviceWaMessage(def.name))} target="_blank" rel="noreferrer"><MessageCircle /> Get help on WhatsApp</a>
              </Button>
              <Button asChild variant="gold" className="no-print"><Link to="/book" search={{ service: def.name }}>Book appointment</Link></Button>
              <p className="text-sm text-muted-foreground">ALL IN ONE · {BUSINESS.phoneDisplay} · {BUSINESS.addressShort}</p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function List({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h3 className="text-base font-semibold text-navy">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((i) => (
          <li key={i} className="flex gap-3 text-sm">{icon}<span>{i}</span></li>
        ))}
      </ul>
    </div>
  );
}
