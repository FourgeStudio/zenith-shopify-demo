# Design sources

Design exports live here **on the working machine only**: `design/*` is gitignored (removed from GitHub 2026-09-19), only this README is tracked. Another device or a fresh clone has the map below but not the images — copy the exports over first. Images pasted into a chat are **not** saved.
Shopify's GitHub sync ignores this folder (it only reads theme directories), so nothing here ships to the store.

## Layout
```
design/<page>/
  desktop version/<Full page>.png        full-page export (1440 wide)
  desktop version/sections/**.png        per-section layer exports, Figma names kept
  mobile version/<Full page>.png         full-page export (~400 wide)
  mobile version/section/**.png          per-section layer exports, Figma names kept
  guide*.png                             designer notes (annotated screenshots)
```
Figma layer names can stay as exported — the map below says which file is which section. Full pages are too tall to read in one go; Claude slices them itself.

## Homepage map (`design/homepage/`)
| Section (templates/index.json key) | Desktop (`desktop version/sections/`) | Mobile (`mobile version/section/`) |
|---|---|---|
| Header + announcement (header-group) | `Navbar Desktop/10.png` | `Header.png`, `Banner/10.png` |
| Menu drawer | — | `../Slide-in Nav.png` (homepage root) |
| `hero` | `Header/6.png` | `Header/6.png` |
| `trust_bar` | `Trust Bar.png` | `Container (Shopee…).png` |
| `promo_top`, `promo_bottom` | `CTA/41.png`, `CTA/41-1.png` | not shown on mobile |
| `press` | `Logo Credentials.png` | `Logo Credentials.png` |
| `results` | `Carousel.png` | `Header/78.png` |
| `videos` | `Testimonial/57.png` | `Testimonial/57.png` |
| `guarantee` | `Zenith Guarantee.png` | `Layout/251.png` |
| `categories` | `Layout/363.png` | `Layout/363.png` |
| `featured_product` | `Header/84.png` | `Header/84.png` |
| `brand_story` | `Layout/201.png` | `Layout/201.png` |
| `collection` | `Product/5.png` | `Product/5.png` |
| `money_back` | `Zenith Money Back Guarantee.png` | `CTA/45.png` |
| `reviews` (Judge.me) | `Testimonial/18.png` | `Testimonial/18.png` |
| `faq` | `FAQ/2.png` | `FAQ/2.png` |
| Footer (footer-group) | `Desktop Footer.png` | `Mobile Footer.png` |

Revisions: `revisions/promo-banner/` — promotion switch states: `no-promo-hero.png` / `mobile-hero-no-promo.png` (promotion off → hero), `new-promo-banner-turned-on-promo.png` / `mobile-hero-turned-on-promo.png` (promotion on → split promo banner in the hero spot). `revisions/results/` — `Stars.png`, `Verified Badge.png` (redrawn as SVG: `star`, `verified_seal` in `snippets/zenith-icon.liquid`, #C5930E); the review-card layout came from chat screenshots (2026-09-19): photo + "Used <product>" left, stars / quote / avatar / name + badge / product right, card 440×220 (340×180 mobile).

Designer notes: `guide.png` (customer count is a theme setting → `[customers]` token), `guide1.png` (before/after results card), `guide2.png` (mobile sale-hero variant with ribbon, FDA badge and a countdown with seconds).

Shared art: `design/confetti.png` (969 × 161 transparent gold confetti) → shipped as `assets/zenith-confetti.png`, toggled per section (promo banners on, hero off by default).

## Contact page map (`design/contact-us/`, full pages exported at 2x)
| Section (templates/page.contact.json key) | Desktop (`desktop/sections/`) | Mobile (`mobile/sections/`) |
|---|---|---|
| Header + announcement (header-group) | `Navbar Desktop/10.png` | `Navbar/10.png` |
| `contact` (Zenith · Contact: details + FAQ + form) | `Contact/4.png` | `Contact/4.png` (form), `Layout/251.png` (details), `FAQ/2.png` |
| Footer (footer-group) | `Desktop Footer.png` | `Mobile Footer.png` |

`mobile/sections/Frame 1000005205.png` = phone "MOBILE NAV AREA" chrome, not a section.

## About page map (`design/about-us/`, desktop 1x, mobile full page 2x)
| Section (templates/page.about.json key) | Desktop (`desktop/sections/`) | Mobile (`mobile/section/`) |
|---|---|---|
| Header + announcement (header-group) | `Navbar/10.png` | `Navbar/10.png` |
| `intro` (Brand story: text left, image right; mobile image full-bleed + fade) | `Layout/201.png` | `Header/6.png` |
| `story` (Brand story, same as homepage; mobile heading "How Zenith Started") | `Layout/201-1.png` | `Layout/201.png` |
| `believe` (Feature columns, card style) | `Layout/1.png` | `Layout/1.png` |
| `care` (Brand story, gold heading + button) | `Layout/201-2.png` | `Layout/201-1.png` |
| `stores` (Zenith · Store links) | `Ecom Stores.png` | `Ecom Stores.png` |
| `trust` (Zenith · Trust checklist + seal card) | `CTA/45.png` | `CTA/45.png` |
| `cta` (Hero, same as homepage hero) | `Header/6.png` | `CTA/6.png` |
| Footer (footer-group) | `Desktop Footer.png` | `Mobile Footer.png` |

`mobile/section/Frame 1000005205.png` = phone "MOBILE NAV AREA" chrome. Mobile `care` button reads "Add to Cart" while desktop reads "Shop Our Products" — treated as a design slip (optional mobile label setting).

## Shop All map (`design/shop-all/`, full pages 2x, sections 1x)
| Section (templates/collection.shop-all.json key) | Desktop (`desktop/sections/`) | Mobile (`mobile/sections/`) |
|---|---|---|
| Header + announcement (header-group) | `Navbar Desktop/10.png` | `Navbar/10.png` |
| `promo_hero` (Promo banner, only while the promotion runs — not in the design, same switch as the homepage) | — | — |
| `hero` (Hero, only when no promotion runs; no button on mobile) | `Header/6.png` / `6-1.png` (top + closing) | `Header/6.png` |
| `trust_bar` | `Trust Bar.png` | `Container (Shopee…).png` |
| `new_arrivals`, `skin`, `hair`, `hygiene` (Zenith · Product grid) | `Product/12.png`, `12-1.png`, `12-2.png`, `12-3.png` | `Product/12.png`, `12-1.png`, `12-2.png`, `12-3.png` |
| `featured_product` | `Header/84.png` | `Header/84.png` |
| `results` (global reviews) | `Carousel.png` | `Header/78.png` (still the old before/after mock) |
| `guarantee` | `Zenith Guarantee.png` | `Layout/251.png` |
| `money_back` | `Zenith Money Back Guarantee.png` | `CTA/45.png` |
| `reviews` (Judge.me) | `Testimonial/18.png` | `Testimonial/18.png` |
| `faq` | `FAQ/2.png` | `FAQ/2.png` |
| `cta` (Hero, closing) | see `hero` | `CTA/6.png` |
| Footer (footer-group) | `Desktop Footer.png` | `Mobile Footer.png` |

Product card: stars + score above the title, badge top-left on the image ("Selling Fast" #294850 + gold truck; mobile shows "Most Purchased" = product tag badge). `design/on-promo-badge.png` = the red "On Sale" sale badge (gradient #A90619 → #F3213A, 28px tall) — a product sale badge, not tied to the promotion switch.

## Skin + Hair map (`design/skin-collection-category-page/`, `design/hair-collection-collection-page/`; full pages 2x, sections 1x)
| Section (templates/collection.skin.json / collection.hair.json key) | Desktop (`desktop/sections/`) | Mobile (`mobile/sections/`) |
|---|---|---|
| Header + announcement (header-group) | `Navbar Desktop/10.png` | `Navbar/10.png` |
| `promo_hero` (only while the promotion runs) | — | — |
| `hero` (no button) | `Header/6.png` | `Header/6.png` |
| `trust_bar` | `Trust Bar.png` | `Container (Shopee…).png` |
| `products` (Product grid, *Collection* empty = the collection viewed) | `Product/12.png` | `Product/12.png` |
| `difference` (Zenith · Before & after) | `Header/78.png` | `Header/78.png` |
| `routine_1`, `routine_2` (Zenith · Routine steps: Day/Night skin, Washing/Grooming hair) | `Header/78-1.png`, `78-2.png` | `Header/78-1.png`, `78-2.png` |
| `videos` (Video carousel, filter = products of this collection) | `Testimonial/57.png` | `Testimonial/57.png` |
| `guarantee` | `Zenith Guarantee.png` | `Layout/251.png` |
| `money_back` | `Zenith Money Back Guarantee.png` | `CTA/45.png` |
| `reviews` (Judge.me) | `Testimonial/18.png` | `Testimonial/18.png` |
| `faq` | `FAQ/2.png` | `FAQ/2.png` |
| `cta` (Hero, closing; button → this collection) | `Header/6-1.png` | `CTA/6.png` |
| Footer (footer-group) | `Desktop Footer.png` | `Mobile Footer.png` |

Design slips handled: Hair product grid reuses the Skin copy ("Face & Skin Products / The Complete Executive Skin System") → "Hair Products / The Complete Hair Density System"; Hair closing hero "System Build" → "Built". `mobile/sections/Frame 1000005205.png` = phone chrome.

## Verify page map (`design/verify-zenith-products/`, sections 1x, full pages desktop 1x / mobile 2x)
| Section (templates/page.verify.json key) | Desktop (`desktop/sections/`) | Mobile (`mobile/sections/`) |
|---|---|---|
| `verify` (Zenith · Verify product: video left, steps + seal card + couriers right) | `Layout/4.png` | `Layout/4.png` + `Layout/251.png` (right column, stacked) |
| `trust_bar`, `press` (hidden on mobile) | `Trust Bar.png`, `Logo Credentials.png` | — |
| `videos` ("Is Zenith Legit?" on mobile) | `Testimonial/57.png` | `Testimonial/57.png` |
| `locations` (Feature columns: photo beside text) | `Layout/57.png` | `Layout/57.png` |
| `trust` | `CTA/45.png` | `CTA/45.png` |
| `stores`, `pages` (Store links: marketplaces, Facebook pages) | `Ecom Stores.png`, `Ecom Stores-1.png` | `Ecom Stores.png`, `Socials.png` |
| `fda` (Brand story + FDA logo) | `CTA/45-1.png` | `CTA/45-1.png` |
| `faq`, `reviews` | `FAQ/2.png`, `Testimonial/18.png` | same |

## Certificates page map (`design/certificates/`, full pages 2x, sections 1x)
| Section (templates/page.certificates.json key) | Desktop | Mobile |
|---|---|---|
| `business` (Zenith · Certificates, caption below) | `Contact/4.png` | `Contact/4.png` |
| `fda_products` (Zenith · Certificates, details beside; last 4 "Pending") | `Contact/4-1.png` | `Contact/4-1.png` |
| `stores` | `Ecom Stores.png` | `Ecom Stores.png` |
| `notice` (Zenith · Callout box) | `Layout/57.png` | `Layout/57.png` |
| `faq`, `reviews` | `FAQ/2.png`, `Testimonial/18.png` | same |

## Other pages (`design/other-pages/`, full pages only)
- `Blog Index • Desktop.png` + `Blog Post Page • Mobile.png` (= mobile blog index) → `templates/blog.json` (Zenith · Blog + Zenith · Newsletter).
- `Blog Post • Desktop.png` + `Blog Post Page • Mobile (1).png` (= mobile article) → `templates/article.json` (Zenith · Article + Zenith · More articles). Mobile "More Articles" cards say "Add to Cart" — design slip, "Read More" used.
- `policy-template-desktop/mobile.png` → every Shopify policy (Refund / Privacy / Terms / Shipping / Contact info): rendered by `layout/theme.liquid` with `snippets/zenith-doc.liquid` (policies have no templates). Settings: Theme settings → Zenith · Policy pages.
- `Disclaimer • Desktop/Mobile.png` → `templates/page.disclaimer.json` (Zenith · Document page, same snippet, centred column, no contents list).
- `404 • Desktop/Mobile.png` → `templates/404.json` (Zenith · Hero: no image, *Big display text* "404" with gold gradient).
- `Thank You • Desktop/Mobile.png` → `templates/page.thank-you.json`; `Thank You Newsletter • Desktop/Mobile.png` → `templates/page.thank-you-newsletter.json` (both = Zenith · Hero: no image, confetti, icon option).

## Product page — Tallow Cream (`design/Product Page/tallow-cream/`, desktop 1x, mobile full page 2x, mobile sections 1x)
Every product gets its own design in this store, so this is an ALTERNATE template: `templates/product.tallow-cream.json` (assign it to the product in Admin → Products → Theme template). Folder names in the exports are Figma frame names and do not describe the content.

| Section (template key) | Desktop (`desktop/sections/`) | Mobile |
|---|---|---|
| `main` (Zenith · Product page: gallery + thumbnails + review strip, buy box, accordion) | `Header/6.png` | full page `m-00`, `m-01` slices |
| `videos` (Video carousel, this product's videos) | full page y≈1200 | full page; mobile heading differs |
| `ingredients` (Zenith · Ingredients "Why it works differently") | `Layout/1.png` | full page y≈4800–7000 (2x) |
| `difference` (Before & after, 4 cards) | `Header/78.png` | full page |
| `routine` (Routine steps "Two minutes at night", numbered, photo beside text) | `Header/78-1.png` | full page |
| `compare` (Zenith · Comparison table "Why guys switch to Zenith") | `Header/78-2.png` / full page y≈4150 | stacked tables per brand |
| `reviews` (Judge.me) | `Testimonial/18.png` | `Testimonial/18.png` |
| `guarantee` | `Zenith Guarantee.png` | full page |
| `money_back` | `Zenith Money Back Guarantee.png` | full page |
| `faq` | `FAQ/2.png` | `FAQ/2-1.png` |
| `cta` (Hero + trust items, Add to cart) | `CTA/6.png` | `Product Header/2-2.png` |

Desktop/mobile differences: the buy box reorders on phones (quantity + Add to cart move above the FDA bar and the checklist) and shows a short description the desktop hides; the video carousel heading is "Clinically Proven. The Complete Regimen." on desktop and "A Complete Routine, Built for Men." on phones; the accordion rows differ (desktop = 4 product questions, mobile = Description / How to use / What's inside / Zenith guarantee / FAQs — both are in the template, each hidden on the other breakpoint); the ingredient list has 4 items on desktop and 3 longer-titled ones on mobile (desktop copy used, `title_mobile` per item). `mobile/sections/Frame 1000005205.png` is blank.

## Product pages — Shampoo, Spray, Cleanser, Day Cream SPF 30 (`design/Product Page/<Product>/`, desktop 1x, mobile full page 2x, mobile sections 1x)
One alternate template per product, all built on the tallow-cream layout (2026-09-29):

| Product (handle) | Template |
|---|---|
| Zenith Advanced Hair Density Shampoo (`zenith-advanced-hair-density-shampoo`) | `templates/product.hair-density-shampoo.json` |
| Zenith Advanced Hair Density Spray (`zenith-advanced-hair-density-spray`) | `templates/product.hair-density-spray.json` |
| Zenith Anti-Aging Tallow Cleanser (`zenith-anti-aging-tallow-cleanser`) | `templates/product.tallow-cleanser.json` |
| Zenith Anti-Aging Tallow Day Cream SPF 30 (`zenith-anti-aging-tallow-day-cream-spf30`) | `templates/product.day-cream-spf30.json` |

Section order in all four (same keys as tallow, no before/after): `main` (`Header/6.png`; buy box → accordion About / How to use / Ingredients / Delivery and returns / FAQs with nested Question blocks) → `videos` (`Testimonial/57.png`, global slots filtered to the page's product) → `ingredients` (`Layout/1.png`) → `routine` (`Header/78.png`) → `compare` (`Header/78-1.png`, 2 competitors + product name under the logo) → `reviews` (`Testimonial/18.png` = the Judge.me Review Widget) → `guarantee` (`Zenith Guarantee.png`) → `money_back` → `faq` (`FAQ/2.png`) → `cta` (`CTA/6.png`, split hero).

Desktop/mobile differences: the reviews heading on phones is "[customers] Filipino Men Trust Zenith Products" (`heading_mobile`); the guarantee heading is "The Zenith Guarantee" on mobile and the desktop column copy is a shorter rewrite of the global Zenith · Guarantee copy (global kept); the money-back and routine sub-copy differ per breakpoint on some products (desktop used). Mobile ingredient headings on Shampoo/Day Cream are designer placeholders (desktop copy used).

## Adding a new page
Drop the exports in, then ask Claude to run the `design-to-page` skill for that page.
Same layout under `design/<page>/` (`product`, `collection`, `cart`, `about`, `contact`, `global`). Export sections at 1x; full-page export optional.
