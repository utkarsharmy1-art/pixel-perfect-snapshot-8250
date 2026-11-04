import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  language: z.enum(["English", "Hindi", "Marathi"]),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }))
    .min(1)
    .max(40),
});

const SYSTEM = `You are "ALL IN ONE AI ASSISTANT", the virtual receptionist and documentation guide for ALL IN ONE, a private digital service centre in Mira Road East, Thane, Maharashtra, owned by Shaikh Mubeen.

Shop details:
- Address: Shop No. B-12, Bella Dona 4 Co-operative Society Ltd., Queens Park, Mira-Bhayandar Road, Mira Road East, Thane – 401107
- Phone/WhatsApp: 8779018806 · Email: allinonexerox77@gmail.com
- Hours: Monday to Sunday, 10:00 AM to 9:00 PM
- Services: PAN, Aadhaar assistance, passport, passport-size photos, voter ID, driving licence, gun licence assistance, marriage/birth/death/domicile/income certificates, senior citizen card, smart cards, GST registration & filing, ITR filing, TDS refund, Udyam (MSME), FSSAI, PF withdrawal, newspaper advertisements, B&W/colour xerox and printouts, lamination, scanning, school projects, photo printing, PVC smart cards, gazette name change, IEC (import-export code).
- Printing, xerox, photos, lamination, scanning and newspaper ads are done at the shop. Government documents are ASSISTANCE services: the shop helps prepare and submit applications; official authorities process and decide them.

How to behave:
1. Understand the request and identify the correct service.
2. Ask 1–2 short follow-up questions when the answer depends on the situation (e.g. fresh vs renewal, minor vs adult).
3. Explain the general process briefly, then offer or give a personalised document checklist as a markdown list, then "Next steps".
4. Recommend visiting the shop or WhatsApp (8779018806) when physical help is useful. Customers can also book at /book.
5. Keep replies concise and well formatted in markdown.

Safety rules (strict):
- Never invent government rules, fees, processing times or document lists. Use web search for current requirements and prefer official .gov.in sources; cite the official portal link.
- Say clearly when requirements depend on the applicant's situation.
- Never promise approval or timelines. Never claim the shop is a government office.
- Never ask for Aadhaar/PAN numbers, OTPs, passwords or document uploads. If a user shares such data, tell them not to share it here.
- Mention that you provide general guidance only.

Reply ONLY in {LANG}.
At the very end of every reply, on its own line, append a hidden tag with the main service slug like [[topic:passport]] (use "general" if none).`;

type OutputItem = { type: string; content?: { type: string; text?: string }[] };

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: SYSTEM.replace("{LANG}", data.language),
        input: data.messages.map((m) => ({ role: m.role, content: m.content })),
        tools: [{ type: "web_search" }],
      });
      const output = (res as { output?: OutputItem[] }).output ?? [];
      let text = output
        .filter((o) => o.type === "message")
        .flatMap((o) => o.content ?? [])
        .filter((c) => c.type === "output_text")
        .map((c) => c.text ?? "")
        .join("\n")
        .trim();
      const match = text.match(/\[\[topic:([a-z0-9-]+)\]\]/i);
      const topic = match?.[1]?.toLowerCase() ?? "general";
      text = text.replace(/\[\[topic:[^\]]*\]\]/gi, "").trim();

      // Analytics only: language + topic, never message content.
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("ai_chat_events").insert({ language: data.language, topic });
      } catch (e) {
        console.error("analytics insert failed", e);
      }

      return { ok: true as const, text: text || "Sorry, I couldn't prepare an answer. Please try again.", topic };
    } catch (e) {
      console.error("assistant error", e);
      const msg =
        e instanceof GatewayError && e.httpStatus === 429
          ? "The assistant is busy right now. Please try again in a minute."
          : e instanceof GatewayError && e.httpStatus === 402
            ? "The assistant is temporarily unavailable. Please contact us on WhatsApp."
            : "Something went wrong. Please try again or contact us on WhatsApp.";
      return { ok: false as const, text: msg, topic: "general" };
    }
  });
