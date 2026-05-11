# Progressive Web App Setup

Last verified: 2026-05-11

This repo uses `vite-plugin-pwa` from the existing Vite build instead of maintaining a hand-written service worker.

## What Is Wired

- `src/app/vite.config.ts` registers `VitePWA` with `registerType: "autoUpdate"`.
- Production web builds emit `manifest.webmanifest`, `sw.js`, and Workbox assets into `dist/app`.
- `src/app/public/` contains the source logo, favicon, Apple touch icon, required manifest PNG icons, and `robots.txt`.
- `src/app/index.html` includes description, theme color, favicon, SVG icon, and Apple touch icon metadata.
- `src/static-assets.ts` serves `.webmanifest` as `application/manifest+json`.

## Scope

The service worker precaches the app shell and static assets only. API data stays network-driven through TanStack Query and the generated API client. Keep `/api/*` out of navigation fallback behavior so API routes never look like browser routes.

Installability also requires HTTPS outside localhost. Keep TLS and HTTP-to-HTTPS redirects at the deployment or reverse-proxy layer; the app-level PWA setup assumes the production origin is already secure.

## When Changing It

1. Keep PWA configuration in `src/app/vite.config.ts`.
2. Put installability assets under `src/app/public/`, which is the Vite public directory because `src/app` is the Vite root.
3. Keep `theme_color` in the manifest aligned with the `<meta name="theme-color">` value in `src/app/index.html`.
4. Regenerate icon files from `src/app/public/logo.svg` only when the source mark changes. The current assets were generated with:

```bash
pnpm dlx @vite-pwa/assets-generator --preset minimal-2023 --root src/app public/logo.svg
```

5. Run `pnpm build` to verify the manifest and service worker are emitted. Use `pnpm preview` for a pseudo-production browser smoke check.
