---
name: dawn-customize
description: Conventions for editing this Dawn 16 Shopify theme — git branching, where code goes, reusable sections + unique IDs, schema organization, spacing/responsive consistency, verification. Use before any change to sections, snippets, templates, assets, config, or locales.
---

# Dawn customization playbook

## 1. Git — two branches only
| Branch | Purpose | Shopify theme (GitHub integration) |
|---|---|---|
| `staging` | all work happens here | connect as unpublished preview theme |
| `main` | production | "zenith-shopify/main" theme (publish when ready) |

Flow:
- Start every session: `git checkout staging; git pull`.
- Commit to `staging` directly, one logical change per commit: `feat(zenith-hero): add section`. Push after each commit.
- Release: `git checkout main; git pull; git merge staging; git push; git checkout staging`.
- Feature branches only when the user asks for one; delete after merging.
- Shopify's GitHub integration commits theme-editor changes (`config/settings_data.json`, `templates/*.json`) back to the connected branch → always `git pull` before starting; after editor sessions on `main`, merge `main` back into `staging`. On JSON conflicts keep the editor's content values, re-apply only structural changes.
- Never force-push.

## 2. Decision order (cheapest first)
1. **Theme setting** — `config/settings_data.json` (color schemes, fonts, buttons, radius, spacing). No code.
2. **Existing section + template JSON** — add/reorder in `templates/*.json` or `sections/*-group.json`.
3. **Extend existing Dawn section** — add setting/block (minimal diff, marked `zenith:`).
4. **New custom section** — only when layout doesn't exist in Dawn.

## 3. Reusable sections & content scope
Section **code** is shared (fix once → everywhere). Section **settings** are per instance (stored per template JSON). Pick the scope by what the content is:

| Scope | Where it lives | Example |
|---|---|---|
| Global look | Theme settings (`settings_schema.json`) | colors, fonts, radius, button style |
| Global layout | Section groups (`header-group.json`, `footer-group.json`) | header, announcement, footer |
| Shared content, many placements | **Metaobjects** (Admin → Content) rendered by section via `metaobject` / `metaobject_list` setting type | testimonials, FAQs, ingredients, trust badges, USP bars |
| Per product/collection content | **Metafields** + dynamic sources | benefits, how-to-use, ingredient list |
| Per placement | Section instance settings | hero copy/image on each page |

Rules:
- Never hardcode shared copy in a section; if it must match across pages → metaobject.
- Page-specific variants of product/collection → alternate template (`product.bundle.json`) not duplicated section files.

## 4. Unique IDs & style scoping
- Never hand-write IDs. Use Shopify's generated ids:
  - Section root: `id="zenith-hero-{{ section.id }}"`; blocks: `id="Block-{{ block.id }}"` + `{{ block.shopify_attributes }}`.
  - Form/input/aria ids: suffix with `{{ section.id }}` (e.g. `id="Accordion-{{ block.id }}-{{ section.id }}"`).
- CSS pattern — **static rules in asset file, per-instance values as CSS variables**:
  ```liquid
  {%- style -%}
    #zenith-hero-{{ section.id }} {
      --pt: {{ section.settings.padding_top }}px; --pb: {{ section.settings.padding_bottom }}px;
      --pt-m: {{ section.settings.padding_top | times: 0.75 | round: 0 }}px; --pb-m: {{ section.settings.padding_bottom | times: 0.75 | round: 0 }}px;
      --z-heading-size: {{ section.settings.heading_size }}rem;
    }
  {%- endstyle -%}
  ```
  `assets/zenith-hero.css` uses only `.zenith-hero { padding: var(--pt-m) 0 var(--pb-m); } @media (min-width: 750px) { .zenith-hero { padding: var(--pt) 0 var(--pb); } }`.
- Class names: BEM-ish `zenith-<section>__<element>--<modifier>`. No generic global classes (avoid collisions with Dawn).
- JS custom elements scope queries to `this`, never `document.querySelector` for per-section elements.

## 5. Editor schema — every section fully editable & organized
- Every visual value from design = setting. No hardcoded copy, images, colors, or spacing.
- Settings grouped with `"type": "header"` in this **fixed order** (skip unused groups):
  1. `Content` — heading, subheading, text, buttons (label + link), image/video
  2. `Layout` — alignment, columns desktop/mobile, image position, width (page/full), height
  3. `Colors` — `color_scheme` (use Dawn schemes, not raw color pickers unless design demands one-off)
  4. `Typography` — heading size (select: small/medium/large/xl), heading tag (h1–h3), text size
  5. `Mobile` — mobile layout/columns/alignment overrides, hide-on-mobile toggles
  6. `Spacing` — `padding_top`, `padding_bottom` (range 0–100, step 4, unit px, default 36)
- Setting ids: `snake_case`, prefixed by group when ambiguous (`mobile_columns`, `button_label_1`).
- **Size/spacing settings → CSS vars automatically**: `snippets/zenith-section-style.liquid` has a `map` of standard ids
  (`heading_font_size[_mobile]`, `subheading_font_size[_mobile]`, `eyebrow_font_size`, `heading_max_width`, `heading_spacing[_mobile]`,
  `text_font_size[_mobile]`, `title_font_size[_mobile]`, `price_font_size[_mobile]`, `gap[_mobile]`, `content_max_width`, `content_gap[_mobile]`,
  `content_padding[_mobile]`, `icon_size[_mobile]`, `media_width[_mobile]`, `media_min_height`, `media_height_mobile`, `image_padding`, …).
  Reuse these ids first; CSS reads `var(--z-<suffix>-m, fallback)` mobile-first and `var(--z-<suffix>, fallback)` ≥750px. New id → add one map entry.
- Every text element gets a desktop + mobile size range; every layout gap/width/height the design varies gets a range. Mobile values live in the `Mobile` group.
- **Never change a setting's type under the same id** — the theme editor saves every setting into `templates/*.json`; reuse of an id with a new type breaks sync. Use a new id and delete stale keys from templates.
- Blocks for repeatable items (cards, slides, FAQ items) with `max_blocks`; block settings follow same group order.
- Always include `presets` (with sensible default blocks) so it's addable in editor; `"disabled_on": {"groups": ["header","footer"]}` for body sections.
- Plain English labels + `info` hints for non-obvious settings.

## 6. Layout consistency (desktop / tablet / mobile)
- Spacing scale only (CSS vars in `assets/zenith-base.css`): `--z-space-1:4px 2:8px 3:12px 4:16px 5:24px 6:32px 7:48px 8:64px 9:96px`. No arbitrary px in CSS.
- Container: Dawn `.page-width` (uses `page_width` setting) — never custom max-widths.
- Breakpoints: Dawn's `749px`/`750px` and `989px`/`990px` for layout. Mobile-first CSS.
- **Small phones: `@media screen and (max-width: 375px)`.** When a fix is only about text running out of room on a narrow phone, scope it there — never widen it to 749px, which would change the layout at sizes that have room to spare. Layout structure still uses the Dawn breakpoints above. Check descendants for their own alignment when you flip a parent (e.g. `.zenith-footer__legal` sets `justify-content: flex-end`, `margin-left: auto` and `text-align: right`).
- Section vertical padding: settings, desktop value × 0.75 on mobile (pattern above).
- Grid gaps: `var(--grid-desktop-horizontal-spacing)` / `--grid-mobile-*` from Dawn settings.
- Headings use brand type scale vars (`--z-h1`…), buttons use Dawn `.button` classes → consistent everywhere.
- Test widths: 375, 768, 1024, 1440. No horizontal scroll; tap targets ≥ 44px.

## 7. File conventions
- Sections: `sections/zenith-<name>.liquid`; snippets: `snippets/zenith-<name>.liquid`; CSS `assets/zenith-<name>.css` loaded in section via `stylesheet_tag`; JS `assets/zenith-<name>.js` `defer`, custom element guarded by `customElements.get`.
- Brand globals (fonts `@font-face`, tokens, overrides): `assets/zenith-base.css`, included in `layout/theme.liquid` after `base.css`.
- Never bulk-edit `base.css`. Mark Dawn-file edits with `zenith: <reason>` comment.

## 8. Liquid / perf / a11y
- Images: `image_url: width:` + `image_tag` with `widths`, `sizes`, `loading: 'lazy'`. Only a section that can be the first thing on screen (`section.index <= 2`, and not hidden by the promo switch) gets `loading: 'eager'` + `fetchpriority: 'high'` — see zenith-hero `img_loading` / `img_priority`. Never `high` on more than the one main image.
- Desktop + mobile image pair → `snippets/zenith-responsive-image.liquid` (`<picture>`, the device downloads only its image). Never two eager `<img>` hidden with `zenith-hide-mobile` / `-desktop` (a hidden eager image still downloads; a hidden *lazy* one doesn't).
- Video: never load a player at page load. Uploaded video in a card → `video_tag` with `preload: 'none'`, `poster` attribute stripped, lazy `<img>` cover (see `zenith-video-card`). YouTube in a card → thumbnail + play button, iframe created on tap (`zenith-video.js`). Looping background → `snippets/zenith-bg-video.liquid` (mounts near the viewport, pauses off screen, off with reduced motion). Prefer uploaded MP4 over YouTube for background loops (a YouTube player is ~1 MB of script per card).
- Heavy sections lower on the page (marquees, carousels, long grids) → add `{% if section.index > 2 %} zenith-defer{% endif %}` to the root class (`content-visibility: auto` in zenith-base.css; optional `--z-defer-h` height estimate).
- Marquees: repeat only as many copies as needed to fill a wide screen (see results marquee `passes`); pause on hover/focus; stop with `prefers-reduced-motion`.
- JS: vanilla custom element per feature, `defer`, `customElements.get` guard, work only when visible (IntersectionObserver), no libraries/jQuery. Third-party origins: connect on intent (hover/touch), not at load.
- Reuse Dawn snippets: `card-product`, `price`, `loading-spinner`, `icon-*`.
- One `h1` per page (heading tag setting), `visually-hidden` labels, visible focus, `prefers-reduced-motion`.
- Fonts: `font-display: swap`, self-hosted woff2, preload only the heading woff2.

## 9. Done checklist
- On `staging`, pulled before starting (§1).
- `shopify theme check` — 0 new errors; JSON parses.
- Two instances of the section on one page styled independently (unique-id check).
- Editor: all groups present in order, presets addable.
- 375 / 768 / 1440 visually consistent with design.
