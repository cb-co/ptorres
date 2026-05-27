# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A multi-page marketing site for **Torres Rodriguez Arquitectos** (trarq.com, Santo Domingo, DR). Copy is entirely in Spanish. Five static HTML pages share one external stylesheet and one external script. There is no build step and no framework. External dependencies are Google Fonts (`Cormorant Garamond`, `Jost`) and Unsplash CDN images that are placeholders for real project photography. The one server-side piece is a Vercel serverless function for the contact form (`api/contact.js`).

## File layout

```
ptorres/
├── index.html        # Home (full-bleed hero + section teasers)
├── about.html        # Nosotros: story, philosophy, team
├── gallery.html      # Proyectos: featured project + filterable grid
├── contact.html      # Contact form, info, social, FAQ accordion
├── privacy.html      # Privacy policy (prose)
├── favicon.ico       # Root favicon (TR monogram, walnut on cream)
├── api/
│   └── contact.js    # Vercel serverless fn → emails info@trarq.com (Resend REST)
├── assets/
│   ├── css/styles.css   # ALL styles for every page (single source of truth)
│   ├── js/main.js       # ALL behavior: theme, reveal, gallery filter, FAQ, form
│   ├── img/             # team-portrait.jpg + favicons (16/32/apple-touch)
│   └── brand/torres-rodriguez-brand.pdf   # Source brand document
├── CLAUDE.md
└── .gitignore
```

Every page links `assets/css/styles.css` and `assets/js/main.js` and duplicates the same `<nav>` and `<footer>` markup (no templating — edit nav/footer in all pages together). The active nav item gets `class="is-active"`. When adding real photography, drop files in `assets/img/` and reference them via relative paths; portfolio/Instagram/team images are currently Unsplash CDN URLs (in `styles.css` as `.pp-*` / `.ig-*`, and inline on team/about) to be swapped for client photos.

## Running / previewing

No build step. Serve the directory statically (e.g. `python3 -m http.server`) and visit `/`. The contact form POSTs to `/api/contact`, which only runs on Vercel — locally the form will show its error-fallback state, which is expected. After edits, hard-reload to bypass cache.

## Architecture

- **`assets/css/styles.css`** — all CSS. Driven by CSS custom properties on `:root`. Two theme layers: `:root` defines the **light** palette (default); `[data-theme="dark"]` on `<html>` forces dark. There is **no** `@media (prefers-color-scheme: dark)` — light is the unconditional default; `main.js` sets `data-theme="light"` on load unless the user previously chose dark in localStorage.
- **`assets/js/main.js`** — one IIFE, all guarded with null-checks so it runs on every page. Features: theme toggle, `IntersectionObserver` scroll reveal, gallery category filter, FAQ accordion, and contact-form submit (fetch → `/api/contact`).
- **Pages** — each is plain semantic HTML linking the shared CSS/JS. Home (`index.html`) is a single-scroll overview with section teasers that link out to the dedicated pages.

### Theme toggle
- Reads `localStorage['tr-theme']`. Saved `"dark"` activates dark mode; anything else stays light. The toggle button (`#themeToggle`) flips and persists. Choice carries across pages via localStorage.
   - **Scroll reveal**: an `IntersectionObserver` adds `.visible` to any `.reveal` element when it enters the viewport. Stagger via `.reveal-d1` / `.reveal-d2` / `.reveal-d3`.

## Brand palette (from PDF)

Extracted from `assets/brand/torres-rodriguez-brand.pdf` swatch strip:

| Variable | Hex | Role |
|---|---|---|
| `--bg` | `#F2F0ED` | Page background (cream) |
| `--bg-2` | `#ECE6DA` | Secondary surface |
| `--bg-3` | `#E5DCCB` | Tertiary surface |
| `--surface` | `#CDBEA8` | Light beige / hairlines |
| `--accent-mid` | `#968774` | Mid taupe |
| `--accent` | `#5F4D3E` | Deep walnut (primary accent) |
| `--text` | `#2A2118` | Body text |
| `--text-muted` | `#8B7E6B` | Muted / secondary text |

Dark mode uses warm near-blacks rather than neutral grays to stay within the brand family.

## Logo (TR monogram)

The TR monogram from the PDF is embedded as a base64 PNG in the CSS custom property `--logo-mark` on `:root`, applied via CSS masking:

```css
.logo-mark {
  width: 40px; height: 40px;
  background-color: var(--accent);
  -webkit-mask: var(--logo-mark) center / contain no-repeat;
          mask: var(--logo-mark) center / contain no-repeat;
}
```

This makes the monogram recolorable — it inherits `--accent` and adapts to dark mode without needing a separate asset. Do not replace `--logo-mark` with a plain `background-image`; that would break theme adaptability.

## Section pattern

```html
<div class="reveal">
  <span class="section-index">i — Label</span>
  <h2 class="section-title">Headline with <em>italic accent</em></h2>
</div>
```

`.section-index` is a small italic Cormorant marker (`i —`, `ii —`, etc.). `.section-title` is the large display headline with `<em>` for the italic walnut accent.

## Hero

Full-bleed background image (Unsplash interior placeholder) with a vertical dark gradient overlay for text legibility. Typography is centered: small uppercase eyebrow → large Cormorant company name (`Torres Rodriguez Arquitectos`) → italic Cormorant tagline → underlined CTA. A pulsing 1px vertical line at the bottom acts as a scroll cue. All hero text is light cream over the dark overlay.

To swap the hero image, change the `background:` URL in the `.hero` rule. Match the overlay strength to the new photo's luminance — a bright photo needs a heavier overlay, a dark photo needs a lighter one.

## Portfolio / projects

The home `#projects` teaser shows 3 projects in a 6-col grid (one `.project.is-feature` spanning all 6 at 16:7, two span-3 at 4:5). Project images come from `.pp-1`…`.pp-9` rules in `styles.css` (Unsplash placeholders). `.project-img::before` does the hover zoom + saturation; `.project-meta`'s hairline `border-top` turns `--accent` on hover. To use real photos, repoint the `.pp-*` rules at files under `assets/img/`.

## Gallery page (`gallery.html`)

A `page-hero` header, a single always-visible featured project, a category filter bar, then a filterable uniform grid of 8 projects. Each grid `.project` carries `data-category` (`residencial` / `interiores` / `comercial` / `hospitalidad`); the filter buttons carry `data-filter`. `main.js` toggles `.is-hidden`. Gallery project tiles are non-clickable `div.project-link` (no detail pages exist yet), so there are no dead links.

## About page (`about.html`)

Story (`.about` 2-col), philosophy quote (`.philosophy`), and a 3-member `.team` grid. Team photos are set inline on `.team-photo-img` (`background-image`); the principal uses the local `assets/img/team-portrait.jpg`, the others are Unsplash placeholders. Hover lifts grayscale + scales.

## Contact page + form (`contact.html`, `api/contact.js`)

Two-column layout: info column (email/phone/address + social icons) and a styled form (`#contactForm`, underline-only fields). On submit, `main.js` prevents default, POSTs JSON to the form `action` (`/api/contact`), and shows a success/error status. `api/contact.js` is a Vercel serverless function that emails `info@trarq.com` via the Resend REST API (native `fetch`, no npm deps) — set `RESEND_API_KEY` (and verify a sending domain) in Vercel env to go live. An FAQ accordion (`.faq-item` + `.faq-q`/`.faq-a`) is toggled by `main.js`; answers are placeholders (`[Contenido por definir]`).

## Favicon

`favicon.ico` (root) + `assets/img/favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png` are the TR monogram in walnut (`#5F4D3E`) on cream (`#F2F0ED`), generated from the same base64 monogram used for `--logo-mark`. All pages link them in `<head>`.

## Instagram (`#instagram`)

Two-column layout: copy block on the left, 2×2 grid of square tiles (`.ig-1`–`.ig-4`, Unsplash placeholders) on the right. **To make the feed live**, drop a free widget into `.insta-grid` — Behold.so (free, no watermark), SnapWidget, or LightWidget. A comment in `index.html` above `.insta-grid` notes this.

## Instagram (`#instagram`)

Two-column layout: copy block on the left (section title, sub-paragraph, `@ptorres.rodriguez` link), 2×2 grid of square tiles on the right. Tiles currently use Unsplash placeholders via `.ig-1`–`.ig-4`. Each tile links to the Instagram profile.

**To make the feed live**: drop a free Instagram widget into the `.insta-grid`. Best options:
- **Behold.so** — free up to 50K monthly views, no watermark, modern dashboard.
- **SnapWidget** — free with a small watermark.
- **LightWidget** — free with a small watermark.

There's a comment in `index.html` above `.insta-grid` listing these options.

## Scroll reveal

Add class `reveal` to any element. Optionally add `reveal-d1`, `reveal-d2`, or `reveal-d3` for staggered delay. The IntersectionObserver in `main.js` adds `.visible` when the element enters the viewport. `prefers-reduced-motion` disables reveals and the scroll-cue animation.

## Conventions

- All content/copy is in Spanish.
- Styles live ONLY in `assets/css/styles.css`; behavior ONLY in `assets/js/main.js`. Don't reintroduce inline `<style>`/`<script>` blocks.
- `<nav>` and `<footer>` are duplicated per page — when you change one, change all five. Set `is-active` on the current page's nav link.
- Animations and reveals: `.reveal` + `.reveal-dN` — don't introduce a new system.
- Do not use `@media (prefers-color-scheme: dark)` — light is the unconditional default. Use `[data-theme="dark"]` selectors only.
- When changing palette colors, update both `:root` (light) and `[data-theme="dark"]` blocks together.
- Real images go under `assets/img/` and are referenced with relative paths (no leading slash).
- Placeholders to replace before launch: FAQ answers, phone/address, team names/bios, Facebook/Pinterest URLs (Instagram handle `@ptorres.rodriguez` is real), and all Unsplash images.
