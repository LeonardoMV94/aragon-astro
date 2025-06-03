// src/lib/getJsonLd.ts
import config from "@/config/config.json";
import { plainify } from "@/lib/utils/textConverter";

export function getJsonLd(pathname: string, props: Record<string, any>) {
  const { title, meta_title, description, image, canonical } = props;

  const siteUrl = config.site.base_url;
  const cleanDesc = plainify(description ?? config.metadata.meta_description);
  const pageTitle = plainify(meta_title ?? title ?? config.site.title);
  const fullUrl = `${siteUrl}${pathname}`;

  if (pathname === "/") {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: config.site.title,
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      description: cleanDesc,
      // sameAs: config.site.socials,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Viña del Mar",
        addressCountry: "CL",
      },
    };
  }

  if (pathname.includes("contacto")) {
    return {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Formulario de Contacto",
      url: fullUrl,
      mainEntity: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "contacto@tusitio.cl",
        availableLanguage: ["Spanish"],
      },
    };
  }

  if (pathname.includes("compliance")) {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Formulario de Denuncias (Compliance)",
      description: "Canal para reportar irregularidades de forma confidencial.",
      url: fullUrl,
    };
  }

  if (pathname.includes("ley-karin")) {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Formulario de Denuncias Laborales (Ley Karin)",
      description: "Espacio seguro para denuncias relacionadas con acoso laboral.",
      url: fullUrl,
    };
  }

  if (pathname.includes("sobre-nosotros")) {
    return {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "Sobre Nosotros",
      description: "Conoce al equipo y los proyectos adjudicados.",
      url: fullUrl,
      mainEntity: [
        {
          "@type": "Organization",
          name: config.site.title,
          department: [
            {
              "@type": "OrganizationRole",
              name: "Equipo de Ingeniería",
            },
          ],
        },
        {
          "@type": "Project",
          name: "Proyectos Adjudicados",
          description: "Resumen gráfico con montos adjudicados por proyecto.",
        },
      ],
    };
  }

  return null;
}
