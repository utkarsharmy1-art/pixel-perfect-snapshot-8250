import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BUSINESS } from "./business";

/** Contact details editable by staff; falls back to built-in values while loading. */
export function useSiteInfo() {
  const { data } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
  const phone = data?.phone ?? BUSINESS.phone;
  const digits = phone.replace(/\D/g, "").slice(-10);
  return {
    phone: digits,
    phoneDisplay: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
    tel: `tel:+91${digits}`,
    email: data?.email ?? BUSINESS.email,
    address: data?.address ?? BUSINESS.address,
    hours: data?.hours ?? BUSINESS.hours,
    announcement: data?.announcement ?? "",
  };
}
