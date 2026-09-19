# Zenith brand tokens
<!-- Source: Zenith Style Guide One-Pager. Claude reads this instead of asking. TBD = Claude picks a default and notes it. -->

## Foundation
- Mission: Premium, high-performance self-care for mature Filipino men, easy to access.
- Vision: Empower mature Filipino men to always feel in their prime.
- Brand feeling: Confident, never self-conscious · Certain, because it works · Respected, never rushed.
- Tagline: **Always In Your Prime**
- Archetype: The Quiet Craftsman — composed, precise, plain-spoken; warmer than the design suggests; customer feels invited, not tested.
- Values: Every Customer Is A VIP · Problem First, Product Second · Evidence Over Hype · A Discreet Way To Buy
- Personality: Composed, Precise, Plain-spoken, Accountable, Deliberate
- Copy rules: short, plain, factual claims; no hype words, no exclamation spam; problem → solution.

## Store
- Market: Philippines · Currency: PHP (₱)
- URL: tryzenith.ph (myshopify handle TBD — needed for `shopify theme dev --store`)
- Categories seen: Skin, Hygiene (e.g. Anti-Aging Tallow Cream)

## Logo
- Wordmark "ZEN▲TH": the I is replaced by a gold mountain peak + sun dot (Summit Gold).
- Variants: black wordmark on white/light · white wordmark on Obsidian Black · lockup with tagline "ALWAYS IN YOUR PRIME" (dark + light).
- Mark alone (gold peak + dot) = favicon/social avatar.
- Files in `assets/`: `header-logo.png`, `footer-logo.png` — white wordmark + gold mark, transparent PNG (~216px wide) → for dark header/footer. Upload the same file in Theme settings → Logo (theme editor `image_picker`; asset files aren't selectable there).
- Missing (TBD): black wordmark for light backgrounds, tagline lockups, standalone mark/favicon, SVG or ≥2x PNG for retina.
- Logo on light backgrounds uses black wordmark; on dark uses white. Never recolor the mark.

## Colors
| Name | Hex | Role |
|---|---|---|
| Obsidian Black | #121212 | primary dark bg, primary text, primary button |
| White Rock | #E7E7E7 | light surface, text on dark |
| Summit Gold | #C59300 | brand accent, CTA on dark, sale/highlight, icons |
| Basalt | #202020 | secondary dark surface, cards on black |
| Granite | #8E8C8C | muted text, borders on dark |
| Dawn Gold | #EABE5F | light gold, gradient start, hover on gold |
| Horizon Blue | #294850 | secondary accent, gradient start |
| Obsidian Blue | #112328 | deep blue surface |

Neutral scale: #010101 · #1A1A1A · #4D4D4D · #808080 · #B2B2B2 · #D8D8D8 · #F2F2F2 · #FFFFFF

Gradients:
- Altitude: Horizon Blue → White `linear-gradient(90deg, #294850, #FFFFFF)`
- Summit: Dawn Gold → Summit Gold `linear-gradient(90deg, #EABE5F, #C59300)`

### Dawn color schemes (live in config/settings_data.json)
| Scheme | Use | Background | Text | Button / label |
|---|---|---|---|---|
| scheme-1 Obsidian (site default) | page, most sections | #0E0E0E (design page bg) | #FFFFFF | #C59300 / #121212 |
| scheme-2 White | promo banner card | #FFFFFF | #121212 | #121212 / #FFFFFF |
| scheme-3 Rock | product image backgrounds | #E7E7E7 | #121212 | #121212 / #FFFFFF |
| scheme-4 Basalt | trust bar, money-back band, review cards | #202020 | #FFFFFF | #C59300 / #121212 |
| scheme-5 Gold | announcement bar, badges | #C59300 | #121212 | #121212 / #FFFFFF |
| scheme-6 Horizon | featured product panel (gradient #112328 to #294850) | #112328 | #FFFFFF | #C59300 / #121212 |
| scheme-7 Obsidian / white button | alt dark with white CTA | #121212 | #FFFFFF | #FFFFFF / #121212 |

## Typography
| Role | Font | Web use |
|---|---|---|
| Primary headline | Special Gothic Condensed One, Regular | Web headings (H1–H4, banners, prices large). Often UPPERCASE on banners/hero. |
| Primary body | Geist (Thin–Black) | Web body, UI, buttons, nav |
| Packaging headline | Bebas Neue | Packaging only (not web) |
| Packaging body | Acumin Pro | Packaging only (not web) |

- Both web fonts self-hosted: `assets/zenith-special-gothic-condensed-one-400.woff2`, `assets/zenith-geist-variable.woff2` (OFL). Declared in `assets/zenith-base.css`, which overrides Dawn font vars → Theme settings font pickers are set to system fonts and have no visual effect.
- Geist weights to load: 400, 500, 600 (700 if needed). Heading: 400 only.
- Type scale (desktop / mobile) default: H1 64/40 · H2 48/32 · H3 32/24 · H4 24/20 · body 16/15 · small 14/13. Heading line-height 1.0–1.1, body 1.5. TBD confirm from Figma.

## UI
- Corners: square (radius 0) on buttons, cards, media, inputs — per brand application.
- Buttons (per homepage design): label in the HEADING font (~22px) + arrow/cart icon, square. Styles via `snippets/zenith-button.liquid`: gold = Summit gradient #EABE5F→#C59300 with dark text (default CTA); dark = #112328 with white text (on light promo cards); outline = 1px #EABE5F border, white text ("Shop All Products").
- Announcement bar: Summit Gold background, dark text.
- Header: pure black #000, hamburger (desktop too), centered logo, account + cart right; announcement bar BELOW it, gold gradient.
- Page width: max 1440px frame incl. side margins (Theme settings → Page width = 1440). Side margins = Theme settings → Zenith → Page side margin: 30px desktop / 20px mobile (client request; design showed 80). Header icons align to the same margin.
- Customer count: Theme settings → Zenith → Customer count; write `[customers]` in section copy.
- Product card (design-verified, Shop All 2026-09-19): white image square, stars #EABE5F 13px + score "4.7" (16px, 85% white) above the title, title Geist 600 22px / 1.55 (mobile 17px / 1.15), price 18px 70% white, full-width gold "Add to Cart" + cart icon 46px (mobile 44px). Badge top-left on the image, 28px tall (mobile 22px), 14px text: "Selling Fast" #294850 + gold truck; sale "On Sale" gradient #A90619 → #F3213A, white text. Grid gap 32 desktop / 16 mobile.
- Page width: design frame 1440 · section spacing varies per section (set per section from the design).
- Shadows: none.

## Art direction
- Photography: mature Filipino men 40+, natural warm light, calm confident expressions, outdoor/stone/coastal settings.
- Product shots: dark packaging on natural textures (warm wood, stone, dark slate), golden-hour light, strong shadows.
- Textures: walnut wood, sandstone, charcoal slate.
- Icons: thin 1.5px line icons (light UI); on dark, Summit Gold line icons inside gold outline circles.
- Promo graphics: dark background, big condensed headline, gold numerals (e.g. "UP TO 40% OFF").
