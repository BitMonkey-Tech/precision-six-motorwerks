# P6 Motorwerks — site source

Static mirror of the deployed P6 Motorwerks site (celadon-starburst-f0a9f6.netlify.app),
pulled down from the live Netlify deploy since no source repo was previously linked.

The site is three static pages: `index.html` (Home), `services/index.html` (Services),
and `contact/index.html` (Contact, plus `contact/thank-you/` after form submit). They
share the stylesheet in `assets/` and the vanilla nav script `assets/site.js`.

`assets/index-D637ba7w.css` is built output (Vite/TanStack Start + Tailwind); the
home page's original React bundle was removed since the prerendered HTML is complete.
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

## SEO / crawling

`robots.txt` and `sitemap.xml` (repo root) both assume the production domain is
`precisionsixmotorwerks.com` — update both if that ever changes. Each page carries
a canonical link, Open Graph/Twitter meta tags, and `AutoRepair` + `FAQPage`
JSON-LD (schema.org structured data) with the shop's name/address/phone/hours;
`contact/thank-you/` is marked `noindex` since it's a form-confirmation page with
no content worth ranking.

The `sameAs` array in each `AutoRepair` JSON-LD block is empty — add the Google
Business Profile URL there (and any Facebook/Instagram/Yelp listing URLs) once
you have it, in `index.html`, `services/index.html`, and `contact/index.html`.
This is what actually links the site to the Business Profile in Google's eyes;
consistent name/address/phone across the site and the listing itself matters
more for local ranking than any single technical tweak here.

Once live: verify the domain in [Google Search Console](https://search.google.com/search-console)
and submit `sitemap.xml` there — that's what gets the site crawled and indexed,
separately from the Business Profile.

## Deploy

```bash
netlify deploy --prod
```

`netlify.toml` publishes the project root (`.`) with no build step.
Deployment is moving to Dokploy; this section will be updated when that lands.
