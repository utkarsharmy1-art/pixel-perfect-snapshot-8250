import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Loader2, LogOut, Trash2, Plus, Save, Phone, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/site/Logo";
import { PROGRESS_STEPS, waLink } from "@/lib/business";
import { CATEGORIES, type Service } from "@/lib/services";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Staff Dashboard | ALL IN ONE" }, { name: "description", content: "ALL IN ONE staff dashboard." }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (!ready) return <Center><Loader2 className="animate-spin" /></Center>;
  if (!session) return <LoginForm />;
  if (isAdmin === null) return <Center><Loader2 className="animate-spin" /></Center>;
  if (!isAdmin)
    return (
      <Center>
        <p className="font-semibold text-navy">This account doesn't have staff access.</p>
        <Button variant="outline" className="mt-4" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </Center>
    );
  return <Dashboard email={session.user.email ?? ""} />;
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-4 text-center">{children}</div>;
}

function LoginForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      if (error) toast.error(error.message);
      else toast.success("Check your email to confirm your account, then sign in.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-gradient px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-card p-8 shadow-soft">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold text-navy">{mode === "in" ? "Staff sign in" : "Create staff account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{mode === "in" ? "Manage bookings, services and enquiries." : "The first account created becomes the shop admin."}</p>
        <div className="mt-6 space-y-4">
          <div><Label htmlFor="em" className="mb-1.5 block">Email</Label><Input id="em" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
          <div><Label htmlFor="pw" className="mb-1.5 block">Password</Label><Input id="pw" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="animate-spin" />}{mode === "in" ? "Sign in" : "Create account"}</Button>
        </div>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 text-sm font-medium text-navy underline">
          {mode === "in" ? "First time? Create the admin account" : "Already have an account? Sign in"}
        </button>
        <Link to="/" className="mt-6 block text-xs text-muted-foreground hover:underline">← Back to website</Link>
      </form>
    </div>
  );
}

type Booking = { id: string; reference: string; customer_name: string; mobile: string; service: string; preferred_date: string; preferred_time: string; message: string | null; booking_status: string; progress_status: string; created_at: string };
type Enquiry = { id: string; name: string; mobile: string; email: string | null; message: string; status: string; created_at: string };

function Dashboard({ email }: { email: string }) {
  const bookings = useQuery({ queryKey: ["admin", "bookings"], queryFn: async () => { const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }); if (error) throw error; return data as Booking[]; } });
  const enquiries = useQuery({ queryKey: ["admin", "enquiries"], queryFn: async () => { const { data, error } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false }); if (error) throw error; return data as Enquiry[]; } });
  const ai = useQuery({ queryKey: ["admin", "ai"], queryFn: async () => { const { data, error } = await supabase.from("ai_chat_events").select("language, topic, created_at").order("created_at", { ascending: false }).limit(1000); if (error) throw error; return data; } });

  const b = bookings.data ?? [];
  const stats = [
    { label: "Total enquiries", value: (enquiries.data?.length ?? 0) + b.length },
    { label: "New bookings (pending)", value: b.filter((x) => x.booking_status === "pending").length },
    { label: "In progress", value: b.filter((x) => x.booking_status === "accepted" && x.progress_status !== "Completed").length },
    { label: "AI replies", value: ai.data?.length ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-secondary/50">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}><LogOut /> Sign out</Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs font-semibold text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-display text-3xl font-bold text-navy">{s.value}</p>
            </div>
          ))}
        </div>
        <Tabs defaultValue="bookings" className="mt-8">
          <TabsList className="flex h-auto flex-wrap justify-start">
            <TabsTrigger value="bookings">Appointments & status</TabsTrigger>
            <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="ai">AI analytics</TabsTrigger>
            <TabsTrigger value="settings">Business info</TabsTrigger>
          </TabsList>
          <TabsContent value="bookings"><BookingsPanel loading={bookings.isLoading} rows={b} /></TabsContent>
          <TabsContent value="enquiries"><EnquiriesPanel loading={enquiries.isLoading} rows={enquiries.data ?? []} /></TabsContent>
          <TabsContent value="services"><ServicesPanel /></TabsContent>
          <TabsContent value="ai"><AiPanel rows={ai.data ?? []} /></TabsContent>
          <TabsContent value="settings"><SettingsPanel /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const sel = "h-9 rounded-md border border-input bg-background px-2 text-sm";

function BookingsPanel({ rows, loading }: { rows: Booking[]; loading: boolean }) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  async function update(id: string, patch: Partial<Booking>) {
    const { error } = await supabase.from("bookings").update(patch).eq("id", id);
    if (error) return void toast.error(error.message);
    toast.success("Updated");
    void qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
  }
  async function remove(id: string) {
    if (!confirm("Delete this booking?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    void qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
  }
  const list = filter === "all" ? rows : rows.filter((r) => r.booking_status === filter);
  if (loading) return <Loader2 className="mt-8 animate-spin" />;
  return (
    <div className="mt-4 space-y-3">
      <select className={sel} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter">
        <option value="all">All</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option><option value="completed">Completed</option>
      </select>
      {!list.length && <Empty text="No appointments yet." />}
      {list.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-gold">{r.reference}</p>
              <p className="font-semibold text-navy">{r.customer_name} · {r.service}</p>
              <p className="text-sm text-muted-foreground">{r.preferred_date} at {r.preferred_time} · {r.mobile}</p>
              {r.message && <p className="mt-1 text-sm">{r.message}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm" variant="ghost"><a href={`tel:+91${r.mobile}`} aria-label="Call"><Phone /></a></Button>
              <Button asChild size="sm" variant="ghost"><a href={waLink(`Hello ${r.customer_name}, this is ALL IN ONE regarding your request ${r.reference} for ${r.service}.`, r.mobile)} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle /></a></Button>
              <select className={sel} value={r.booking_status} onChange={(e) => update(r.id, { booking_status: e.target.value })} aria-label="Booking status">
                <option value="pending">Pending</option><option value="accepted">Accept</option><option value="rejected">Reject</option><option value="completed">Completed</option>
              </select>
              <select className={sel} value={r.progress_status} onChange={(e) => update(r.id, { progress_status: e.target.value })} aria-label="Progress">
                {PROGRESS_STEPS.map((s) => <option key={s}>{s}</option>)}
              </select>
              <Button size="sm" variant="ghost" onClick={() => remove(r.id)} aria-label="Delete"><Trash2 /></Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EnquiriesPanel({ rows, loading }: { rows: Enquiry[]; loading: boolean }) {
  const qc = useQueryClient();
  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
    if (error) return void toast.error(error.message);
    void qc.invalidateQueries({ queryKey: ["admin", "enquiries"] });
  }
  if (loading) return <Loader2 className="mt-8 animate-spin" />;
  if (!rows.length) return <Empty text="No enquiries yet." />;
  return (
    <div className="mt-4 space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex flex-wrap justify-between gap-2">
            <p className="font-semibold text-navy">{r.name} · <a href={`tel:+91${r.mobile}`} className="underline">{r.mobile}</a> {r.email && `· ${r.email}`}</p>
            <select className={sel} value={r.status} onChange={(e) => setStatus(r.id, e.target.value)} aria-label="Status">
              <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
            </select>
          </div>
          <p className="mt-2 text-sm">{r.message}</p>
          <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("en-IN")}</p>
        </div>
      ))}
    </div>
  );
}

function ServicesPanel() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin", "services"], queryFn: async () => { const { data, error } = await supabase.from("services").select("*").order("sort_order"); if (error) throw error; return data as Service[]; } });
  const [draft, setDraft] = useState({ name: "", category: CATEGORIES[0] as string, description: "", handled_at_shop: false });
  const refresh = () => { void qc.invalidateQueries({ queryKey: ["admin", "services"] }); void qc.invalidateQueries({ queryKey: ["services"] }); };

  async function add() {
    if (draft.name.trim().length < 2) return void toast.error("Enter a service name");
    const slug = draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
    const { error } = await supabase.from("services").insert({ ...draft, slug, keywords: draft.name.toLowerCase(), sort_order: 100 });
    if (error) return void toast.error(error.message);
    setDraft({ ...draft, name: "", description: "" });
    toast.success("Service added");
    refresh();
  }
  async function save(s: Service) {
    const { error } = await supabase.from("services").update({ name: s.name, description: s.description, active: s.active, handled_at_shop: s.handled_at_shop, category: s.category }).eq("id", s.id);
    if (error) return void toast.error(error.message);
    toast.success("Saved");
    refresh();
  }
  async function remove(id: string) {
    if (!confirm("Remove this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    refresh();
  }

  if (isLoading) return <Loader2 className="mt-8 animate-spin" />;
  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-3 rounded-2xl border border-gold/50 bg-gold-soft p-4 md:grid-cols-[1fr_1fr_2fr_auto_auto] md:items-end">
        <div><Label className="mb-1 block">Name</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
        <div><Label className="mb-1 block">Category</Label><select className={`${sel} w-full`} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><Label className="mb-1 block">Description</Label><Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.handled_at_shop} onChange={(e) => setDraft({ ...draft, handled_at_shop: e.target.checked })} /> Done at shop</label>
        <Button onClick={add}><Plus /> Add</Button>
      </div>
      {data.map((s) => <ServiceRow key={s.id} service={s} onSave={save} onDelete={remove} />)}
    </div>
  );
}

function ServiceRow({ service, onSave, onDelete }: { service: Service; onSave: (s: Service) => void; onDelete: (id: string) => void }) {
  const [s, setS] = useState(service);
  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-[1fr_2fr_auto] md:items-center">
      <div className="space-y-2">
        <Input value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} aria-label="Name" />
        <select className={`${sel} w-full`} value={s.category} onChange={(e) => setS({ ...s, category: e.target.value })} aria-label="Category">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      <Textarea rows={2} value={s.description} onChange={(e) => setS({ ...s, description: e.target.value })} aria-label="Description" />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={s.active} onChange={(e) => setS({ ...s, active: e.target.checked })} /> Visible</label>
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={s.handled_at_shop} onChange={(e) => setS({ ...s, handled_at_shop: e.target.checked })} /> At shop</label>
        <Button size="sm" onClick={() => onSave(s)}><Save /> Save</Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(s.id)} aria-label="Delete"><Trash2 /></Button>
      </div>
    </div>
  );
}

function AiPanel({ rows }: { rows: { language: string | null; topic: string | null; created_at: string }[] }) {
  if (!rows.length) return <Empty text="No AI conversations yet." />;
  const count = (key: "language" | "topic") => Object.entries(rows.reduce<Record<string, number>>((a, r) => { const k = r[key] ?? "unknown"; a[k] = (a[k] ?? 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]);
  const max = rows.length;
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {(["topic", "language"] as const).map((k) => (
        <div key={k} className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-semibold text-navy">{k === "topic" ? "Most asked services" : "Languages used"}</h3>
          <ul className="mt-4 space-y-2">
            {count(k).slice(0, 10).map(([name, n]) => (
              <li key={name} className="text-sm">
                <div className="flex justify-between"><span className="capitalize">{name.replace(/-/g, " ")}</span><span className="font-semibold">{n}</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-gold" style={{ width: `${(n / max) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="text-xs text-muted-foreground md:col-span-2">For privacy, only the topic and language of each AI reply are recorded — never the conversation text.</p>
    </div>
  );
}

function SettingsPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["site_settings"], queryFn: async () => { const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single(); if (error) throw error; return data; } });
  type F = { phone: string; email: string; address: string; hours: string; announcement: string };
  const [form, setForm] = useState<F | null>(null);
  useEffect(() => { if (data && !form) setForm({ phone: data.phone, email: data.email, address: data.address, hours: data.hours, announcement: data.announcement }); }, [data, form]);
  if (isLoading || !form) return <Loader2 className="mt-8 animate-spin" />;
  async function save() {
    if (!form) return;
    const { error } = await supabase.from("site_settings").update({ ...form, whatsapp: form.phone, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) return void toast.error(error.message);
    toast.success("Saved — the website shows the new details");
    void qc.invalidateQueries({ queryKey: ["site_settings"] });
  }
  return (
    <div className="mt-4 max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
      {(["phone", "email", "hours", "address", "announcement"] as const).map((k) => (
        <div key={k}>
          <Label className="mb-1 block capitalize">{k === "announcement" ? "Website announcement banner (leave empty to hide)" : k === "hours" ? "Business hours" : k}</Label>
          {k === "address" || k === "announcement" ? <Textarea rows={2} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /> : <Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}
        </div>
      ))}
      <Button onClick={save}><Save /> Save</Button>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="mt-4 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">{text}</p>;
}
