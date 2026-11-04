import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { MapPin, Phone, Mail, Clock, MessageCircle, Navigation, User, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHero, seo } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BUSINESS, mapsDirections, mapsEmbed, waLink } from "@/lib/business";
import { supabase } from "@/integrations/supabase/client";
import { useSiteInfo } from "@/lib/site-settings";

export const Route = createFileRoute("/contact")({
  head: () => seo("Contact ALL IN ONE – Queens Park, Mira Road East", "Call, WhatsApp or visit ALL IN ONE at Bella Dona 4, Queens Park, Mira Road East. Open Monday to Sunday, 10 AM to 9 PM."),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email").max(255)]),
  message: z.string().trim().min(5, "Please write a short message").max(2000),
});

function ContactPage() {
  const site = useSiteInfo();
  const [form, setForm] = useState({ name: "", mobile: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = schema.safeParse(form);
    if (!p.success) return setErrors(Object.fromEntries(p.error.issues.map((i) => [String(i.path[0]), i.message])));
    setErrors({});
    setLoading(true);
    const { error } = await supabase.from("enquiries").insert({ name: p.data.name, mobile: p.data.mobile, email: p.data.email || null, message: p.data.message });
    setLoading(false);
    if (error) return void toast.error("Could not send. Please try WhatsApp instead.");
    setSent(true);
  }

  const info = [
    { icon: User, label: "Owner", value: BUSINESS.owner },
    { icon: Phone, label: "Phone / WhatsApp", value: site.phoneDisplay, href: site.tel },
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: MapPin, label: "Address", value: site.address },
    { icon: Clock, label: "Business hours", value: site.hours },
  ];

  return (
    <>
      <PageHero eyebrow="Contact" title="Visit ALL IN ONE">Queens Park, Mira Road East — we're open every day.</PageHero>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl font-bold text-navy">ALL IN ONE</h2>
            <ul className="mt-5 space-y-4">
              {info.map((i) => (
                <li key={i.label} className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-navy"><i.icon className="h-5 w-5" /></span>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">{i.label}</p>
                    {i.href ? <a href={i.href} className="break-all font-medium text-navy hover:underline">{i.value}</a> : <p className="font-medium text-navy">{i.value}</p>}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild><a href={site.tel}><Phone /> Call Now</a></Button>
              <Button asChild variant="whatsapp"><a href={waLink("Hello ALL IN ONE, I have an enquiry.", site.phone)} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp Now</a></Button>
              <Button asChild variant="gold"><a href={mapsDirections} target="_blank" rel="noreferrer"><Navigation /> Get Directions</a></Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border shadow-card">
            <iframe title="Map to ALL IN ONE, Queens Park, Mira Road East" src={mapsEmbed} className="h-80 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
          <h2 className="text-xl font-bold text-navy">Send an enquiry</h2>
          {sent ? (
            <div className="py-16 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <p className="mt-4 font-semibold text-navy">Thank you! We'll get back to you soon.</p>
              <Button variant="outline" className="mt-6" onClick={() => { setSent(false); setForm({ name: "", mobile: "", email: "", message: "" }); }}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-6 space-y-4">
              {([["name", "Name", "text"], ["mobile", "Mobile number", "tel"], ["email", "Email (optional)", "email"]] as const).map(([k, l, t]) => (
                <div key={k}>
                  <Label htmlFor={`c-${k}`} className="mb-1.5 block text-navy">{l}</Label>
                  <Input id={`c-${k}`} type={t} value={form[k]} maxLength={k === "mobile" ? 10 : 255} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                  {errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>}
                </div>
              ))}
              <div>
                <Label htmlFor="c-msg" className="mb-1.5 block text-navy">Message</Label>
                <Textarea id="c-msg" rows={5} maxLength={2000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
              </div>
              <Button type="submit" variant="gold" disabled={loading}>{loading && <Loader2 className="animate-spin" />} Send enquiry</Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
