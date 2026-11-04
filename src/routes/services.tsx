import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Info } from "lucide-react";
import { z } from "zod";
import { PageHero, seo } from "@/components/site/PageHero";
import { ServiceCard } from "@/components/site/ServiceCard";
import { CATEGORIES, findServices, servicesQuery } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { chatStore } from "@/lib/chat-store";

export const Route = createFileRoute("/services")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () =>
    seo(
      "Our Services – PAN, Passport, GST, ITR & Xerox | ALL IN ONE Mira Road",
      "Browse 30+ services in Mira Road East: government document assistance, GST & ITR filing, colour Xerox, printouts, lamination and passport size photos.",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { q = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/services" });
  const [input, setInput] = useState(q);
  const results = q ? findServices(services, q) : [];

  return (
    <>
      <PageHero eyebrow="Service directory" title="Smart Service Finder">
        Describe what you need in your own words — we'll suggest the right service.
      </PageHero>

      <section className="mx-auto -mt-8 max-w-7xl px-4 sm:px-6">
        <form
          onSubmit={(e) => { e.preventDefault(); navigate({ search: { q: input.trim() || undefined } }); }}
          className="relative flex items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-soft"
          role="search"
        >
          <Search className="ml-3 h-5 w-5 text-muted-foreground" />
          <label htmlFor="svc-search" className="sr-only">Search services</label>
          <input
            id="svc-search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. I need a certificate to prove my residential address"
            className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          {q && <Button type="button" variant="ghost" size="sm" onClick={() => { setInput(""); navigate({ search: {} }); }}>Clear</Button>}
          <Button type="submit">Search</Button>
        </form>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="flex items-start gap-2 rounded-2xl border border-gold/40 bg-gold-soft p-4 text-sm text-navy">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          ALL IN ONE is a private service centre. For government documents we provide application assistance only — approval and processing are done by the official authorities.
        </p>

        {q ? (
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-navy">Suggestions for “{q}”</h2>
            {results.length ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((s, i) => <ServiceCard key={s.id} service={s} defaultOpen={i === 0} />)}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center">
                <p className="font-semibold text-navy">No exact match found.</p>
                <p className="mt-1 text-sm text-muted-foreground">Our AI assistant can understand your situation better.</p>
                <Button className="mt-4" variant="gold" onClick={() => chatStore.openWith(q)}>Ask the AI assistant</Button>
              </div>
            )}
          </section>
        ) : (
          CATEGORIES.map((cat) => {
            const list = services.filter((s) => s.category === cat);
            if (!list.length) return null;
            return (
              <section key={cat} className="mt-12">
                <h2 className="text-2xl font-bold text-navy">{cat}</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((s) => <ServiceCard key={s.id} service={s} />)}
                </div>
              </section>
            );
          })
        )}
      </div>
    </>
  );
}
