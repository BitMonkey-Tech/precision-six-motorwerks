# P6 Motorwerks — site source

Static mirror of the deployed P6 Motorwerks site (celadon-starburst-f0a9f6.netlify.app),
pulled down from the live Netlify deploy since no source repo was previously linked.

`index.html` + `assets/` are the exact built output (Vite/TanStack Start + Tailwind).
`fonts/` holds the LeoTrace / LeoTrace Outline type kit and its `@font-face` stylesheet
(`fonts/leotrace.css`), linked from `index.html` but not yet applied to any element —
swap it in via the `--font-display` / `--font-label` / `--font-body` custom properties
in `assets/index-D637ba7w.css` when ready.

## Deploy

```bash
netlify deploy --prod
```

`netlify.toml` publishes the project root (`.`) with no build step.
