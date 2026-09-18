---
name: design-to-page
description: Build or fix any store page (home, product, collection, cart, about, contact…) so it matches the design exports in design/<page>/ — slice + measure the designs, build shared pieces first, fan sections out to parallel agents with a shared brief, validate and merge template patches, verify, ship. Use when the user adds design files for a page, says a page "doesn't match the design", or asks to build a new page from a design. Proven on the homepage (2026-09-18).
---

# Design → page (any page)

Workflow that took the homepage from "not accurate" to within 1–3px of the design in one pass. Pair with `dawn-customize` (code conventions) and `figma-to-dawn` (token mapping). Scripts live in `scripts/` next to this file; the agent brief template is `brief-template.md`.

## 0. Inputs (don't stall)
- Designs: `design/<page>/desktop version/` + `mobile version/` — full-page PNG + per-section layer exports (Figma names are fine) + optional `guide*.png` designer notes. Layout spec: `design/README.md`.
- No files yet → ask the user once for: full page + layer exports per breakpoint, desktop/mobile kept apart. Nothing else.
- Figma link → Figma connector if authorized; otherwise ask for PNG exports.
- `git checkout staging && git pull` first (the theme editor commits back).

## 1. Read the design (lead, ~15 min)
1. `node scripts/png-sizes.js "design/<page>"` → every file with size. Folder names vary (`desktop version/sections`, `desktop/sections`, `section`/`sections`) — discover, don't assume. Scale: 1440 / ~400 wide = 1x; 2880 / ~800 wide = 2x → halve every measurement (slice 2x pages with `-Height 2000` / `2200`).
2. Slice each full page into the scratchpad (never Read a 10 000px image whole):
   `powershell -File scripts/slice.ps1 -Src "<full.png>" -OutDir "<scratchpad>/slices" -Prefix d -Height 1000` (mobile: `-Prefix m -Height 1100`).
3. Read every slice top to bottom, then every `guide*.png`. Designer notes are requirements (they produced: global customer count, before/after card, sale hero, countdown seconds).
4. Map every crop → section (template key or group). **Reuse existing sections first** (`ls sections/zenith-*`): add an existing section to the template and set it up before building anything new. Build a new section only when the layout needs pieces side by side that Shopify can't stack as separate sections (e.g. contact details + FAQ beside a form) — and then reuse the shared snippets inside it. Ambiguous crops: view them; small unnamed frames are often device chrome ("MOBILE NAV AREA"). Write the map into `design/README.md`.
5. Note desktop↔mobile differences per section: order, hidden sections, different copy, alignment, card counts.
6. Measure page-level facts with `scripts/measure.ps1` (colours at points, row/column run lengths, zoomed crops): page bg, gutters (content edge at 1440 and mobile), header/footer colours, card gradients, eyebrow colour, button fills, carousel controls.

## 2. Shared pieces FIRST (lead, before any agent starts)
Anything two sections share is built once by the lead, so agents don't diverge:
- Tokens/utilities in `assets/zenith-base.css` (buttons, gutters, heading rhythm, carousel controls, eyebrow).
- Shared snippets (see Building blocks) and new icons in `snippets/zenith-icon.liquid`.
- New global Theme settings (`config/settings_schema.json` group "Zenith…" + values in `settings_data.json`).
- New CSS-var ids in the `zenith-section-style` map.
Then fill `brief-template.md` → `<scratchpad>/BRIEF.md` (placeholders + "Measured design facts") and create `<scratchpad>/index-patches/`.

## 3. Fan out (parallel agents)
- Only when the user asked for the work ("do it now" counts); 2–4 related sections per agent, one agent per section group (header+drawer, footer), ≤ 7 agents. Launch all in ONE message, `run_in_background: true`.
- Each prompt: "read BRIEF.md first" + scope (template keys) + **owned files** (section liquid/css/js; group JSON only for header/footer agents) + exact design crops (desktop + mobile + slices) + known facts + designer notes that apply.
- Agents never edit shared files or templates; they write `index-patches/<key>.json` (complete section object) and report "Shared changes needed".
- Changing something global mid-run (e.g. gutters)? `SendMessage` every running agent immediately so nobody compensates locally.

## 4. Integrate (lead)
1. As each report lands: apply shared changes with judgment — measurement-backed ones (letter-spacing, line-height, border colours, missing icon/param) go global; conflicting ones → pick the measured value.
2. Validate + merge patches (copy finished ones to `<scratchpad>/ready/`):
   `node scripts/merge-patches.js . templates/<page>.json "<scratchpad>/ready"` → fix every error → re-run with `--write`.
3. Reconcile neighbour spacing: gap between sections = prev `padding_bottom` + next `padding_top`; compare to design y-positions (desktop and mobile) and fix in the patch.
4. Validate all JSON (`templates`, `*-group.json`, `settings_data`, `settings_schema`) + every `{% schema %}`; run `npx -y @shopify/cli@latest theme check --output json` → 0 errors (ExcessiveSettingsCount warnings are acceptable).
5. Spot-render risky pieces yourself: static HTML mock linking the real CSS → `scripts/shot.ps1 -Html … -Out … -Width 1440` → compare with the design crop (build a side-by-side PNG and view it). Mobile: Chrome won't lay out narrower than ~500px, so wrap the mock in a 401px `<iframe>` page and shoot that. Mocks lack `layout/theme.liquid`'s global `box-sizing: border-box` — set it on your own inputs anyway.

## 5. Ship + hand off
- Commits on `staging`, one logical change each: design files → shared infra → sections + template → header/footer → docs. Push, then (per CLAUDE.md) merge `staging` → `main`, push (main theme is unpublished preview until the user publishes).
- Update `PROJECT-STATUS.md` (what changed, client content list, gotchas), `.claude/brand.md` (design-verified tokens), `design/README.md` (map).
- Tell the user: what changed per area, how it was verified (static renders ≠ live store → ask them to eyeball the preview), decisions made from the design (hidden-on-mobile, defaults), and the exact content/menus/images they must add.

## Building blocks (reuse on every page)
| Need | Use |
|---|---|
| CTA / link button | `snippets/zenith-button.liquid` (`style`: gold / dark / outline / light / scheme, `icon`: arrow_right / cart / none) + section `button_style`, `button_font_size[_mobile]` |
| Add to cart | `snippets/zenith-add-to-cart.liquid` (`style`, `icon`); section loads `product-form.js` |
| Eyebrow / heading / subheading | `snippets/zenith-section-heading.liquid` (replaces `[customers]`); several headings in one section → override `--z-hfs`/`--z-hsp`/`--z-sfs` on a wrapper |
| FAQ accordion (+ FAQPage JSON-LD) | `snippets/zenith-faq-items.liquid` + `assets/zenith-faq.css` (used by `zenith-faq` and `zenith-contact`; `type` filters blocks; wrapper class `zenith-faq-q-body-m` = body-font questions on mobile) |
| Contact form + details | `sections/zenith-contact.liquid` (Shopify `form 'contact'`, office/line/FAQ blocks) |
| Marketplace links | `settings.social_lazada_link`, `settings.social_shopee_link` (Theme settings → Zenith); icons `lazada`, `shopee` |
| Per-instance CSS vars | `snippets/zenith-section-style.liquid` map — add `setting_id:var:unit` for new sizes |
| Carousel | `<zenith-carousel>` + `snippets/zenith-carousel-controls.liquid` (design dots/arrows) |
| Countdown (d/h/m/s) | `snippets/zenith-countdown.liquid` + `zenith-countdown.css/js` |
| Gold confetti | `snippets/zenith-confetti.liquid` + `assets/zenith-confetti.png`; settings `show_confetti`, `confetti_image`, `confetti_align`, `confetti_width[_mobile]`, `confetti_opacity` |
| Image overlay | `snippets/zenith-overlay.liquid` / `zenith-overlay-vars.liquid` |
| Icons | `snippets/zenith-icon.liquid` (1.5px line set; add new ones there, not inline) |
| Store-wide number | `settings.customer_count` via `[customers]` token |
| Store-wide content, edit once | Theme settings group + per-section source select `global` / `custom` (pattern: `zenith-promo-banner` `content_source`, hero `countdown_source`) |
| Page width + gutters | Theme settings → Page width = whole frame incl. gutters (1440); gutter = Theme settings → Zenith → Page side margin (30 / 20) → `--z-gutter` on `.page-width` — never pad sections to fake gutters. Bleeds use `calc(-1 * var(--z-gutter))` (stop at the frame edge), never `100vw`. Header icons align via `zenith-header--align-page` |
| Desktop/mobile differences | `*_mobile` copy settings, `heading_alignment_mobile`, `hide_on_mobile` / `hide_on_desktop`, per-block "Hide on mobile" |

Global-toggle candidates when a section repeats across pages with the same content: trust bar, money-back guarantee, Zenith Guarantee, press logos, promo. Page-specific sections (hero, story, featured product) stay per section.

## Page notes
- **Product**: Dawn `main-product` (extend with `zenith:` edits/blocks) + zenith sections below it in `templates/product.json`; one template serves all products — alternate templates (`product.<name>.json`) only for different layouts. Reviews = Judge.me block.
- **Collection / search**: Dawn `main-collection-product-grid` / facets; restyle cards via shared card CSS rather than new sections.
- **Pages (about, contact)**: `templates/page.<name>.json`; reuse `zenith-image-story`, `zenith-feature-columns`, `zenith-faq`. Contact = `zenith-contact` in `templates/page.contact.json` (Dawn `main-page` kept but disabled). The admin page must use that template.

## Gotchas (all hit on the homepage)
- Dawn `div:empty { display: none }` hides empty decorative divs → select with `div.<class>` + `display: block`, or use an `<img>`.
- `sections/cart-icon-bubble.liquid` must carry the same cart SVG as `sections/header.liquid` (Dawn re-renders it after add-to-cart).
- Never reuse a setting id with a new type; the editor saved every setting into the template.
- Liquid can't chain filters inside a filter argument (`class: 'a' | append: b` fails) → `assign` first.
- Some repo files are CRLF: Node `string.replace` with `\n` anchors silently misses → use the Edit tool or `\r?\n` regexes, and check the change landed.
- Bash heredocs strip backslashes → write scripts with the Write tool.
- PowerShell 5.1 `Start-Process -ArgumentList @(...)` doesn't quote spaces ("Work - Cals") → quote each arg (see `shot.ps1`).
- `settings_data.json` invalid → Shopify drops all colour schemes. Validate after every edit.
- Upload-dependent visuals (backgrounds with baked-in confetti, logos with taglines) → note in the handoff what the client must upload and how.
- Font size from a PNG: **cap height ≈ 0.70 × font-size** for both Special Gothic Condensed One and Geist (measure a flat letter like H/F/D, not a round one). Cross-check with text width vs a mock at a known size.
- Dawn `input[type='checkbox'] { width: auto }` beats a class selector → use `input.<class>[type='checkbox']`.
- Desktop and mobile designs can disagree on CONTENT (e.g. two different addresses, a placeholder answer on one breakpoint). Pick the one that fits the label/brand, and list the conflict in the handoff for the client to confirm.
