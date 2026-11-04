import { Bot, MessageCircle, X } from "lucide-react";
import { ChatAssistant } from "./ChatAssistant";
import { chatStore, useChat } from "@/lib/chat-store";
import { waLink } from "@/lib/business";
import { useRouterState } from "@tanstack/react-router";

export function FloatingActions() {
  const { open } = useChat();
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/admin")) return null;
  const onAssistantPage = path === "/assistant";

  return (
    <div className="no-print">
      {open && !onAssistantPage && (
        <div
          role="dialog"
          aria-label="ALL IN ONE AI Assistant"
          className="fixed inset-x-3 bottom-24 z-50 flex h-[70vh] max-h-[620px] flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-soft animate-rise sm:inset-x-auto sm:right-6 sm:w-[400px]"
        >
          <div className="flex items-center justify-between bg-navy-gradient px-4 py-3 text-navy-foreground">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-gold-foreground"><Bot className="h-5 w-5" /></span>
              <div>
                <p className="font-display text-sm font-semibold">ALL IN ONE AI ASSISTANT</p>
                <p className="text-[11px] text-navy-foreground/65">Documentation guide · EN · हिं · मरा</p>
              </div>
            </div>
            <button onClick={() => chatStore.set({ open: false })} aria-label="Close assistant" className="rounded-full p-1.5 hover:bg-navy-foreground/10">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1"><ChatAssistant compact /></div>
        </div>
      )}
      <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:right-6">
        <a
          href={waLink("Hello ALL IN ONE, I have an enquiry. Please share the details.")}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="grid h-13 w-13 place-items-center rounded-full bg-whatsapp p-3.5 text-whatsapp-foreground shadow-soft transition-transform hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
        {!onAssistantPage && (
          <button
            onClick={() => chatStore.set({ open: !open })}
            aria-label={open ? "Close AI assistant" : "Open AI assistant"}
            className="flex items-center gap-2 rounded-full bg-navy py-3 pl-3.5 pr-5 font-semibold text-navy-foreground shadow-soft transition-transform hover:scale-[1.03]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-gold-foreground"><Bot className="h-4.5 w-4.5" /></span>
            <span className="text-sm">{open ? "Close" : "Ask AI"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
