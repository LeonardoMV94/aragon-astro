// src/pages/sitemap.xml.ts
import { type APIRoute } from 'astro';

const site = 'https://aragonltda.cl';

// Define tus rutas estáticas y/o dinámicas
const routes = [
  '/',
  '/sobre-nosotros',
  '/compliance',
  '/ley-karin',
  '/contacto',
  '/galeria',
];

export const GET: APIRoute = async () => {
  const urls = routes
    .map((path) => {
      return `<url>
        <loc>${site}${path}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
  ${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};