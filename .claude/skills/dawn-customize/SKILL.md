---
name: dawn-customize
description: Conventions for editing this Dawn 16 Shopify theme — git branching, where code goes, reusable sections + unique IDs, schema organization, spacing/responsive consistency, verification. Use before any change to sections, snippets, templates, assets, config, or locales.
---

# Dawn customization playbook

## 1. Git — branch per new work (always first)
Branches:
| Branch | Purpose | Shopify theme (GitHub integration) |
|---|---|---|
| `main` | production | Live theme |
| `staging` | QA / client review | Unpublished "Zenith – Staging" theme |
| `feat/*` `fix/*` `style/*` `chore/*` | one unit of work | local `shopify theme dev` |

Flow:
- Start: `git checkout staging; git pull; git checkout -b feat/<kebab-name>` **before editing**.
- Commits: `feat(zenith-hero): add section` — one logical change each.
- Push: `git push -u origin <branch>`; PR into `staging` (`gh` not installed → give compare URL `https://github.com/zenithph/zenith-shopify/compare/staging...<branch>`).
- Release: PR `staging` → `main` after review on staging theme.
- Hotfix: `fix/*` off `main` → PR to `main`, then merge `main` back into `staging`.
- Shopify's GitHub integration commits theme-editor changes (`config/settings_data.json`, `templates/*.json`) back to the connected branch → always `git pull` before starting; on JSON conflicts keep the editor's content values, re-apply only structural changes.
- Never commit directly to `main`/`staging` (except initial setup). Never force-push.

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
- Blocks for repeatable items (cards, slides, FAQ items) with `max_blocks`; block settings follow same group order.
- Always include `presets` (with sensible default blocks) so it's addable in editor; `"disabled_on": {"groups": ["header","footer"]}` for body sections.
- Plain English labels + `info` hints for non-obvious settings.

## 6. Layout consistency (desktop / tablet / mobile)
- Spacing scale only (CSS vars in `assets/zenith-base.css`): `--z-space-1:4px 2:8px 3:12px 4:16px 5:24px 6:32px 7:48px 8:64px 9:96px`. No arbitrary px in CSS.
- Container: Dawn `.page-width` (uses `page_width` setting) — never custom max-widths.
- Breakpoints: Dawn's `749px`/`750px` and `989px`/`990px` only. Mobile-first CSS.
- Section vertical padding: settings, desktop value × 0.75 on mobile (pattern above).
- Grid gaps: `var(--grid-desktop-horizontal-spacing)` / `--grid-mobile-*` from Dawn settings.
- Headings use brand type scale vars (`--z-h1`…), buttons use Dawn `.button` classes → consistent everywhere.
- Test widths: 375, 768, 1024, 1440. No horizontal scroll; tap targets ≥ 44px.

## 7. File conventions
- Sections: `sections/zenith-<name>.liquid`; snippets: `snippets/zenith-<name>.liquid`; CSS `assets/zenith-<name>.css` loaded in section via `stylesheet_tag`; JS `assets/zenith-<name>.js` `defer`, custom element guarded by `customElements.get`.
- Brand globals (fonts `@font-face`, tokens, overrides): `assets/zenith-base.css`, included in `layout/theme.liquid` after `base.css`.
- Never bulk-edit `base.css`. Mark Dawn-file edits with `zenith: <reason>` comment.

## 8. Liquid / perf / a11y
- Images: `image_url: width:` + `image_tag` with `widths`, `sizes`, `loading: 'lazy'`; first hero → `fetchpriority: 'high'`, no lazy.
- Reuse Dawn snippets: `card-product`, `price`, `loading-spinner`, `icon-*`.
- One `h1` per page (heading tag setting), `visually-hidden` labels, visible focus, `prefers-reduced-motion`.
- Fonts: `font-display: swap`, preload only the heading woff2.

## 9. Done checklist
- On a feature branch (§1).
- `shopify theme check` — 0 new errors; JSON parses.
- Two instances of the section on one page styled independently (unique-id check).
- Editor: all groups present in order, presets addable.
- 375 / 768 / 1440 visually consistent with design.
