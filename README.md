# harness-site

Sales page for a fixed-price Claude Code harness setup. Live at https://harness.omardev.xyz (English) and https://harness.omardev.xyz/nl/ (Dutch).

## Build

```sh
npm ci
npm run dev      # writes the pages, starts Vite
npm run build    # writes the pages, builds dist/
npm run og       # renders public/og-*.png and the favicon set (needs Google Chrome)
```

- `content/en.mjs`, `content/nl.mjs`: all copy. `content/readouts.mjs`: live figure readouts.
- `figures/*-model.mjs`: geometry and motion of each isometric figure, built with the vendored anatomy kit in `vendor/anatomy/` (MIT).
- `scripts/pages.mjs`: writes `index.html`, `nl/index.html`, `public/sitemap.xml`, `public/robots.txt` and `public/CNAME`.
- `src/live/*.js`: the live behaviour of the figures in the browser.
- `DESIGN.md`: the section list, what each section must make the visitor believe, and the exemplar it stands beside.

GitHub Actions deploys to GitHub Pages on every push to `main`.
