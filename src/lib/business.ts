export const BUSINESS = {
  name: "ALL IN ONE",
  owner: "Shaikh Mubeen",
  phone: "8779018806",
  phoneDisplay: "+91 87790 18806",
  email: "allinonexerox77@gmail.com",
  address:
    "Shop No. B-12, Bella Dona 4 Co-operative Society Ltd., Queens Park, Mira-Bhayandar Road, Mira Road East, Thane – 401107, Maharashtra, India",
  addressShort: "Shop B-12, Bella Dona 4, Queens Park, Mira Road East",
  hours: "Monday to Sunday, 10:00 AM – 9:00 PM",
  tagline: "Your One-Stop Digital Service Centre",
  tagline2: "Documents, Government Services, Printing & More – Everything Under One Roof.",
};

/** Build a WhatsApp click-to-chat URL (wa.me with country code, no + or spaces). */
export function waLink(message?: string, phone: string = BUSINESS.phone) {
  const digits = phone.replace(/\D/g, "");
  const full = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${full}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function serviceWaMessage(service: string) {
  return `Hello ALL IN ONE, I want assistance with ${service}. Please share the details.`;
}

export const telLink = `tel:+91${BUSINESS.phone}`;
export const mapsQuery = encodeURIComponent(BUSINESS.address);
export const mapsDirections = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;
export const mapsEmbed = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;

export const PROGRESS_STEPS = [
  "Enquiry Received",
  "Documents Pending",
  "Under Preparation",
  "Submitted to Relevant Authority",
  "Awaiting Official Processing",
  "Ready for Collection",
  "Completed",
] as const;

export const TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM",
];
