import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, MessageCircle, ShieldCheck, RotateCcw } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { askAssistant } from "@/lib/ai.functions";
import { chatStore, useChat, type Lang } from "@/lib/chat-store";
import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/business";
import { cn } from "@/lib/utils";

const GREETING: Record<Lang, string> = {
  English: "Namaste! I'm the **ALL IN ONE AI Assistant**. Ask me about passports, PAN, certificates, GST, printing or our shop — I'll guide you step by step.",
  Hindi: "नमस्ते! मैं **ALL IN ONE AI सहायक** हूँ। पासपोर्ट, पैन, प्रमाणपत्र, GST, प्रिंटिंग या हमारी दुकान के बारे में पूछें।",
  Marathi: "नमस्कार! मी **ALL IN ONE AI सहाय्यक** आहे. पासपोर्ट, पॅन, दाखले, GST, प्रिंटिंग किंवा आमच्या दुकानाबद्दल विचारा.",
};

export const SUGGESTIONS = [
  "I want to apply for a new passport.",
  "What documents are required for a PAN card?",
  "How can I apply for a domicile certificate?",
  "Can you help me with GST registration?",
  "Do you provide passport-size photos?",
  "Where is your shop located?",
];

export function ChatAssistant({ compact = false }: { compact?: boolean }) {
  const { messages, language, pending } = useChat();
  const ask = useServerFn(askAssistant);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next = [...chatStore.get().messages, { role: "user" as const, content: q }];
    chatStore.set({ messages: next });
    setInput("");
    setLoading(true);
    try {
      const res = await ask({ data: { language: chatStore.get().language, messages: next.slice(-20) } });
      chatStore.set({ messages: [...next, { role: "assistant", content: res.text }] });
      if (res.ok && res.topic !== "general") setTopic(res.topic);
    } catch {
      chatStore.set({ messages: [...next, { role: "assistant", content: "Sorry, I couldn't connect. Please try again or WhatsApp us." }] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (pending) {
      chatStore.set({ pending: null });
      void send(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  const waMsg = topic
    ? `Hello ALL IN ONE, I want assistance with ${topic.replace(/-/g, " ")}. Please share the details.`
    : "Hello ALL IN ONE, I was chatting with your AI assistant and need help.";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <div className="flex gap-1 rounded-full bg-muted p-1" role="group" aria-label="Language">
          {(["English", "Hindi", "Marathi"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => chatStore.set({ language: l })}
              className={cn("rounded-full px-3 py-1 text-xs font-semibold transition-colors", language === l ? "bg-navy text-navy-foreground" : "text-muted-foreground hover:text-navy")}
              aria-pressed={language === l}
            >
              {l === "English" ? "EN" : l === "Hindi" ? "हिं" : "मरा"}
            </button>
          ))}
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => { chatStore.set({ messages: [] }); setTopic(null); }}>
            <RotateCcw /> New chat
          </Button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <Bubble role="assistant" content={GREETING[language]} />
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {(compact ? SUGGESTIONS.slice(0, 4) : SUGGESTIONS).map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-xs font-medium text-navy transition-colors hover:border-gold hover:bg-gold-soft">
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} content={m.content} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking official guidance…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length > 0 && (
        <div className="border-t border-border px-4 py-2">
          <Button asChild variant="whatsapp" size="sm" className="w-full">
            <a href={waLink(waMsg)} target="_blank" rel="noreferrer"><MessageCircle /> Continue on WhatsApp</a>
          </Button>
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); void send(input); }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <label htmlFor="chat-input" className="sr-only">Your question</label>
        <input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
          placeholder="Ask about any service…"
          className="h-11 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-ring/40"
        />
        <Button type="submit" size="icon" variant="gold" disabled={loading || !input.trim()} aria-label="Send">
          <Send />
        </Button>
      </form>
      <p className="flex items-center gap-1.5 px-4 pb-3 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-success" /> General guidance only. Never share Aadhaar/PAN numbers or OTPs here.
      </p>
    </div>
  );
}

function Bubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const user = role === "user";
  return (
    <div className={cn("flex", user ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          user ? "rounded-br-md bg-navy text-navy-foreground" : "rounded-bl-md border border-border bg-card text-card-foreground shadow-sm",
          "[&_a]:font-semibold [&_a]:underline [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_h3]:mt-2 [&_h3]:font-semibold",
        )}
      >
        <ReactMarkdown components={{ a: (p) => <a {...p} target="_blank" rel="noreferrer" /> }}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
