import { createFileRoute } from "@tanstack/react-router";
import { Bot, ShieldCheck, ListChecks, Languages } from "lucide-react";
import { ChatAssistant } from "@/components/site/ChatAssistant";
import { seo } from "@/components/site/PageHero";

export const Route = createFileRoute("/assistant")({
  head: () =>
    seo(
      "AI Documentation Assistant | ALL IN ONE Mira Road",
      "Ask our AI assistant about passport, PAN, domicile certificate, GST and more. Get document checklists and next steps in English, Hindi or Marathi.",
    ),
  component: AssistantPage,
});

function AssistantPage() {
  return (
    <section className="bg-navy-gradient">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:py-16">
        <div className="text-navy-foreground">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold text-gold-foreground"><Bot className="h-7 w-7" /></span>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">ALL IN ONE AI ASSISTANT</h1>
          <p className="mt-4 text-lg text-navy-foreground/75">Your virtual receptionist and documentation guide — available 24×7.</p>
          <ul className="mt-8 space-y-4 text-sm text-navy-foreground/80">
            <li className="flex gap-3"><ListChecks className="h-5 w-5 shrink-0 text-gold" /> Personalised document checklists and clear next steps</li>
            <li className="flex gap-3"><Languages className="h-5 w-5 shrink-0 text-gold" /> Talk in English, हिंदी or मराठी</li>
            <li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-gold" /> Checks official government sources. Never asks for Aadhaar/PAN numbers or OTPs. Conversations aren't saved.</li>
          </ul>
          <p className="mt-8 text-xs text-navy-foreground/55">The assistant gives general guidance only. Requirements can depend on your situation and are decided by the official authorities.</p>
        </div>
        <div className="h-[72vh] min-h-[520px] overflow-hidden rounded-3xl border border-navy-foreground/10 bg-background shadow-soft">
          <ChatAssistant />
        </div>
      </div>
    </section>
  );
}
