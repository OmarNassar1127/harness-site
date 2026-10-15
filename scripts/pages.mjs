// Writes index.html (EN) and nl/index.html (NL) from content/*.mjs, plus the kit CSS.
// Vite then bundles them. Run before `vite` and `vite build`.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import en from "../content/en.mjs";
import nl from "../content/nl.mjs";
import * as k from "../vendor/anatomy/iso-kit.mjs";
import * as G from "../figures/gate-model.mjs";
import { HELD_POSE } from "../src/live/gate.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://harness.omardev.xyz";
const EMAIL = "omar.portero.nassar1@gmail.com";
const X_HANDLE = "GodelTrabuco69";
const X_URL = `https://x.com/${X_HANDLE}`;
const PRICE = 1500;

const C = await import("../figures/canary-model.mjs").catch(() => null);

mkdirSync(join(ROOT, "src/generated"), { recursive: true });
writeFileSync(join(ROOT, "src/generated/iso.css"), k.ISO_CSS);

const esc = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const mailto = (t) => `mailto:${EMAIL}?subject=${encodeURIComponent(t.mail.subject)}&body=${encodeURIComponent(t.mail.body)}`;

function plate({ id, t, svg, readout }) {
  const corner = (name, text, extra = "") => `<span class="iso-plate-corner" data-corner="${name}"${extra}>${esc(text)}</span>`;
  const keys = t.keys
    .map((key) => {
      const body = key.mark === "lit" ? "M2 4.5 8 1.5 14 4.5 14 6 8 9 2 6Z" : "M2 4.5 8 1.5 14 4.5 14 6 8 9 2 6Z";
      return `<span class="iso-key"><svg class="iso-swatch" data-mark="${key.mark}" viewBox="0 0 16 10" aria-hidden="true"><path d="${body}"/><path class="iso-swatch-crease" d="M2 4.5 8 7.5 14 4.5"/></svg>${esc(key.label)}</span>`;
    })
    .join("");
  return `<figure class="iso iso-figure" data-theme="light" data-figure="${id}">
<div class="iso-plate">
<div class="iso-plate-corners" aria-hidden="true">${corner("fig", t.fig)}${corner("title", t.title)}${corner("hint", t.hint)}${corner("readout", readout, " data-readout")}</div>
<div class="iso-stage" tabindex="0" role="button" aria-label="${esc(t.aria)}">${svg}</div>
<div class="sr-only" aria-live="polite" data-announce></div>
</div>
<figcaption class="iso-legend"><span class="iso-keys">${keys}</span><span class="iso-caption">${esc(t.caption)}</span></figcaption>
</figure>`;
}

function jsonLd(t, url) {
  const person = {
    "@type": "Person",
    "@id": `${SITE}/#omar`,
    name: "Omar Nassar",
    jobTitle: "AI engineer",
    email: `mailto:${EMAIL}`,
    sameAs: [X_URL],
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

const ctaButton = (t, extra = "") => `<a class="btn btn-primary${extra}" href="${esc(mailto(t))}">${esc(t.cta)}</a>`;

function body(t, other) {
  const [line1, lead, em] = t.hero.title;
  const gateSvg = G.figure(HELD_POSE);
  const gate = plate({ id: "gate", t: t.gate, svg: gateSvg, readout: t.gate.readout.held(3) });
  const canary = C ? plate({ id: "canary", t: t.canary, svg: C.figure(C.REST_POSE), readout: t.canary.readout.pass }) : "";
  const install = t.install.items
    .map((item) => `<li class="part"><h3 class="part-name">${esc(item.name)}</h3><p>${esc(item.body)}</p></li>`)
    .join("");
  const incidents = t.incidents.items
    .map(
      (item) => `<article class="incident">
<p class="incident-meta"><time datetime="${item.date}">${item.date}</time><span>${esc(item.area)}</span></p>
<div class="incident-body">
<h3 class="incident-title">${esc(item.title)}</h3>
<dl class="incident-fields">
<div><dt>${esc(t.incidents.labels.broke)}</dt><dd>${esc(item.broke)}</dd></div>
<div><dt>${esc(t.incidents.labels.found)}</dt><dd>${esc(item.found)}</dd></div>
<div class="is-now"><dt>${esc(t.incidents.labels.now)}</dt><dd>${esc(item.now)}</dd></div>
</dl>
</div>
</article>`,
    )
    .join("");
  const included = t.price.included.map((line) => `<li>${esc(line)}</li>`).join("");
  const steps = t.process.steps.map((step) => `<li class="step"><h3 class="step-name">${esc(step.name)}</h3><p>${esc(step.body)}</p></li>`).join("");
  const copyButton = `<button type="button" class="btn btn-quiet" data-copy="${EMAIL}" data-copied="${esc(t.copied)}"><span>${esc(t.copy)}</span></button>`;

  return `<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="nav-wrap">
<nav class="nav" aria-label="${t.lang === "nl" ? "Hoofdmenu" : "Main"}">
<a class="wordmark" href="${t.path}" aria-label="${esc(t.nav.home)}">Omar Nassar</a>
<ul class="nav-links">
<li><a href="#install">${esc(t.nav.install)}</a></li>
<li><a href="#incidents">${esc(t.nav.incidents)}</a></li>
<li><a href="#price">${esc(t.nav.price)}</a></li>
</ul>
<div class="nav-end">
<a class="lang" href="${other.path}" hreflang="${other.lang}" lang="${other.lang}" aria-label="${esc(t.nav.switchLabel)}">${esc(t.nav.switchShort)}</a>
${ctaButton(t, " btn-small")}
</div>
</nav>
</header>
<main id="main">
<section class="hero" aria-labelledby="hero-title">
<div class="wrap">
<p class="eyebrow">${esc(t.hero.eyebrow)}</p>
<h1 id="hero-title" class="display-1"><span class="block">${esc(line1)}</span> <span class="block">${esc(lead)} <em>${esc(em)}</em></span></h1>
<div class="hero-grid">
<div class="hero-copy">
<p class="lede">${esc(t.hero.sub)}</p>
<div class="actions">${ctaButton(t)}<a class="btn btn-ghost" href="#incidents">${esc(t.hero.secondary)}</a></div>
</div>
<div class="hero-figure">${gate}</div>
</div>
</div>
</section>

<section id="install" class="section" aria-labelledby="install-title">
<div class="wrap">
<h2 id="install-title" class="display-2">${esc(t.install.title)}</h2>
<p class="intro">${esc(t.install.intro)}</p>
<div class="install-grid">
<ul class="parts">${install}</ul>
${canary ? `<div class="install-figure">${canary}</div>` : ""}
</div>
</div>
</section>

<section id="incidents" class="section" aria-labelledby="incidents-title">
<div class="wrap">
<h2 id="incidents-title" class="display-2">${esc(t.incidents.title)}</h2>
<p class="intro">${esc(t.incidents.intro)}</p>
<div class="incidents">${incidents}</div>
</div>
</section>

<section id="price" class="section" aria-labelledby="price-title">
<div class="wrap">
<h2 id="price-title" class="display-2">${esc(t.price.title)}</h2>
<div class="offer">
<div class="offer-price">
<p class="price"><span class="price-from">${esc(t.price.from)}</span> <span class="price-amount">${esc(t.price.amount)}</span></p>
<p class="price-note">${esc(t.price.note)}</p>
<div class="actions">${ctaButton(t)}</div>
</div>
<div class="offer-list">
<h3 class="offer-heading">${esc(t.price.includedTitle)}</h3>
<ul class="checks">${included}</ul>
</div>
<div class="offer-more">
<h3 class="offer-heading">${esc(t.price.moreTitle)}</h3>
<p>${esc(t.price.more)}</p>
</div>
</div>
</div>
</section>

<section class="section" aria-labelledby="process-title">
<div class="wrap">
<h2 id="process-title" class="display-2">${esc(t.process.title)}</h2>
<ol class="steps">${steps}</ol>
</div>
</section>

<section class="section close" aria-labelledby="close-title">
<div class="wrap">
<h2 id="close-title" class="display-1 close-title">${esc(t.close.title)}</h2>
<p class="lede">${esc(t.close.body)}</p>
<div class="actions">${ctaButton(t)}${copyButton}</div>
<p class="contact-line"><a class="mail" href="${esc(mailto(t))}">${EMAIL}</a><span aria-hidden="true"> </span><a class="xlink" href="${X_URL}" rel="me noopener">${esc(t.close.x)}: @${X_HANDLE}</a></p>
</div>
</section>
</main>
<footer class="footer">
<div class="wrap footer-row">
<p>${esc(t.footer.line)}</p>
<p class="footer-links"><a href="mailto:${EMAIL}">${EMAIL}</a><a href="${X_URL}" rel="me noopener">X</a><a href="${other.path}" hreflang="${other.lang}" lang="${other.lang}">${esc(t.nav.switchLabel)}</a></p>
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

// Sitemap with the language pair, and robots.txt.
const today = new Date().toISOString().slice(0, 10);
const entry = (t, other) => `  <url>
    <loc>${SITE}${t.path}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="${t.lang}" href="${SITE}${t.path}"/>
    <xhtml:link rel="alternate" hreflang="${other.lang}" href="${SITE}${other.path}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>
  </url>`;
mkdirSync(join(ROOT, "public"), { recursive: true });
writeFileSync(
  join(ROOT, "public/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entry(en, nl)}
${entry(nl, en)}
</urlset>
`,
);
writeFileSync(join(ROOT, "public/robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
writeFileSync(join(ROOT, "public/CNAME"), "harness.omardev.xyz\n");
console.log("pages: index.html, nl/index.html, sitemap.xml, robots.txt, CNAME");
