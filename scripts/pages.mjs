// Writes index.html (EN) and nl/index.html (NL) from content/*.mjs, plus sitemap, robots and CNAME.
// Vite then bundles them. Run before `vite` and `vite build`.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import en from "../content/en.mjs";
import nl from "../content/nl.mjs";
import agentsEn from "../content/agents-en.mjs";
import agentsNl from "../content/agents-nl.mjs";
import { renderAgents } from "./agents.mjs";
import { TOTAL, TERM, STILLS } from "../src/stage/timeline.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://harness.omardev.xyz";
const EMAIL = "omarnassar1127@gmail.com";
const X_HANDLE = "GodelTrabuco69";
const LINKEDIN_URL = "https://www.linkedin.com/in/omar-nassar-ai/";
const PRICE = 1500;

// Label positions on the exploded still (fractions of the image), written by scripts/keyframes.mjs.
const metaFile = join(ROOT, "public/keyframes/meta.json");
const META = existsSync(metaFile) ? JSON.parse(readFileSync(metaFile, "utf8")) : { parts: [] };

const esc = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Kinetic type: wrap each word (or each character) in a mask, so GSAP can lift them in one by one.
const words = (text) => esc(text).split(" ").map((w) => `<span class="w"><span class="wi">${w}</span></span>`).join(" ");
const chars = (text) => [...text].map((c) => (c === "\u00a0" ? " " : `<span class="w"><span class="wi">${esc(c)}</span></span>`)).join("");
const mailto = (t) => `mailto:${EMAIL}?subject=${encodeURIComponent(t.mail.subject)}&body=${encodeURIComponent(t.mail.body)}`;

function jsonLd(t, url) {
  const person = {
    "@type": "Person",
    "@id": `${SITE}/#omar`,
    name: "Omar Nassar",
    jobTitle: "AI engineer",
    email: `mailto:${EMAIL}`,
    sameAs: [LINKEDIN_URL],
    knowsAbout: ["Claude Code", "AI agents", "Agent evaluation", "Developer tooling"],
  };
  const offer = {
    "@type": "Offer",
    price: String(PRICE),
    priceCurrency: "EUR",
    priceSpecification: { "@type": "PriceSpecification", minPrice: PRICE, priceCurrency: "EUR" },
    url,
    availability: "https://schema.org/InStock",
    description: t.price.note,
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "ProfessionalService",
        "@id": `${SITE}/#business`,
        name: "Omar Nassar, Claude Code harness setup",
        url: SITE + "/",
        description: t.meta.description,
        email: EMAIL,
        founder: { "@id": `${SITE}/#omar` },
        priceRange: t.lang === "nl" ? "vanaf € 1.500" : "from €1,500",
        areaServed: "Worldwide",
        knowsLanguage: ["en", "nl"],
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: t.meta.title.split(" | ")[0],
        serviceType: "Claude Code harness setup",
        description: t.meta.description,
        provider: { "@id": `${SITE}/#business` },
        offers: offer,
        inLanguage: t.lang,
      },
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: t.meta.title,
        description: t.meta.description,
        inLanguage: t.lang,
        about: { "@id": `${url}#service` },
        primaryImageOfPage: `${SITE}/og-${t.lang}.png`,
      },
    ],
  };
}

function head(t, other) {
  const url = SITE + t.path;
  const otherUrl = SITE + other.path;
  const og = `${SITE}/og-${t.lang}.png`;
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t.meta.title)}</title>
<meta name="description" content="${esc(t.meta.description)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="${t.lang}" href="${url}">
<link rel="alternate" hreflang="${other.lang}" href="${otherUrl}">
<link rel="alternate" hreflang="x-default" href="${SITE}/">
<meta name="theme-color" content="#f4f4f2">
<meta name="color-scheme" content="light">
<meta name="author" content="Omar Nassar">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/newsreader-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/mona-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="/keyframes/hero-1200.webp" imagesrcset="/keyframes/hero-640.webp 640w, /keyframes/hero-1200.webp 1200w" imagesizes="(max-aspect-ratio: 9/10) 120vw, 90vh" media="(prefers-reduced-motion: no-preference)" fetchpriority="high">
<script>if(matchMedia("(prefers-reduced-motion: no-preference)").matches&&"WebGLRenderingContext"in window)document.documentElement.classList.add("motion")</script>
<meta property="og:type" content="website">
<meta property="og:site_name" content="Omar Nassar">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(t.meta.title)}">
<meta property="og:description" content="${esc(t.meta.description)}">
<meta property="og:image" content="${og}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(t.meta.ogAlt)}">
<meta property="og:locale" content="${t.locale}">
<meta property="og:locale:alternate" content="${other.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:creator" content="@${X_HANDLE}">
<meta name="twitter:title" content="${esc(t.meta.title)}">
<meta name="twitter:description" content="${esc(t.meta.description)}">
<meta name="twitter:image" content="${og}">
<meta name="twitter:image:alt" content="${esc(t.meta.ogAlt)}">
<script type="application/ld+json">${JSON.stringify(jsonLd(t, url)).replace(/</g, "\\u003c")}</script>`;
}

const cta = (t, extra = "") => `<a class="btn btn-primary${extra}" href="${esc(mailto(t))}">${esc(t.cta)}</a>`;

/** A keyframe still of the object, shown when the page runs without motion. */
function still(name, alt) {
  return `<img class="still" src="/keyframes/${name}-1200.webp" srcset="/keyframes/${name}-640.webp 640w, /keyframes/${name}-1200.webp 1200w" sizes="(min-width: 768px) 560px, 92vw" width="1200" height="1200" alt="${esc(alt)}" loading="lazy" decoding="async">`;
}

function body(t, other) {
  const [line1, lead, em] = t.hero.title;
  const term = TERM.map(
    (line, i) => `<span class="term-line" data-line="${i}">${line.seg.map(([text, cls]) => `<span${cls ? ` class="t-${cls}"` : ""}>${esc(text)}</span>`).join("")}</span>`,
  ).join("");
  const labels = t.parts.labels
    .map((label, i) => {
      const a = META.parts[i];
      const style = a ? ` style="--sx:${(a.x * 100).toFixed(1)}%;--sy:${(a.y * 100).toFixed(1)}%;--ty:${a.below ? "0%" : "-100%"}"` : "";
      return `<li class="label" data-label="${i}"${style}><span>${esc(label)}</span></li>`;
    })
    .join("");
  const cards = t.incidents.items
    .map(
      (item, i) => `<li class="card" data-card="${i}"><p class="card-meta"><time datetime="${item.date}">${item.date}</time><span>${esc(item.area)}</span></p><p class="card-line">${esc(item.line)}</p></li>`,
    )
    .join("");
  const scope = t.price.scope.map((word) => `<li>${esc(word)}</li>`).join("");
  const copyButton = `<button type="button" class="btn btn-quiet" data-copy="${EMAIL}" data-copied="${esc(t.book.copied)}"><span>${esc(t.book.copy)}</span></button>`;

  return `<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="nav-wrap">
<nav class="nav" aria-label="${esc(t.nav.main)}">
<a class="wordmark" translate="no" href="${t.path}" aria-label="${esc(t.nav.home)}">Omar Nassar</a>
<div class="nav-end">
<a class="lang" href="${other.path}" hreflang="${other.lang}" lang="${other.lang}" aria-label="${esc(t.nav.switchLabel)} (${esc(t.nav.switchShort)})">${esc(t.nav.switchShort)}</a>
${cta(t, " btn-small")}
</div>
</nav>
</header>
<main id="main">
<div class="story" style="--total:${TOTAL}">
<div class="stage">
<div class="object" aria-hidden="true">
<img class="poster" src="/keyframes/hero-1200.webp" srcset="/keyframes/hero-640.webp 640w, /keyframes/hero-1200.webp 1200w" sizes="(max-aspect-ratio: 9/10) 120vw, 90vh" width="1200" height="1200" alt="" fetchpriority="high" decoding="async">
<canvas class="gl" width="1" height="1"></canvas>
</div>

<section class="scene" id="hero" data-scene="hero" aria-labelledby="hero-title">
<div class="copy copy-top">
<h1 id="hero-title" class="display-1" data-a="title"><span class="line">${words(line1)}</span> <span class="line">${words(lead)} <em>${words(em)}</em></span></h1>
</div>
${still("hero", t.stillAlt)}
<div class="copy copy-bottom" data-a="sub">
<p class="sub">${esc(t.hero.sub)}</p>
<div class="actions">${cta(t)}</div>
</div>
</section>

<section class="scene" id="catch" data-scene="catch" aria-labelledby="catch-title">
<div class="copy copy-top">
<h2 id="catch-title" class="display-2" data-a="title">${words(t.catch.title)}</h2>
<p class="sub" data-a="sub">${esc(t.catch.sub)}</p>
</div>
${still("catch", t.catch.alt)}
</section>

<section class="scene" id="parts" data-scene="parts" aria-labelledby="parts-title">
<div class="copy copy-top">
<h2 id="parts-title" class="display-2" data-a="title">${words(t.parts.title)}</h2>
</div>
<div class="still-wrap">${still("parts", t.parts.alt)}<ol class="labels">${labels}</ol></div>
<div class="copy copy-bottom" data-a="sub"><p class="sub">${esc(t.parts.sub)}</p></div>
</section>

<section class="scene" id="replay" data-scene="replay" aria-labelledby="replay-title">
<div class="replay-grid">
<div class="copy">
<h2 id="replay-title" class="display-2" data-a="title">${words(t.replay.title)}</h2>
<p class="sub" data-a="sub">${esc(t.replay.sub)}</p>
</div>
<figure class="term" data-a="term" aria-label="${esc(t.replay.aria)}">
<p class="term-bar"><span>2026-09-03</span><span>replay</span></p>
<pre class="term-body" translate="no">${term}</pre>
</figure>
</div>
${still("replay", t.replay.alt)}
</section>

<section class="scene" id="incidents" data-scene="incidents" aria-labelledby="incidents-title">
<div class="copy copy-top">
<h2 id="incidents-title" class="display-2" data-a="title">${words(t.incidents.title)}</h2>
</div>
<ol class="cards">${cards}</ol>
</section>

<section class="scene" id="price" data-scene="price" aria-labelledby="price-title">
<div class="copy price-copy">
<h2 id="price-title" class="price" data-a="price"><span class="price-from">${words(t.price.from)}</span> <span class="price-amount">${chars(t.price.amount)}</span></h2>
<ul class="scope" data-a="scope" aria-label="${esc(t.price.note)}">${scope}</ul>
</div>
${still("price", t.price.alt)}
</section>

<section class="scene" id="book" data-scene="book" aria-labelledby="book-title">
<div class="copy copy-top">
<h2 id="book-title" class="display-2" data-a="title">${words(t.book.title)}</h2>
<p class="sub">${esc(t.book.sub)}</p>
<div class="actions">${cta(t)}${copyButton}</div>
<p class="xline"><a href="${LINKEDIN_URL}" rel="me noopener">${esc(t.book.x)}</a></p>
</div>
${still("book", t.book.alt)}
</section>
</div>
</div>
</main>
<footer class="footer">
<div class="footer-row">
<p>${esc(t.footer.line)}</p>
<p class="footer-links"><a href="${esc(mailto(t))}">${esc(t.book.emailMe)}</a><a href="${LINKEDIN_URL}" rel="me noopener">LinkedIn</a><a href="${t.agents.path}">${esc(t.agents.label)}</a><a href="${other.path}" hreflang="${other.lang}" lang="${other.lang}">${esc(t.nav.switchLabel)}</a></p>
</div>
</footer>
<div class="sr-only" aria-live="polite" data-copy-status></div>
<script type="module" src="/src/main.ts"></script>`;
}

function page(t, other) {
  return `<!doctype html>
<html lang="${t.lang}">
<head>
${head(t, other)}
</head>
<body>
${body(t, other)}
</body>
</html>
`;
}

writeFileSync(join(ROOT, "index.html"), page(en, nl));
mkdirSync(join(ROOT, "nl"), { recursive: true });
writeFileSync(join(ROOT, "nl/index.html"), page(nl, en));
const shared = { SITE, EMAIL, LINKEDIN_URL };
mkdirSync(join(ROOT, "agents"), { recursive: true });
writeFileSync(join(ROOT, "agents/index.html"), renderAgents(agentsEn, agentsNl, shared));
mkdirSync(join(ROOT, "nl/agents"), { recursive: true });
writeFileSync(join(ROOT, "nl/agents/index.html"), renderAgents(agentsNl, agentsEn, shared));

// Sitemap with the language pair, and robots.txt.
const today = new Date().toISOString().slice(0, 10);
const entry = (t, other, xDefault = "/") => `  <url>
    <loc>${SITE}${t.path}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="${t.lang}" href="${SITE}${t.path}"/>
    <xhtml:link rel="alternate" hreflang="${other.lang}" href="${SITE}${other.path}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${xDefault}"/>
  </url>`;
mkdirSync(join(ROOT, "public"), { recursive: true });
writeFileSync(
  join(ROOT, "public/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entry(en, nl)}
${entry(nl, en)}
${entry(agentsEn, agentsNl, "/agents/")}
${entry(agentsNl, agentsEn, "/agents/")}
</urlset>
`,
);
writeFileSync(join(ROOT, "public/robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
writeFileSync(join(ROOT, "public/CNAME"), "harness.omardev.xyz\n");
console.log("pages: index.html, nl/index.html, agents/index.html, nl/agents/index.html, sitemap.xml, robots.txt, CNAME");
