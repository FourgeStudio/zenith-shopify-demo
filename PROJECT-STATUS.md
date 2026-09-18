# Zenith Shopify — project status

_Last updated: 2026-09-18. Keep this file current at the end of each work session; it is the handoff doc._

## Where things stand
- Theme: Dawn 16.0.0 + custom `zenith-*` sections. Store `tryzenith.ph` (Zenith Philippines).
- GitHub-connected themes: branch `main` → unpublished theme "zenith-shopify/main". **Live theme is still the old one** — nothing published yet.
- Homepage (desktop + mobile), header, announcement bar, menu drawer and footer rebuilt to the design exports in `design/homepage/` (2026-09-18 design-accuracy pass). Verified against static renders of the CSS, **not yet eyeballed on the real store** → first job next session.
- Contact page (`templates/page.contact.json` → new `zenith-contact` section: contact details + FAQ + contact form) built to `design/contact-us/` (2026-09-18). Same verification caveat.
- Brand tokens, colors, fonts, logos: see `.claude/brand.md`.

## Branch flow (two branches only)
- `staging` — all work is committed here and pushed.
- `main` — production; updated by merging `staging` when a piece of work is done.
- No feature branches unless explicitly asked; delete them after merge.
- Shopify's GitHub app commits theme-editor saves back to the connected branch (`Update from Shopify for theme…`), so `git pull` before starting, and merge `main` → `staging` after editor sessions on `main`.

## Design sources
- `design/homepage/` — desktop + mobile full pages, per-section layer exports, designer notes (`guide*.png`). `design/README.md` maps every file to its section.
- `.claude/brand.md` = colors, fonts, logo rules, voice, plus design-verified UI rules (buttons, gutters, header).

## Shared building blocks (added in the design pass)
- `snippets/zenith-button.liquid` — brand buttons: gold gradient / dark / outline / light / scheme, heading font + arrow/cart icon. Sections expose `button_style` + `button_font_size[_mobile]`.
- `snippets/zenith-add-to-cart.liquid` takes `style` + `icon`.
- `snippets/zenith-countdown.liquid` + `assets/zenith-countdown.css/js` — days/hours/min/sec countdown (hero sale strip, promo banners).
- Theme settings → **Zenith → Customer count** (`settings.customer_count`, default "100,000+"). Write `[customers]` in section copy; headings, captions and FAQ replace it.
- Page frame: Theme settings → Layout → Page width = **1440** (whole frame incl. margins; 20px steps). Side margins: Theme settings → Zenith → **Page side margin** 30 desktop / 20 mobile (client asked for 30 instead of the design's 80). Header → "Align icons with page margin" (on) puts the menu/cart glyphs on that margin. Promo banners use the page frame. Edge-to-edge on purpose (they touch the screen edge in the design): video + collection carousels (track spans both screen edges: first card starts on the page margin, scrolled cards stay visible in the left margin), money-back band (bleeds left), results marquee, press marquee (mobile), hero image, trust bar, header/announcement/footer backgrounds.
- **Global promo**: Theme settings → **Zenith · Promo** holds the promo content + countdown. Every "Zenith · Promo banner" with *Promo content = Global* shows it (edit once → updates everywhere); *This section only* uses the section's own fields. Hero countdown strip can follow the same end date (*Countdown dates = Global*). Styling (colors, sizes, layout) stays per section.
- **Skill `design-to-page`** (`.claude/skills/design-to-page/`) = the repeatable workflow + scripts used for the homepage; use it for every next page.
- Pattern for future shared sections: global content in Theme settings + per-section source select (see zenith-promo-banner). Candidates when product/collection pages are built: trust bar, money-back guarantee, Zenith Guarantee, press logos.
- **Confetti**: `snippets/zenith-confetti.liquid` + `assets/zenith-confetti.png`. Promo banner + hero have *Show gold confetti* (optional custom image, position, desktop width, mobile width %, opacity). Promo on by default (design), hero off (turn on for sale campaigns, per guide2). Upload promo backgrounds WITHOUT baked-in confetti.
- Hero has optional sale extras (ribbon, highlight title, badge, countdown strip with seconds) from `guide2.png` — blank = plain hero.

## Remaining work

### 1. Verify on the store (next task)
- Open the preview of the `main` theme at 1440 / 768 / 375 and compare to `design/homepage/`. Agents measured static mocks; real Liquid output, Judge.me markup and the cart drawer are unverified.
- Tablet (750–989) was not designed — check it looks sane.

### 2. Content the client must add (theme editor / admin)
- [ ] Theme settings → Logo (or leave the bundled `header-logo.png` fallback), favicon; Social media links (Facebook, Instagram, TikTok).
- [ ] Images: hero desktop (2880×1080) + mobile (1206×1620); promo backgrounds (≈2752×640); press logos (white/transparent); 8 before/after result pairs; video files or covers + product per card; guarantee photos (3) + courier logos strip (~672 wide); 4 category images; brand story photo + wordmark logo without tagline; money-back seal (transparent PNG); footer + drawer payment-badges strip and Amare seal.
- [ ] Products: featured product (`zenith-anti-aging-tallow-cream` must exist, 4 images for the slider); collection carousel uses "all"; category card links (1–2) and products (3–4); hero button product (optional real add-to-cart).
- [ ] Promo banners: real countdown end dates (both default 2026-12-31).
- [ ] Menus (Content → Menus), handles must match: `main-menu` (drawer), `footer` (Shop / Our Story / FDA verification / Contact Us), `footer-mobile` (Home / Shop / Our Story / Verify Products / Certificates / Contact Us), `footer-products` (Skin / Hair / Body / Grooming Products), `footer-policies` (Privacy / Shipping / Refund / Terms / Disclaimer).
- [ ] Header → Menu drawer: payment logos image, Amare badge image, CTA product/link.
- [ ] Judge.me: install app, then add its widget block inside "Zenith · Reviews". Until then the section is hidden on the live store (shows a preview in the editor).
- [ ] FAQ answers 2–5 are placeholders (design repeats one answer).
- [ ] Contact page: admin page "Contact" must use template **contact**; FAQ answers 2–4 are "[Add answer]"; confirm the Manila office address (desktop design shows "2F Revilles Building, Osmena Blvd…" (a Cebu address), mobile shows "1208 Pablo Ocampo… Manila" — using the Manila one); Theme settings → Zenith → Marketplaces: Lazada + Shopee links; contact topics list (my defaults: Order status / Product question / Returns & refunds / Wholesale & partnerships / Other). Form messages go to the store sender email.
- [ ] Decide: featured-product check colour (desktop design orange #EF931C vs mobile #EABE5F — using #EABE5F).

### 3. Not started
- [ ] Product page template (design pending) → export to `design/product/`.
- [ ] Collection, cart, search, 404, about pages. (Contact page done 2026-09-18.)
- [ ] Analytics/pixels, SEO metafields, shipping/policy pages.
- [ ] Performance + a11y pass (Lighthouse on preview), then publish `main` theme.

## Known issues / gotchas
- Theme settings **font pickers do nothing**: brand fonts are self-hosted in `assets/zenith-*.woff2` and forced via `assets/zenith-base.css`. Pickers are set to a system font so `settings_data.json` stays valid.
- **Shopify rejects a section file with an invalid schema without telling git** (range > 101 or < 2 steps, etc.) and keeps the old file; the next theme-editor save commits the old file back. Happened 2026-09-18: confetti (hero/promo), reviews theming and the video bleed were reverted by a bot commit from Henson's editor save. Fixed + `node .claude/skills/design-to-page/scripts/validate-schemas.js .` added — run it before every push. Reload the theme editor after a push before saving.
- `settings_data.json` must stay schema-valid or Shopify drops **all color schemes** (editor error "color schemes must be defined…"). Caused once by an invalid font handle + `animations_hover_elements: "none"`.
- The editor writes **every** setting into `templates/*.json`. Never reuse a setting id with a different type; add a new id and strip the stale key from templates.
- Dawn's `div:empty { display: none }` hides empty divs — overlays use `div.zenith-overlay` to beat it; watch for this with any new empty decorative div.
- `sections/cart-icon-bubble.liquid` carries the same cart SVG as `sections/header.liquid` (Dawn re-renders it after add-to-cart) — change both together.
- Theme check: 0 errors; `ExcessiveSettingsCount` warnings on 11 sections (>40 settings, editor-usability warning only). Dawn orphan snippets `header-drawer.liquid`, `quick-order-product-row.liquid`.
- `gh` CLI not installed; PRs are opened via compare URLs. Pushing needs `GCM_INTERACTIVE=always` in this environment.

## Commands
```bash
npx @shopify/cli@latest theme check          # lint (0 errors expected)
npx @shopify/cli@latest theme dev --store <handle>.myshopify.com   # local preview (handle TBD)
```
Preview link for the connected theme: Admin → Online Store → Themes → ⋯ → Share preview.
