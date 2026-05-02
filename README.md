# auth-tenant

Minimal Next.js app that embeds [`@withone/auth`](https://www.npmjs.com/package/@withone/auth)
to verify the package's same-window OAuth-return behavior on a non-`withone.ai`
origin.

This exists to reproduce — and confirm the fix for — the bug where the AuthKit
iframe would re-open after closing it and navigating around (caused by Next.js
App Router caching the `?one_auth_state=...` query param). The fix ships in
`@withone/auth@1.1.9`.

## Setup

```bash
npm install
```

Create `.env.local`:

```
ONE_SECRET_KEY=sk_live_or_test_your_secret
```

> The secret is read by `app/api/one-auth/route.ts` to mint AuthKit tokens.
> `.env.local` is gitignored.

## Run

```bash
npm run dev
# open http://localhost:3000
```

## Repro steps

1. Click **Connect Integration** on the home page.
2. Complete the OAuth flow on the provider (Notion, Slack, Gmail, etc.).
3. Land back on `/`. URL should briefly flash `?one_auth_state=…`, then
   hard-reload to clean.
4. Dismiss the auth iframe.
5. Click **Open Settings** → **← Back home**.
6. ✅ Pass: iframe does NOT re-open. URL stays clean.

## Files

| File | Purpose |
| --- | --- |
| `app/api/one-auth/route.ts` | Token endpoint per the AuthKit setup docs |
| `app/page.tsx` | Connect button + theme detection (`prefers-color-scheme`) |
| `app/settings/page.tsx` | Destination route to test post-OAuth navigation |
| `app/globals.css` | Minimal styling. Note: do NOT set `color-scheme: dark` on `<html>` — it makes browsers paint a dark UA canvas behind transparent iframe content, which obscures the parent. |

## Notes

- Theme: `useSystemTheme()` reads `prefers-color-scheme` and passes
  `appTheme: "dark" | "light"` to `useOneAuth` so the iframe matches.
- Generic / framework-agnostic: nothing here is Next.js-specific beyond the
  API route shape. The same flow works in any tenant app on any framework.
