import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, MessageCircle, Store, Landmark, CalendarCheck } from "lucide-react";
import type { Service } from "@/lib/services";
import { serviceWaMessage, waLink } from "@/lib/business";
import { Button } from "@/components/ui/button";
import { chatStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

export function ServiceCard({ service, defaultOpen = false }: { service: Service; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-gold/60">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex items-start justify-between gap-3 text-left">
        <div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              service.handled_at_shop ? "bg-gold-soft text-navy" : "bg-secondary text-navy",
            )}
          >
            {service.handled_at_shop ? <Store className="h-3 w-3" /> : <Landmark className="h-3 w-3" />}
            {service.handled_at_shop ? "Done at our shop" : "Application assistance"}
          </span>
          <h3 className="mt-2.5 text-base font-semibold text-navy">{service.name}</h3>
        </div>
        <ChevronDown className={cn("mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
      {open && (
        <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm animate-rise">
          <p className="text-muted-foreground">
            {service.handled_at_shop
              ? "Walk in during shop hours — this service is completed at our counter."
              : "We help you prepare documents and submit the application. Processing, verification and approval are done only by the relevant official authority."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => chatStore.openWith(`What documents are generally required for ${service.name}?`)}>
              Ask AI about documents
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/book" search={{ service: service.name }}><CalendarCheck /> Book</Link>
            </Button>
          </div>
        </div>
      )}
      <div className="mt-auto pt-4">
        <Button asChild variant="whatsapp" size="sm" className="w-full">
          <a href={waLink(serviceWaMessage(service.name))} target="_blank" rel="noreferrer">
            <MessageCircle /> Enquire on WhatsApp
          </a>
        </Button>
      </div>
    </article>
  );
}
