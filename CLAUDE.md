# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Site for Constructora Aragón Limitada (aragonltda.cl), built on the Pinwheel Astro/Tailwind SaaS theme boilerplate, heavily customized. Deployed on Netlify (server output, Netlify adapter).

## Commands

Package manager is pnpm (see `packageManager` in package.json).

- `pnpm dev` — `astro dev --host --remote` (local dev server, remote DB binding)
- `pnpm build` — `astro build --remote`
- `pnpm preview` — `astro preview`
- `pnpm check` — `astro check` (type/content-schema checking)
- `pnpm format` — `prettier -w .`
- `pnpm deploy:dev` — `netlify dev`
- `pnpm deploy:prod` — `netlify deploy --prod`

No test runner is configured in this repo.

## Architecture

- **Astro 5, server output** (`astro.config.ts`), `@astrojs/netlify` adapter, Tailwind v4 via `@tailwindcss/vite`, React integration for interactive islands, MDX, `astro-db` (libSQL/Turso), `auth-astro` for auth.
- **Content collections** (`src/content.config.ts`): each page type (`homepage`, `about`, `blog`, `features`, `how-it-works`, `contact`, `careers`, `integrations`, `pricing`, `pages`) has a zod schema. Collections with a `glob` loader read `.md`/`.mdx` files from `src/content/<name>/`; singleton collections (`how-it-works`, `contact`, `pricing`, `pages`) have no loader and expect content defined inline/elsewhere. Several content directories referenced by the schema (`blog`, `careers`, `integrations`, `pricing`) currently have no files on disk — those collections will resolve empty until content is added back.
- **Site-wide config lives in JSON under `src/config/`**, not environment variables: `config.json` (site title, URLs, metadata, contact params), `menu.json` (nav), `theme.json`, `social.json`, plus business-specific data files (`proyectos.json`, `servicios.json`, `clientes.json`, `proveedores.json`, `equipo.json`). Pages pull from these JSON files rather than hardcoding copy.
- **Shortcodes** (`src/layouts/shortcodes/*.jsx`) are auto-imported into MDX via the `AutoImport` integration configured in `astro.config.ts` — no manual import needed when authoring MDX content.
- **`src/layouts/components/`** holds Astro components grouped by page section/feature (`about/`, `blog/`, `career/`, `features/`); **`src/layouts/function-components/`** holds React (`.jsx`) components used as islands; **`src/layouts/partials/`** holds shared page fragments (e.g. `Cta.astro`).
- **`src/lib/`**: `contentParser.astro` / `taxonomyParser.astro` centralize how content-collection entries and taxonomies (categories/tags) are read across pages; `utils/` has date formatting, reading-time calculation, similarity/sort helpers, and markdown-to-HTML conversion. Reuse these instead of re-deriving the same logic in a page.
- **Auth**: Google OAuth via `auth-astro`/`@auth/core`, configured in `auth.config.ts` at the repo root. Sign-in is gated by an allowlist of emails from the `ALLOWED_EMAILS` env var (comma-separated); only those emails pass the `signIn` callback. Protected admin UI lives under `src/pages/_admin/` using `src/layouts/Dashboard.astro`.
- **API routes** under `src/pages/api/functions/*.ts` (`contacto.ts`, `leykarin.ts`, `compliance.ts`) are Astro `APIRoute` POST handlers that: validate form input with `zod`, optionally persist to a Turso/libSQL database (client created inline per-route from `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN`, separate from the shared client in `src/turso.ts`), and send notification email via `Resend` (`RESEND_API_KEY`, `EMAIL_TARGET`, `EMAIL_FROM`). DB and email failures are logged but don't necessarily fail the request — check each route's error-handling order before changing behavior.
- `db/config.ts` defines the `astro:db` schema (currently empty `tables: {}`); actual form data persistence goes through the separate raw Turso client, not `astro:db` tables.
- Pages prefixed with `_` (e.g. `src/pages/_signin.astro`, `src/pages/_ley-karin2.astro`) are intentionally excluded from routing/build by Astro's underscore convention — treat them as drafts/unused, not live routes.
- `src/pages/sitemap.xml.ts` is a hand-written sitemap endpoint (the `@astrojs/sitemap` integration is commented out in `astro.config.ts`).
