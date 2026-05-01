@AGENTS.md

# Pre-commit rule — MANDATORY

Before EVERY commit, run `npm run build` and fix ALL errors before pushing. The site must never go down after a push. Do not commit or push if the build fails.

# Deployment

This site runs on Cloudflare Workers via opennextjs-cloudflare.
- All API routes must have `export const runtime = "nodejs"` (NOT "edge") because they use Node.js `fs`-based data helpers.
- Deploy command: `npm run deploy` (runs opennextjs-cloudflare build + wrangler deploy).
- Custom domain `novamotorsllc.com` is wired via `routes` in `wrangler.jsonc`.
