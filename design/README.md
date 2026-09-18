# Design sources

Drop design exports here so any session (any device, any agent) can read them. Images pasted into a chat are **not** saved — only files in this repo survive.

## Naming
`<page>-<breakpoint>-<section>.png` — lowercase, kebab-case.

- `<page>`: `home`, `product`, `collection`, `cart`, `about`, `contact`, `global`
- `<breakpoint>`: `desktop` (1440px wide export) or `mobile` (390–430px wide export)
- `<section>`: the section it shows, e.g. `hero`, `trust-bar`, `promo`, `press`, `results`, `videos`, `guarantee`, `categories`, `featured-product`, `story`, `collection-carousel`, `money-back`, `reviews`, `faq`, `footer`, `nav-drawer`

Examples: `home-mobile-hero.png`, `home-desktop-categories.png`, `global-mobile-nav-drawer.png`

## Rules
- Export at **1x, per section** (2–4 sections per file max). Full-page exports get downscaled and become unreadable.
- Full-page reference is fine as `home-mobile-full.png`, but always add the per-section crops too.
- Brand tokens (colors, fonts, logo rules, voice) live in `.claude/brand.md`, not here.
- Figma links belong in `.claude/brand.md` under "Store"; a link alone is not enough — the connector needs authorizing, so keep the PNGs.
- Shopify's GitHub sync ignores this folder (it only reads theme directories), so nothing here ships to the store.

## Current contents
| File | Shows | Status |
|---|---|---|
| _(none yet)_ | — | Home desktop + mobile designs were only pasted in chat; re-export needed |
