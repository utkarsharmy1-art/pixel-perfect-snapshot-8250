import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Service = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  handled_at_shop: boolean;
  keywords: string;
  sort_order: number;
  active: boolean;
};

export const CATEGORIES = [
  "Government Documentation",
  "Business and Tax Services",
  "Printing and Digital Services",
  "Other Services",
] as const;

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    if (error) throw error;
    return data as Service[];
  },
  staleTime: 60_000,
});

/** Extra plain-language phrases mapped to services for the smart finder. */
const INTENTS: Record<string, string[]> = {
  "domicile-certificate": ["residential", "address proof", "prove my address", "where i live", "residence", "niwas", "rahivasi"],
  "income-certificate": ["income proof", "scholarship", "salary proof", "earning"],
  passport: ["abroad", "foreign", "travel", "visa", "international"],
  "passport-photo": ["photo", "picture", "photograph"],
  "pan-card": ["tax card", "pan number"],
  gst: ["shop registration", "business tax", "gstin"],
  itr: ["tax return", "refund", "file tax"],
  udyam: ["small business", "msme", "startup"],
  "name-change": ["change name", "surname", "after marriage name"],
  "bw-xerox": ["copy", "photocopy", "zerox", "xerox"],
  "colour-printout": ["print", "printout"],
};

export function scoreService(s: Service, query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const hay = `${s.name} ${s.keywords} ${s.category} ${s.description}`.toLowerCase();
  let score = 0;
  if (s.name.toLowerCase().includes(q)) score += 10;
  for (const phrase of INTENTS[s.slug] ?? []) if (q.includes(phrase)) score += 8;
  for (const word of q.split(/\s+/).filter((w) => w.length > 2)) {
    if (s.name.toLowerCase().includes(word)) score += 4;
    else if (hay.includes(word)) score += 2;
  }
  return score;
}

export function findServices(services: Service[], query: string, limit = 6) {
  return services
    .map((s) => ({ s, score: scoreService(s, query) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}
