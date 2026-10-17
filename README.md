# harness-site

Sales page for a fixed-price Claude Code harness setup. Live at https://harness.omardev.xyz (English) and https://harness.omardev.xyz/nl/ (Dutch). Second offer page, an AI agent on company data: https://harness.omardev.xyz/agents/ and /nl/agents/.

## Build

```sh
npm ci
npm run dev                         # writes the pages, starts Vite
npm run build                       # writes the pages, builds dist/
node scripts/keyframes.mjs          # renders public/keyframes/ (stills of each 3D moment). Needs Google Chrome.
npm run og                          # renders public/og-*.png and the favicon set. Needs Google Chrome.
npm run check -- <url>              # checks horizontal scroll, tap targets, console errors and a drawn canvas at 5 widths
node scripts/shots.mjs <url> <dir>  # screenshots of each scene at 390x844 and 1440x900
```

- `content/en.mjs`, `content/nl.mjs`: all copy of the home page. `content/agents-en.mjs`, `content/agents-nl.mjs`: all copy of `/agents/`.
- `scripts/agents.mjs`: renders `agents/index.html` and `nl/agents/index.html`. `src/agents.ts`, `src/agents.css`: its behaviour and styles.
- `scripts/og-agents.mjs <url>`: renders `public/og-agents-*.png` from a running preview.
- `scripts/pages.mjs`: writes `index.html`, `nl/index.html`, `public/sitemap.xml`, `public/robots.txt` and `public/CNAME`.
- `src/stage/timeline.js`: the scenes, their scroll lengths, the terminal replay and the pose of every 3D moment at each scroll position.
- `src/stage/objects.js`: the 3D objects. `src/stage/world.js`: the five moments and their motion. `src/stage/stage.js`: renderer, light and framing.
- `src/main.ts`: the scroll timeline for the copy, and the WebGL boot on first input.
- `tools/still.html`: renders one still of the 3D at a story time, for the keyframe and Open Graph scripts.
- `DESIGN.md`: the scene list, what each scene must make the visitor believe, and the exemplar it stands beside.

Run `node scripts/keyframes.mjs` again after a change to `src/stage/`. The stills are the hero poster and the reduced-motion version of each scene.

GitHub Actions deploys to GitHub Pages on every push to `main`.
