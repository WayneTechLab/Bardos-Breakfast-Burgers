# Bardo's Brand Alignment

Date: 2026-09-22. Mission: BARDOS-BRAND-01, wave 1.

## Sources And Authority

Read the actual ChatGPT conversation, **Branch · Menu in Table Format**:
https://chatgpt.com/g/g-p-6a6c41e518e08191b40f28c9e6fadaee/c/6a6c980c-3d5c-83e8-add1-eece9caf1e1c

Inspected the locally downloaded source materials:

- `/Users/waynetechlab/Downloads/Bardos_BB_Brand_Guidelines_Final_v6.pdf`
  (six-page raster PDF; rendered and visually inspected, including color,
  typography, clear space, minimum size, and incorrect-use pages).
- `/Users/waynetechlab/Downloads/BBB/Bardos_Menu_Design_System_v1.0.0.md`.
- `/Users/waynetechlab/Downloads/BBB/1.png`, `2.png`, and `6.png`
  (generated menu design references, NOT menu data authority).
- `/Users/waynetechlab/Downloads/Bardos_BB_Master_4K.png` compared with the
  existing approved logo in `public/assets/bardos-logo.png`.

The chat's final package explicitly rejects generated draft pages as menu-data
evidence because they contain invented items, descriptions, prices and options.
The frontend continues to use the existing verified menu dataset and published
Firestore records. No names, prices, recipes, descriptions or availability were
changed in this brand pass. No spreadsheet synchronization was added.

## Implemented Design

`src/brand.css` is the shared visual layer loaded after existing functional
styles. It defines the approved primary palette: Bardo Red `#D71920`, Dark Red
`#8B0000`, Gold `#F2C14E`, Cream `#FFF6E6`, Black `#111111`, and White `#FFFFFF`.
Burgundy `#5A0707` is a menu-system supporting shade. Dark red is used for small
text/buttons; gold is primarily decoration or text against black.

- Roboto Slab 800/900 for diner display and section headings.
- Montserrat 700 for uppercase item names; 800 for aligned black prices.
- Source Sans 3 for readable descriptions and operational body text.
- Deep red framing, double gold rules, black ribbons, numbered categories,
  subtle cream stock and dotted price leaders.
- The full menu, search results and browser print use the same real HTML and
  brand tokens. Print pagination reflows for Letter; this is not a claim of a
  press-ready CMYK/bleed package or an identical pagination to the old mockups.
- Home, About, Help, Contact, login, ordering, account and restaurant workspace
  inherit the shared palette and typography. Staff screens retain dense white
  work surfaces; they are not decorated as menu pages.
- Mobile page controls are docked in a black/gold bottom bar with the current
  section name so the button no longer floats over individual menu prices.

The master logo is unchanged, including its original white background. It is
displayed on a white clear-space mount instead of altering its colors or
regenerating the chef. The small navigation crest was removed because the guide
requires a minimum 100px digital mark. Navigation uses ordinary text, not a
replacement script wordmark. The public cover excludes street address, phone,
hours and social links, per the chat. No fabricated food photos were published.

## Generated Asset

Built-in `image_gen` was used, not the fallback CLI. The accepted asset is
`public/assets/brand/menu-paper-v1.png`, a 1536x1024 generated paper texture.
Source: `/Users/waynetechlab/.codex/generated_images/01a0c78f-f8d0-7b31-a387-4709d5ad7fc5/exec-4071c218-afa8-4b27-9b8f-a90790329062.png`.

The original downloaded master remains untouched. Asset SHA-256:

- Logo: `90641c3e85d6af575547de9c7bcf29e1c9e3c239632f9361a27f1ce6f93af546`
- Paper: `568e78ef3c7c32316e2d7431022111800e6fd7ceabd7e55b21800c7f8e5169f4`

### Final Imagegen Prompt

Use case: stylized-concept. Asset type: production raster background for a
Bardo's Breakfast & Burgers responsive website and printable menu.
Input images are STYLE REFERENCES ONLY: the supplied Bardo's burger menu and
brand-guideline palette. Do not reproduce their logo, chef, text, food, page
layouts, or prices.
Create a completely blank, flat, front-facing cream menu paper stock texture.
Full-bleed landscape 3:2 canvas. The entire canvas is only subtly aged, premium
warm cream paper #FFF6E6, with fine low-contrast printed-paper fibers and minute
natural speckling, extremely restrained (3 to 5 percent contrast). Quiet clean
center and edges, evenly lit, consistent lightness throughout. This is vintage
American diner menu stationery, not parchment or rough craft paper. There must
be NO text, NO lettering, NO logo, NO mascot, NO ornaments, NO lines, NO borders,
NO ribbons, NO food, NO shadows, NO mockup table, NO curls, NO damage, NO vignette,
NO stains. It will sit behind editable HTML type and deterministic red/gold
frames. The texture should tile without obvious seams. A single clean paper
texture asset, not a design sheet.

References passed to imagegen: `BBB/1.png` and the rendered palette page 3 of
the brand guide. No application data, credentials or private records were sent.

## Font Provenance

Self-hosted variable Latin WOFF2 files were downloaded from Google Fonts on
2026-09-22, with license files preserved in `public/assets/fonts/`. No external
font requests are needed at runtime.

- https://fonts.google.com/specimen/Roboto+Slab (v36, Apache license)
- https://fonts.google.com/specimen/Montserrat (v31, SIL OFL)
- https://fonts.google.com/specimen/Source+Sans+3 (v19, SIL OFL)

## Verification

Run `npm run test:brand` for logo byte identity, loaded fonts, heading/name/price
colors, 141 live items across 16 categories at 1440/768/390/320px, name/price
overlap checks, screenshots and a complete branded print PDF. Evidence is in
`.SYSTEMX/LAN/Temp/brand/` (local ignored outputs).

Run `npm run test:uiux` for the broader public, owner, employee and member routes,
responsive layouts, accessibility scans, corner navigation, form persistence
and payment-unavailable gating. The backend and security policy are unchanged.
Run `npm run ci:all`, SYSTEMX sync check and deploy preflight for handoff.

This is local design implementation and verification, not production deployment,
business-data approval or professional print certification. The launch gates in
`RESTAURANT-OPERATIONS.md` and `UIUX-ACCEPTANCE.md` still apply.

### Verified Result

Brand acceptance passed, including all 141 variants in 16 categories at all
four widths. The final Letter PDF is five pages, with the advisory/footer kept
together and no extra footer-only page. Desktop/mobile menu, home, contact and
operations screenshots were visually inspected, along with rendered print pages.
The broader 156 responsive route checks, 78 route accessibility scans and eight
record-editor scans passed with zero reported violations or browser exceptions.
CI, build, SYSTEMX sync check, whitespace check and non-deploying release preflight
passed. Backend logic and security rules were not modified in this mission.
