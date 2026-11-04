import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Loader2, Check, Info, MessageCircle } from "lucide-react";
import { PageHero, seo } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { PROGRESS_STEPS, waLink } from "@/lib/business";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track")({
  validateSearch: z.object({ ref: z.string().optional() }),
  head: () =>
    seo("Track Your Application | ALL IN ONE Mira Road", "Check the progress of your service request at ALL IN ONE using your reference ID and mobile number."),
  component: TrackPage,
});

type Result = { reference: string; service: string; preferred_date: string; preferred_time: string; booking_status: string; progress_status: string; updated_at: string };

const BOOKING_LABEL: Record<string, string> = {
  pending: "Awaiting shop confirmation",
  accepted: "Confirmed by shop",
  rejected: "Could not be scheduled — please contact us",
  completed: "Visit completed",
};

function TrackPage() {
  const search = Route.useSearch();
  const [refId, setRefId] = useState(search.ref ?? "");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!refId.trim() || !/^[6-9]\d{9}$/.test(mobile.trim())) {
      setError("Enter your reference ID and the 10-digit mobile number used while booking.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc("track_booking", { _reference: refId, _mobile: mobile });
    setLoading(false);
    if (error) return setError("Something went wrong. Please try again.");
    if (!data?.length) return setError("No matching record found. Check your reference ID and mobile number.");
    setResult(data[0] as Result);
  }

  const current = result ? PROGRESS_STEPS.indexOf(result.progress_status as (typeof PROGRESS_STEPS)[number]) : -1;

  return (
    <>
      <PageHero eyebrow="Status tracker" title="Track your application">Enter your booking/reference ID and registered mobile number.</PageHero>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <form onSubmit={submit} className="grid gap-4 rounded-3xl border border-border bg-card p-6 shadow-card sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <Label htmlFor="ref" className="mb-1.5 block text-navy">Reference ID</Label>
            <Input id="ref" value={refId} onChange={(e) => setRefId(e.target.value.toUpperCase())} placeholder="AIO-XXXXXX" maxLength={20} />
          </div>
          <div>
            <Label htmlFor="mob" className="mb-1.5 block text-navy">Mobile number</Label>
            <Input id="mob" value={mobile} onChange={(e) => setMobile(e.target.value)} inputMode="numeric" maxLength={10} />
          </div>
          <Button type="submit" disabled={loading}>{loading && <Loader2 className="animate-spin" />} Track</Button>
        </form>
        {error && <p className="mt-4 rounded-xl bg-destructive/10 p-4 text-sm text-destructive" role="alert">{error}</p>}

        {result && (
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8 animate-rise">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{result.reference}</p>
                <h2 className="mt-1 text-xl font-bold text-navy">{result.service}</h2>
                <p className="text-sm text-muted-foreground">Appointment: {result.preferred_date} · {result.preferred_time}</p>
              </div>
              <span className="h-fit rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-navy">{BOOKING_LABEL[result.booking_status] ?? result.booking_status}</span>
            </div>
            <ol className="mt-8 space-y-0">
              {PROGRESS_STEPS.map((step, i) => {
                const done = i < current || (i === current && step === "Completed");
                const active = i === current;
                return (
                  <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < PROGRESS_STEPS.length - 1 && <span className={cn("absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5", i < current ? "bg-success" : "bg-border")} />}
                    <span className={cn("relative grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold", done ? "border-success bg-success text-navy-foreground" : active ? "border-gold bg-gold text-gold-foreground" : "border-border bg-card text-muted-foreground")}>
                      {done ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <div className="pt-1">
                      <p className={cn("text-sm font-semibold", active ? "text-navy" : done ? "text-foreground" : "text-muted-foreground")}>{step}</p>
                      {active && <p className="text-xs text-muted-foreground">Updated {new Date(result.updated_at).toLocaleString("en-IN")}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
            <Button asChild variant="whatsapp" className="mt-8">
              <a href={waLink(`Hello ALL IN ONE, I'd like an update on reference ${result.reference}.`)} target="_blank" rel="noreferrer"><MessageCircle /> Ask for an update</a>
            </Button>
          </div>
        )}

        <p className="mt-8 flex gap-2 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          This tracks our shop's service progress only. It does not replace official tracking on government portals (e.g. Passport Seva, NSDL, Aaple Sarkar).
        </p>
      </section>
    </>
  );
}
