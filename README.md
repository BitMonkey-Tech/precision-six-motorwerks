# P6 Motorwerks — site source

Static mirror of the deployed P6 Motorwerks site (celadon-starburst-f0a9f6.netlify.app),
pulled down from the live Netlify deploy since no source repo was previously linked.

`index.html` + `assets/` are the exact built output (Vite/TanStack Start + Tailwind).
`fonts/` holds the LeoTrace / LeoTrace Outline type kit and its `@font-face` stylesheet
(`fonts/leotrace.css`), linked from `index.html` but not yet applied to any element —
swap it in via the `--font-display` / `--font-label` / `--font-body` custom properties
in `assets/index-D637ba7w.css` when ready.

## Local development

Serve from the repo root — routes are directory-based and links use absolute paths,
so opening `index.html` directly won't work:

```bash
python3 -m http.server 4173
```

Home at <http://localhost:4173/>, contact page at <http://localhost:4173/contact/>.
The contact form uses Netlify Forms and only submits when deployed.

In Claude Code, `/preview` runs this for you.

### Editing note

`assets/index-*.js` and `assets/index-*.css` are minified, content-hashed build
artifacts. The generating source is not in this repo, so they can't be regenerated
here — edit them directly and sparingly. Hand-authored HTML in `index.html` /
`contact/index.html` should match the existing minified single-line style.

See `CLAUDE.md` for the full set of conventions.

## Deploy

```bash
netlify deploy --prod
```

`netlify.toml` publishes the project root (`.`) with no build step.
Deployment is moving to Dokploy; this section will be updated when that lands.
