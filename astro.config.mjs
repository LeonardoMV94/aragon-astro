import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "astro-auto-import";
import { defineConfig } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import config from "./src/config/config.json";
import netlify from '@astrojs/netlify';

import auth from "auth-astro";

// https://astro.build/config
export default defineConfig({
  site: config.site.base_url ? config.site.base_url : "supports-fun-namely-fitted.trycloudflare.com",
  server: {
    allowedHosts: ['myrtle-boots-compact-engaging.trycloudflare.com']
  },
  base: config.site.base_path ? config.site.base_path : "/",
  output: "server",
  adapter: netlify(),
  vite: { plugins: [tailwindcss()] },
  trailingSlash: config.site.trailing_slash ? "always" : "never",
  integrations: [react(), sitemap(), AutoImport({
    imports: [
      "@/shortcodes/Button",
      "@/shortcodes/Accordion",
      "@/shortcodes/Notice",
      "@/shortcodes/Video",
      "@/shortcodes/Youtube",
      "@/shortcodes/Blockquote",
      "@/shortcodes/Badge",
      "@/shortcodes/ContentBlock",
      "@/shortcodes/Changelog",
      "@/shortcodes/Tab",
      "@/shortcodes/Tabs",
    ],
  }), mdx(), auth()],
  markdown: {
    remarkPlugins: [
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
    ],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
    extendDefaultPlugins: true,
  },
  experimental: {
    session: true
  }
});