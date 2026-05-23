# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page marketing site for **Torres Rodriguez Arquitectos** (trarq.com, Santo Domingo, DR). Copy is entirely in Spanish. The page is one self-contained `index.html` with all CSS and JS inlined. There is no build step, no package manager, and no framework. External dependencies are Google Fonts (`Cormorant Garamond`, `Jost`) and Unsplash CDN images that are placeholders for real project photography.

## File layout

```
ptorres/
├── index.html                    # Single-file site (HTML + inline CSS + inline JS)
├── CLAUDE.md
├── assets/
│   ├── brand/
│   │   └── torres-rodriguez-brand.pdf   # Source brand document (palette + monogram)
│   └── img/
│       └── team-portrait.jpg            # Local image used in #about section
```

When adding real photography, drop files in `assets/img/` and reference them via relative paths (e.g. `assets/img/residencia-aguamar.jpg`). The current portfolio and Instagram tile images are temporary Unsplash CDN URLs — they should be swapped for client-supplied photos.

## Running / previewing

There is no build or dev server. Open `index.html` directly, or serve the directory statically (e.g. `python3 -m http.server`) and visit `/index.html`. After edits, hard-reload to bypass cache.

## Architecture

Everything lives in `index.html` in three blocks:

1. **`<style>`** — all CSS. Driven by CSS custom properties on `:root` (palette, surfaces, borders). The theme system has two layers:
   - `:root` defines the **light** palette (default).
   - `[data-theme="dark"]` on `<html>` forces dark mode.
   - There is no `@media (prefers-color-scheme: dark)` — light is the unconditional default. The JS sets `data-theme="light"` on page load unless the user previously chose dark in localStorage.

2. **`<body>`** — sections in order: `nav`, `hero`, `#about`, `#projects`, `#studio`, `#instagram`, `#contact`, `footer`. The hero uses a full-bleed Unsplash interior photo with dark gradient overlay and light typography centered over it. `#about` is a 2-col layout (portrait image + text). Portfolio uses a 6-column CSS grid with one feature project spanning all 6 cols.

3. **`<script>`** — two small features, no dependencies:
   - **Theme toggle**: reads `localStorage['tr-theme']`. Saved `"dark"` activates dark mode; anything else stays light. Click `#themeToggle` flips and persists.
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

## Portfolio (`#projects`)

6-column CSS grid with 3 projects. The first uses `.project.is-feature` to span all 6 cols at 16:7 aspect ratio. The two regular projects span 3 cols each (2 per row) at 4:5 portrait aspect. The `.project-img` element uses a `::before` pseudo-element with `filter: saturate()` for hover zoom + subtle saturation shift. Metadata (`.project-meta`) sits below the image with a hairline `border-top` that transitions to `--accent` color on hover.

To replace placeholder images: edit the `.pp-1`, `.pp-2`, `.pp-3` rules to point at local files under `assets/img/`.

## Instagram (`#instagram`)

Two-column layout: copy block on the left (section title, sub-paragraph, `@ptorres.rodriguez` link), 2×2 grid of square tiles on the right. Tiles currently use Unsplash placeholders via `.ig-1`–`.ig-4`. Each tile links to the Instagram profile.

**To make the feed live**: drop a free Instagram widget into the `.insta-grid`. Best options:
- **Behold.so** — free up to 50K monthly views, no watermark, modern dashboard.
- **SnapWidget** — free with a small watermark.
- **LightWidget** — free with a small watermark.

There's a comment in `index.html` above `.insta-grid` listing these options.

## Scroll reveal

Add class `reveal` to any element. Optionally add `reveal-d1`, `reveal-d2`, or `reveal-d3` for staggered delay. The IntersectionObserver in `<script>` adds `.visible` when the element enters the viewport.

## Conventions

- All content/copy is in Spanish.
- Animations and reveals: `.reveal` + `.reveal-dN` — don't introduce a new system.
- Do not use `@media (prefers-color-scheme: dark)` — it has been removed from the theme system. Use `[data-theme="dark"]` selectors only.
- When changing palette colors, update both `:root` (light) and `[data-theme="dark"]` blocks together.
- Real images go under `assets/img/` and are referenced with relative paths (no leading slash).
