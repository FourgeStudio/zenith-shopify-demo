# Zenith Shopify — project status

_Last updated: 2026-09-18. Keep this file current at the end of each work session; it is the handoff doc._

## Where things stand
- Theme: Dawn 16.0.0 + custom `zenith-*` sections. Store `tryzenith.ph` (Zenith Philippines).
- GitHub-connected themes: branch `main` → unpublished theme "zenith-shopify/main". **Live theme is still the old one** — nothing published yet.
- Homepage (desktop) built and rendering on the preview theme. Mobile not yet matched to design.
- Brand tokens, colors, fonts, logos: see `.claude/brand.md`.

## Branch flow
`feat|fix|style|chore/*` → PR into `staging` → PR into `main`. Never commit to `main`/`staging`.
Shopify's GitHub app commits theme-editor saves back to `main` (e.g. `Update from Shopify for theme…`), so `git pull` before starting and merge `main` → `staging` after editor sessions.

### Open PRs / unmerged branches
- [ ] `feat/section-style-settings` — size/spacing/mobile settings for every section (pushed, not merged). PR: https://github.com/zenithph/zenith-shopify/compare/staging...feat/section-style-settings
- Merged already: `feat/homepage` (#1), `fix/settings-data-validation` (#2), `style/sticky-header` (#3), `feat/mobile-menu-drawer` (#4).

## Remaining work

### 1. Mobile polish (next task)
- Need from client: mobile design exported **cropped per section at 1x** (full-page export came through unreadable).
- Known deltas from the mobile design: category cards stacked full-width; product carousel ~2 cards per view; results section single row with bigger cards; brand story image above text.
- Most of this is now theme-editor settings (Mobile group on each section), not code.
- Branch: `style/homepage-mobile` off `staging`.

### 2. Content the client must add (theme editor / admin)
- [ ] Theme settings → Logo + Brand image (assets can't be picked in the editor; upload the PNG/SVG files).
- [ ] Favicon, plus black wordmark for light backgrounds, tagline lockups, SVG/2x logos.
- [ ] Hero, results, video, category, brand story, promo images; press logos.
- [ ] Featured product section: select the real product (currently placeholder title only).
- [ ] Promo banners (top + bottom): real countdown end dates.
- [ ] Menus: Content → Menus → Main menu (Skin / Hair / Body / Grooming / Verify Product + Our Story, Certificates, Contact) and Footer menu.
- [ ] Theme settings → Social media links (used by header drawer + footer).
- [ ] Header → Mobile menu: payment logos image, Amare badge image, CTA product/link.
- [ ] Judge.me: install app, then add its widget as a block inside "Zenith · Reviews".

### 3. Not started
- [ ] Product page template (design pending).
- [ ] Collection, cart, search, 404, about, contact pages.
- [ ] Analytics/pixels, SEO metafields, shipping/policy pages.
- [ ] Performance + a11y pass (Lighthouse on preview), then publish `main` theme.

## Known issues / gotchas
- Theme settings **font pickers do nothing**: brand fonts are self-hosted in `assets/zenith-*.woff2` and forced via `assets/zenith-base.css`. Pickers are set to a system font so `settings_data.json` stays valid.
- `settings_data.json` must stay schema-valid or Shopify drops **all color schemes** (editor error "color schemes must be defined…"). Caused once by an invalid font handle + `animations_hover_elements: "none"`.
- The editor writes **every** setting into `templates/*.json`. Never reuse a setting id with a different type; add a new id and strip the stale key from templates.
- `snippets/header-drawer.liquid` (Dawn's) is unused — replaced by `snippets/zenith-header-drawer.liquid`; theme-check reports it as an orphan snippet.
- `gh` CLI not installed; PRs are opened via compare URLs. Pushing needs `GCM_INTERACTIVE=always` in this environment.

## Commands
```bash
npx @shopify/cli@latest theme check          # lint (0 offenses in zenith-* files expected)
npx @shopify/cli@latest theme dev --store tryzenith.ph   # local preview
```
Preview link for the connected theme: Admin → Online Store → Themes → ⋯ → Share preview.
