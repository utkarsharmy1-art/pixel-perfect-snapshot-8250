import { createFileRoute } from "@tanstack/react-router";

const PATHS = ["/", "/services", "/assistant", "/checklist", "/how-it-works", "/about", "/contact", "/book", "/track"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = new URL(request.url).origin;
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${PATHS.map((p) => `<url><loc>${origin}${p}</loc></url>`).join("")}</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
