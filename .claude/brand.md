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
- URL: TBD (.myshopify.com)
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

### Dawn color schemes (planned)
| Scheme | Background | Text | Button | Button label | Secondary btn label |
|---|---|---|---|---|---|
| scheme-1 Light | #FFFFFF | #121212 | #121212 | #FFFFFF | #121212 |
| scheme-2 Rock | #E7E7E7 | #121212 | #121212 | #FFFFFF | #121212 |
| scheme-3 Obsidian | #121212 | #FFFFFF | #FFFFFF | #121212 | #FFFFFF |
| scheme-4 Obsidian Gold | #121212 | #FFFFFF | #C59300 | #121212 | #C59300 |
| scheme-5 Gold | #C59300 | #121212 | #121212 | #FFFFFF | #121212 |
| scheme-6 Horizon | #112328 | #FFFFFF | #EABE5F | #121212 | #FFFFFF |
| scheme-7 Basalt | #202020 | #E7E7E7 | #C59300 | #121212 | #E7E7E7 |

## Typography
| Role | Font | Web use |
|---|---|---|
| Primary headline | Special Gothic Condensed One, Regular | Web headings (H1–H4, banners, prices large). Often UPPERCASE on banners/hero. |
| Primary body | Geist (Thin–Black) | Web body, UI, buttons, nav |
| Packaging headline | Bebas Neue | Packaging only (not web) |
| Packaging body | Acumin Pro | Packaging only (not web) |

- Both web fonts are Google Fonts, not in Shopify font library → self-host woff2 in `assets/`, `@font-face` in `zenith-base.css`, `font-display: swap`.
- Geist weights to load: 400, 500, 600 (700 if needed). Heading: 400 only.
- Type scale (desktop / mobile) default: H1 64/40 · H2 48/32 · H3 32/24 · H4 24/20 · body 16/15 · small 14/13. Heading line-height 1.0–1.1, body 1.5. TBD confirm from Figma.

## UI
- Corners: square (radius 0) on buttons, cards, media, inputs — per brand application.
- Buttons: solid; dark on light (Obsidian/White), white or Summit Gold on dark. Label Geist 500, sentence/title case.
- Announcement bar: Summit Gold background, dark text.
- Header: Obsidian Black, white nav, centered logo.
- Product card: light/rock background, product on neutral, black full-width "Add to cart".
- Page width: 1440 (TBD) · section spacing default 64px desktop / 48px mobile.
- Shadows: none.

## Art direction
- Photography: mature Filipino men 40+, natural warm light, calm confident expressions, outdoor/stone/coastal settings.
- Product shots: dark packaging on natural textures (warm wood, stone, dark slate), golden-hour light, strong shadows.
- Textures: walnut wood, sandstone, charcoal slate.
- Icons: thin 1.5px line icons (light UI); on dark, Summit Gold line icons inside gold outline circles.
- Promo graphics: dark background, big condensed headline, gold numerals (e.g. "UP TO 40% OFF").
