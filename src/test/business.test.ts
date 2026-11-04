import { describe, expect, it } from "vitest";
import { waLink } from "@/lib/business";
import { findServices, type Service } from "@/lib/services";

describe("WhatsApp link", () => {
  it("uses wa.me with the 91 country code and an encoded message", () => {
    expect(waLink("Hello ALL IN ONE")).toBe("https://wa.me/918779018806?text=Hello%20ALL%20IN%20ONE");
  });
});

describe("smart service finder", () => {
  const svc = (slug: string, name: string, keywords: string): Service => ({
    id: slug, slug, name, keywords, category: "x", description: "", handled_at_shop: false, sort_order: 0, active: true,
  });
  it("suggests the domicile certificate for a residential address proof query", () => {
    const list = [svc("pan-card", "PAN Card", "pan tax"), svc("domicile-certificate", "Domicile Certificate", "domicile residence")];
    expect(findServices(list, "I need a certificate to prove my residential address")[0]?.slug).toBe("domicile-certificate");
  });
});
