# Design sources

Design exports live here so any session (any device, any agent) can read them. Images pasted into a chat are **not** saved — only files in this repo survive.
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

## Adding a new page
Drop the exports in, then ask Claude to run the `design-to-page` skill for that page.
Same layout under `design/<page>/` (`product`, `collection`, `cart`, `about`, `contact`, `global`). Export sections at 1x; full-page export optional.
