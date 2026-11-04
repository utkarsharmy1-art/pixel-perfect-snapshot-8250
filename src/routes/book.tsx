import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Loader2, CheckCircle2, MessageCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { PageHero, seo } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { servicesQuery } from "@/lib/services";
import { TIME_SLOTS, waLink } from "@/lib/business";

export const Route = createFileRoute("/book")({
  validateSearch: z.object({ service: z.string().optional() }),
  head: () =>
    seo("Book an Appointment | ALL IN ONE Mira Road", "Request a time slot at ALL IN ONE, Mira Road East, for documents, government service assistance, tax filing or printing."),
  component: BookPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  service: z.string().min(2, "Please choose a service"),
  date: z.string().min(1, "Please choose a date"),
  time: z.string().min(1, "Please choose a time"),
  message: z.string().max(1000).optional(),
});

function today() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function BookPage() {
  const search = Route.useSearch();
  const { data: services = [] } = useQuery(servicesQuery);
  const [form, setForm] = useState({ name: "", mobile: "", service: search.service ?? "", date: "", time: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    const { data, error } = await supabase.rpc("create_booking", {
      _name: form.name, _mobile: form.mobile, _service: form.service, _date: form.date, _time: form.time, _message: form.message,
    });
    setLoading(false);
    if (error) { toast.error(error.message || "Could not submit. Please try again."); return; }
    setRef(data as string);
  }

  if (ref) {
    const msg = `Hello ALL IN ONE, I have requested an appointment.\nReference: ${ref}\nService: ${form.service}\nDate: ${form.date} at ${form.time}\nName: ${form.name}`;
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
        <h1 className="mt-5 text-3xl font-bold text-navy">Request received</h1>
        <p className="mt-3 text-muted-foreground">Your appointment is <strong>pending confirmation</strong>. Our team will confirm on call or WhatsApp.</p>
        <div className="mx-auto mt-8 max-w-sm rounded-2xl border-2 border-dashed border-gold bg-gold-soft p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Your reference ID</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-wider text-navy">{ref}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => { void navigator.clipboard.writeText(ref); toast.success("Copied"); }}><Copy /> Copy</Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Save this ID with your mobile number to track progress.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="whatsapp"><a href={waLink(msg)} target="_blank" rel="noreferrer"><MessageCircle /> Send on WhatsApp</a></Button>
          <Button asChild variant="outline"><Link to="/track" search={{ ref }}>Track status</Link></Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHero eyebrow="Appointments" title="Book an appointment">Choose a convenient time. We'll confirm before your visit.</PageHero>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <form onSubmit={submit} noValidate className="grid gap-5 rounded-3xl border border-border bg-card p-6 shadow-card sm:grid-cols-2 sm:p-8">
          <Field id="name" label="Customer name" error={errors["name"]}>
            <Input id="name" value={form.name} onChange={set("name")} maxLength={100} autoComplete="name" />
          </Field>
          <Field id="mobile" label="Mobile number" error={errors["mobile"]}>
            <Input id="mobile" value={form.mobile} onChange={set("mobile")} inputMode="numeric" maxLength={10} placeholder="10-digit number" autoComplete="tel-national" />
          </Field>
          <Field id="service" label="Service required" error={errors["service"]} className="sm:col-span-2">
            <select id="service" value={form.service} onChange={set("service")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Select a service</option>
              {form.service && !services.some((s) => s.name === form.service) && <option value={form.service}>{form.service}</option>}
              {services.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              <option value="Other / Not sure">Other / Not sure</option>
            </select>
          </Field>
          <Field id="date" label="Preferred date" error={errors["date"]}>
            <Input id="date" type="date" min={today()} value={form.date} onChange={set("date")} />
          </Field>
          <Field id="time" label="Preferred time" error={errors["time"]}>
            <select id="time" value={form.time} onChange={set("time")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Select a time</option>
              {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field id="message" label="Additional message (optional)" className="sm:col-span-2">
            <Textarea id="message" value={form.message} onChange={set("message")} maxLength={1000} rows={4} placeholder="Please don't include Aadhaar/PAN numbers." />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" variant="gold" size="lg" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="animate-spin" />} Request appointment
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}

function Field({ id, label, error, className, children }: { id: string; label: string; error?: string | undefined; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 block text-navy">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}
