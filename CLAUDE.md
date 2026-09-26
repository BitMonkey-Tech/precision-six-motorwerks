# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A **static, pre-built mirror** of the P6 Motorwerks marketing site (independent Porsche specialist, Fort Myers FL). The files here (`index.html`, `contact/`, `assets/`) are the compiled output of an upstream **Vite + TanStack Start + Tailwind CSS v4** app. That source project is **not in this repo** — there is no `package.json`, no build step, nothing to `npm install`. Edits are made directly to the built files.

## Editing rules

- **Do not hand-edit `assets/index-*.js` or `assets/index-*.css`.** They are minified, content-hashed build artifacts and cannot be regenerated here. If a change truly requires touching them, flag it and confirm first.
- HTML in `index.html` and `contact/index.html` is minified single-line output — match that style when editing.
- Styling is **Tailwind utility classes**, often with arbitrary values (e.g. `bg-[#0c0c0d]`, `tracking-[0.5em]`). The contact form is the exception: its styles live in a page-scoped `<style>` block in `contact/index.html`.
- Routes are directory-based (`/contact` → `contact/index.html`) and links use absolute paths, so pages only work when served from the web root.

## Copy style

- **No em dashes, en dashes, or hyphens used as sentence punctuation anywhere in visible site copy** (headings, body text, meta descriptions, structured data text). Use a comma or a period instead, restructuring the sentence if needed.
- Compound words that would normally take a hyphen (e.g. "factory-trained", "air-cooled", "check-engine light") are written as open compounds instead — drop the hyphen, keep it as two words (e.g. "factory trained", "air cooled", "check engine light").
- Exceptions: genuine proper nouns that are hyphenated as part of their real name (e.g. the *Magnuson-Moss* Warranty Act) — don't alter those. Hours/day ranges (e.g. "Mon–Fri", "9:00 AM–5:00 PM") are also fine with an en dash — the user has explicitly allowed this one case. Technical strings (URLs, file paths, CSS class names, phone `tel:` links, HTML/CSS attribute values like `device-width`) are never in scope — this rule is about prose only.
- The visible phone number is written with a space instead of a hyphen: `(239) 208 3140`.

## Brand tokens

- Palette: backgrounds `#0c0c0d` / `#131313` / `#161616`, text `#ece9e4`, muted `#a29e97`, accent red `#c23b2c` (hover `#a6301f` / `#e0523f`).
- Fonts via CSS custom properties in `assets/index-D637ba7w.css`, used through Tailwind classes `font-display` / `font-label` / `font-body`:
  - `--font-display: "LeoTrace", "Oswald", system-ui, sans-serif`
  - `--font-label: "Oswald", system-ui, sans-serif`
  - `--font-body: "Archivo", system-ui, sans-serif`
- The `fonts/leotrace.css` kit is linked but not yet activated — `--font-display` still resolves to Oswald until swapped.
- The company name appears intentionally as both **"P6 Motorwerks"** and **"Precision Six Motorwerks"**; both are correct.

## Local preview

```
python3 -m http.server 4173
```

Run from the repo root (or use `/preview`). The contact form uses **Netlify Forms** and only submits when deployed — it will not work in local preview.

## Git

Work on a feature branch off `main` and open a PR; do not commit directly to `main`.

## Deployment

In flux (currently Netlify, moving to Dokploy). Do not run deploy commands unless asked; this section will be updated later.
