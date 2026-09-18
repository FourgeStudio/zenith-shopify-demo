# Shared brief — <PAGE> design-accuracy pass
<!-- Lead: copy to <SCRATCHPAD>/BRIEF.md, replace every <PLACEHOLDER>, fill "Measured design facts". Agents read this first. -->

Repo: `<REPO>` (Dawn 16 Shopify theme, branch `staging`). Template: `<TEMPLATE>` (e.g. `templates/product.json`).
Goal: make YOUR assigned sections match the design exports pixel-close at desktop (1440) and mobile (~390–400) while keeping every value editable in the theme editor. Be thorough: layout, sizes, type, colors, spacing, buttons, cards, mobile layout.

## Read first
- `.claude/skills/dawn-customize/SKILL.md` — conventions (schema group order Content → Layout → Colors → Typography → Mobile → Spacing, ids scoped by `section.id`, CSS vars via `snippets/zenith-section-style.liquid` map, mobile-first CSS, breakpoints 750/990, spacing vars).
- `.claude/skills/design-to-page/SKILL.md` → "Building blocks" and "Gotchas".
- `.claude/brand.md` — colors, fonts, schemes, UI rules.
- Shared infra (READ-ONLY for you): `assets/zenith-base.css`, `snippets/zenith-button.liquid`, `snippets/zenith-add-to-cart.liquid`, `snippets/zenith-section-style.liquid`, `snippets/zenith-section-heading.liquid`, `snippets/zenith-icon.liquid`, `snippets/zenith-carousel-controls.liquid`, `snippets/zenith-countdown.liquid`, `snippets/zenith-confetti.liquid`, `assets/zenith-carousel.js`.
- Your sections' current code + CSS, and your section keys in `<TEMPLATE>`.

## Design sources
- Section crops: `design/<PAGE>/desktop version/sections/...` (1440 wide) and `design/<PAGE>/mobile version/section/...` (~400 wide ≈ CSS px). Map: `design/README.md`.
- Full-page slices: `<SCRATCHPAD>/slices/d-NN-yYYYY.png`, `m-NN-yYYYY.png` (y offset in the name).
- Designer notes: `design/<PAGE>/guide*.png` (if any).
- Measure, don't guess — scripts in `.claude/skills/design-to-page/scripts/`:
  - `powershell -File measure.ps1 -Src <png> -Points "x,y;x,y"` → hex colours
  - `-Row y -From a -To b` / `-Col x ...` → run lengths (edges, widths, gaps, heights)
  - `-Crop "x,y,w,h" -Scale 2 -Out <png>` → zoomed crop to view with Read
  - `shot.ps1 -Html <mock.html> -Out <png> -Width 1440` → render a static mock (your markup + `<link>` to `file:///<REPO>/assets/*.css`) and compare with the design at the same width.

## Measured design facts (lead fills in)
- <e.g. page bg, card colours, gradients, eyebrow colour, heading/body sizes, button styles, gutters>

## Rules
- Edit ONLY the files you own (listed in your task). Do NOT edit shared files, `templates/*.json`, `config/*`, `locales/*`, `layout/*` or other sections. Need a shared change? Describe it exactly (file + code) under "Shared changes needed".
- Never change a setting's `type` under an existing id (the editor stored every setting in the template). New id instead; leave the old id out of your patch.
- Every visual value from the design = a setting (desktop + mobile variants where the design differs). Schema defaults = design values/copy. Keep `presets` valid.
- Mobile copy differs from desktop (heading, button label)? Add an optional `*_mobile` text setting (blank = reuse desktop), render with `zenith-hide-mobile` / `zenith-hide-desktop`.
- Section absent from the mobile (or desktop) design? `hide_on_mobile` / `hide_on_desktop` toggles; set in the patch.
- Customer-count copy ("100,000+") → `[customers]` token; apply `| replace: '[customers]', settings.customer_count` to any text you output outside `zenith-section-heading`.
- Buttons → `zenith-button` / `zenith-add-to-cart` with a `button_style` select (gold / dark / outline / light / scheme) + `button_font_size[_mobile]`.
- No hardcoded copy/images; images are `image_picker` settings. Only decorative brand art ships as an asset.
- a11y: real headings, alt text, focus states, `prefers-reduced-motion` for marquees/animation, tap targets ≥ 44px.
- No git commands that change state. No `shopify theme dev`.
- Validate: JSON you write parses; `{% schema %}` parses; optionally `npx -y @shopify/cli@latest theme check --output json` once at the end — no offenses in your files except `ExcessiveSettingsCount`.

## Template patch
For each section key you own, write the COMPLETE new section object (`type`, `settings`, `blocks`, `block_order`, `disabled` if present) to `<SCRATCHPAD>/index-patches/<key>.json`. Start from the current object in `<TEMPLATE>`, keep existing content/images, update copy to the design, set your new settings to design values, drop keys for removed settings. The lead validates and merges.

## Report (final message — tight)
1. Files changed + one line each.
2. Per section: what was wrong vs design → what changed.
3. Patch files written.
4. Shared changes needed (exact).
5. Remaining mismatches / content the client must upload.
