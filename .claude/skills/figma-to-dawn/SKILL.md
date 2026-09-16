---
name: figma-to-dawn
description: Convert Figma designs (links via Figma connector, or pasted screenshots) and branding into Dawn theme settings and sections in one pass. Use when user pastes a Figma link, frame screenshot, or brand guide.
---

# Figma → Dawn

## 0. Input
- **Brand is already defined** in `.claude/brand.md` (from style guide). Snap all design values to those tokens; never re-extract or ask.
- **Figma link** → use claude.ai Figma connector tools (get design context / variables / screenshot of node). If connector unauthorized: tell user once, ask for screenshots.
- **Screenshot** → read image; estimate values, snap to design tokens in `.claude/brand.md`.
- Missing info → fill `.claude/brand.md` defaults, list assumptions in one line. Don't stall.

## 1. Tokens first (once per project)
Extract → write `.claude/brand.md`, then map to Dawn:
| Figma | Dawn |
|---|---|
| Color styles | `settings_data.json` → `color_schemes` (background, text, button, button_label, secondary_button_label, shadow). Build 3–5 schemes (light, dark, accent, muted). |
| Heading / body font | `type_header_font`, `type_body_font` (font_picker handle e.g. `inter_n4`); non-Shopify font → `@font-face` |
| Type scale | `heading_scale`, `body_scale` (%), fine sizes in `zenith-base.css` |
| Radius | `buttons_radius`, `inputs_radius`, `card_corner_radius`, `media_radius`, etc. |
| Max width / grid gap | `page_width`, `spacing_grid_horizontal/vertical`, `spacing_sections` |
| Shadows / borders | `buttons_shadow_*`, `card_border_*`, `card_shadow_*` |

## 2. Per frame
1. Split frame into horizontal bands → each band = one section.
2. For each band pick (per `dawn-customize` decision order): Dawn section match → configure; near match → extend; none → new `zenith-*` section.
3. Output a mapping table before coding (only if >3 new sections):
   `Band | Dawn section / new | Settings`
4. Implement, wire into `templates/<page>.json` in design order with design copy as setting defaults.
5. Export images from Figma only for decorative/brand assets (icons as SVG → `snippets/zenith-icon-<name>.liquid`). Product/content imagery stays as `image_picker` settings.

## Dawn section cheat sheet
hero → `image-banner` / `slideshow` · text+image → `image-with-text` / `multirow` · feature cols → `multicolumn` · grid products → `featured-collection` · category tiles → `collection-list` · mosaic → `collage` · FAQ → `collapsible-content` · newsletter → `newsletter` / `email-signup-banner` · testimonials/logos → new section.

## Fidelity checks
- Spacing: Figma px → nearest 4px section padding setting.
- Desktop frame 1440 → `page_width` 1200–1600; mobile frame 375 validates at 750px breakpoint.
- Compare against screenshot at end; list only mismatches that remain.
