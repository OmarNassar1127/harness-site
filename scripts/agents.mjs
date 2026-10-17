// Renders the /agents/ offer page (EN) and /nl/agents/ (NL) from content/agents-*.mjs. Called by scripts/pages.mjs.

const esc = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Kinetic type: each word (or character) in its own mask, with its index for the CSS stagger.
const words = (text, start = 0) =>
  esc(text)
    .split(" ")
    .map((w, i) => `<span class="w"><span class="wi" style="--i:${start + i}">${w}</span></span>`)
    .join(" ");
const chars = (text) => [...text].map((c, i) => (c === " " ? " " : `<span class="w"><span class="wi" style="--i:${i}">${esc(c)}</span></span>`)).join("");
const count = (text) => text.split(" ").length;

export function renderAgents(t, other, { SITE, EMAIL, LINKEDIN_URL }) {
  const url = SITE + t.path;
  const otherUrl = SITE + other.path;
  const og = `${SITE}/og-agents-${t.lang}.png`;
  const mailto = (m) => `mailto:${EMAIL}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`;
  const cta = (extra = "") => `<a class="btn btn-primary${extra}" href="${esc(mailto(t.mail))}">${esc(t.cta)}</a>`;
  const amount = (s) => Number(s.replace(/[^\d]/g, ""));

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Person", "@id": `${SITE}/#omar`, name: "Omar Nassar", jobTitle: "AI engineer", email: `mailto:${EMAIL}`, sameAs: [LINKEDIN_URL] },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: t.meta.title.split(" | ")[0].split(",")[0],
        serviceType: "AI agent on company data",
        description: t.meta.description,
        provider: { "@id": `${SITE}/#omar` },
        areaServed: "Worldwide",
        inLanguage: t.lang,
        url,
        offers: [
          { "@type": "Offer", name: t.price.scope[0], price: String(amount(t.price.amount)), priceCurrency: "EUR", url, availability: "https://schema.org/InStock", description: `${t.price.live} ${t.price.scope.join(", ")}.` },
          { "@type": "Offer", name: t.founding.lead, price: String(amount(t.founding.amount)), priceCurrency: "EUR", url, availability: "https://schema.org/LimitedAvailability", inventoryLevel: { "@type": "QuantitativeValue", value: 2 }, description: t.founding.sub },
        ],
      },
      { "@type": "WebPage", "@id": `${url}#page`, url, name: t.meta.title, description: t.meta.description, inLanguage: t.lang, about: { "@id": `${url}#service` }, primaryImageOfPage: og },
    ],
  };

  const head = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t.meta.title)}</title>
<meta name="description" content="${esc(t.meta.description)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="${t.lang}" href="${url}">
<link rel="alternate" hreflang="${other.lang}" href="${otherUrl}">
<link rel="alternate" hreflang="x-default" href="${SITE}/agents/">
<meta name="theme-color" content="#f4f4f2">
<meta name="color-scheme" content="light">
<meta name="author" content="Omar Nassar">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/newsreader-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/mona-sans.woff2" as="font" type="font/woff2" crossorigin>
<script>if(matchMedia("(prefers-reduced-motion: no-preference)").matches)document.documentElement.classList.add("ag-js")</script>
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
<meta name="twitter:title" content="${esc(t.meta.title)}">
<meta name="twitter:description" content="${esc(t.meta.description)}">
<meta name="twitter:image" content="${og}">
<meta name="twitter:image:alt" content="${esc(t.meta.ogAlt)}">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`;

  // ---------------------------------------------------------- visuals
  const skel = (n, cls = "") => Array.from({ length: n }, (_, i) => `<i class="sk${cls}" style="--i:${i}"></i>`).join("");
  const sheets = t.hero.sheets
    .map((name, i) => `<div class="sheet" style="--n:${i}"><p class="sheet-tab">${esc(name)}</p><div class="sheet-grid">${skel(16)}</div></div>`)
    .join("");
  const answer = `<div class="answer"><p class="bubble-q">${esc(t.hero.question)}</p><div class="bubble-a"><p>${esc(t.hero.answer)}</p><div class="rows">${skel(4, " sk-row")}</div></div></div>`;
  const [l1, l2, l3] = t.hero.title;
  const asks = t.ask.questions
    .map((q, i) => `<li class="qa" style="--i:${i}"><p class="bubble-q">${esc(q)}</p><div class="bubble-a">${skel(2)}</div></li>`)
    .join("");
  const bars = [0.42, 0.58, 0.5, 0.7, 0.64, 0.82, 0.76, 0.95].map((h, i) => `<i style="--h:${h};--i:${i}"></i>`).join("");
  const days = Array.from({ length: 14 }, (_, i) => `<li style="--i:${i}"${i === 13 ? ' class="live"' : ""}></li>`).join("");
  const scope = t.price.scope.map((s) => `<li>${esc(s)}</li>`).join("");
  const spots = [1, 2].map((n) => `<li class="spot" style="--i:${n}"><p class="spot-n">${n}<span>/2</span></p><p class="spot-label">${esc(t.founding.spot)}</p><p class="spot-open">${esc(t.founding.open)}</p></li>`).join("");
  const checks = Array.from({ length: 10 }, (_, i) => `<li style="--i:${i}"><span>${i + 1}</span></li>`).join("");
  const months = t.care.months.map(([m, p], i) => `<li style="--i:${i}"${i === 0 ? ' class="free"' : ""}><span>${esc(m)}</span><b>${esc(p)}</b></li>`).join("");
  const examples = t.door.examples.map((e, i) => `<li style="--i:${i}">${esc(e)}</li>`).join("");
  const mailLines = t.mail.body.trim().split("\n").map((line) => `<p>${esc(line)}<i></i></p>`).join("");
  const copyButton = `<button type="button" class="btn btn-quiet" data-copy="${EMAIL}" data-copied="${esc(t.book.copied)}"><span>${esc(t.book.copy)}</span></button>`;

  const safe = `<svg class="safe-svg" viewBox="0 0 360 300" role="img" aria-label="${esc(t.safe.aria)}">
<rect x="6" y="18" width="348" height="276" rx="18" class="infra"/>
<text x="24" y="12" class="infra-label">${esc(t.safe.infra)}</text>
<g class="db" transform="translate(52 66)"><path d="M0 14v58c0 9 22 15 44 15s44-6 44-15V14"/><ellipse cx="44" cy="14" rx="44" ry="14"/><path d="M0 38c0 9 22 15 44 15s44-6 44-15M0 60c0 9 22 15 44 15s44-6 44-15" class="db-line"/><text x="44" y="112" class="node-label">${esc(t.safe.db)}</text></g>
<g class="xl" transform="translate(56 196)"><rect width="80" height="62" rx="8"/><path d="M0 20h80M0 41h80M27 0v62M54 0v62" class="db-line"/><text x="40" y="84" class="node-label">${esc(t.safe.sheets)}</text></g>
<g class="agent" transform="translate(272 150)"><circle r="40" class="agent-ring"/><circle r="27" class="agent-core"/><path d="M0-13 3.5-3.5 13 0 3.5 3.5 0 13-3.5 3.5-13 0-3.5-3.5Z" class="agent-spark"/><text y="64" class="node-label">${esc(t.safe.agent)}</text></g>
<path d="M150 108C190 112 210 128 228 140" class="flow read"/><path d="M150 222C190 214 210 176 228 162" class="flow read"/>
<path d="M222 132l9 9-12 3" class="arrow"/><path d="M219 167l12-4-3 12" class="arrow"/>
<text x="176" y="102" class="flow-label">${esc(t.safe.read)}</text>
<g class="nowrite" transform="translate(178 151)"><rect x="-34" y="-13" width="68" height="26" rx="13"/><text y="4.5" class="flow-label strike">${esc(t.safe.write)}</text><path d="M-24 0h48" class="strike-line"/></g>
</svg>`;

  const body = `<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="nav-wrap">
<nav class="nav" aria-label="${esc(t.nav.main)}">
<a class="wordmark" translate="no" href="${t.home}" aria-label="${esc(t.nav.home)}">Omar Nassar</a>
<div class="nav-end">
<a class="lang" href="${other.path}" hreflang="${other.lang}" lang="${other.lang}" aria-label="${esc(t.nav.switchLabel)} (${esc(t.nav.switchShort)})">${esc(t.nav.switchShort)}</a>
${cta(" btn-small")}
</div>
</nav>
</header>
<main id="main" class="ag">
<section class="ag-hero in" aria-labelledby="hero-title">
<div class="ag-hero-stage">
<div class="ag-hero-copy">
<h1 id="hero-title" class="display-1 ag-rise"><span class="line">${words(l1)}</span> <span class="line">${words(l2, count(l1))} <em>${words(l3, count(l1) + count(l2))}</em></span></h1>
</div>
<div class="ag-vis hero-vis" role="img" aria-label="${esc(t.hero.aria)}"><div class="hero-fold">${sheets}${answer}</div></div>
<div class="ag-hero-foot">
<p class="sub">${esc(t.hero.sub)}</p>
<div class="actions">${cta()}</div>
</div>
</div>
</section>

<section class="ag-sec ag-split" id="ask" aria-labelledby="ask-title">
<div class="ag-copy"><h2 id="ask-title" class="display-2 ag-rise">${words(t.ask.title)}</h2><p class="sub ag-fade">${esc(t.ask.sub)}</p></div>
<div class="ag-vis"><ul class="qas">${asks}</ul></div>
</section>

<section class="ag-sec ag-split" id="report" aria-labelledby="report-title">
<div class="ag-copy"><h2 id="report-title" class="display-2 ag-rise">${words(t.report.title)}</h2><p class="sub ag-fade">${esc(t.report.sub)}</p></div>
<div class="ag-vis"><div class="doc" aria-hidden="true"><p class="doc-head"><b>${esc(t.report.doc)}</b><span>${esc(t.report.when)}</span></p><div class="kpis">${skel(3, " kpi")}</div><div class="bars">${bars}</div><div class="doc-lines">${skel(3)}</div></div></div>
</section>

<section class="ag-sec ag-split" id="safe" aria-labelledby="safe-title">
<div class="ag-copy"><h2 id="safe-title" class="display-2 ag-rise"><span class="line">${words(t.safe.title[0])}</span> <em>${words(t.safe.title[1], count(t.safe.title[0]))}</em></h2><p class="sub ag-fade">${esc(t.safe.sub)}</p></div>
<div class="ag-vis">${safe}</div>
</section>

<section class="ag-sec ag-center" id="price" aria-labelledby="price-title">
<h2 id="price-title" class="ag-price"><span class="ag-price-from ag-rise">${words(t.price.from)}</span> <span class="ag-price-amount ag-rise">${chars(t.price.amount)}</span></h2>
<p class="ag-live ag-fade">${esc(t.price.live)}</p>
<div class="ag-vis"><div class="cal"><ol class="days" aria-label="${esc(t.price.aria)}">${days}</ol><p class="days-cap" aria-hidden="true"><span>${esc(t.price.day)}</span><span>${esc(t.price.liveTag)}</span></p></div></div>
<ul class="chips ag-fade">${scope}</ul>
</section>

<section class="ag-sec ag-center" id="founding" aria-labelledby="founding-title">
<h2 id="founding-title" class="ag-price"><span class="ag-price-from ag-rise">${words(t.founding.lead)}</span> <span class="ag-price-amount ag-rise">${chars(t.founding.amount)}</span></h2>
<p class="ag-was ag-fade"><s>${esc(t.founding.was)}</s></p>
<p class="sub ag-fade">${esc(t.founding.sub)}</p>
<div class="ag-vis"><ol class="spots">${spots}</ol></div>
</section>

<section class="ag-sec ag-split" id="guarantee" aria-labelledby="guarantee-title">
<div class="ag-copy"><h2 id="guarantee-title" class="display-2 ag-rise">${words(t.guarantee.title)}</h2><p class="sub ag-fade">${esc(t.guarantee.sub)}</p></div>
<div class="ag-vis"><div class="pay"><ol class="checks" aria-hidden="true">${checks}</ol><div class="split"><p class="half half-a">${esc(t.guarantee.start)}</p><p class="half half-b">${esc(t.guarantee.after)}</p></div></div></div>
</section>

<section class="ag-sec ag-split" id="care" aria-labelledby="care-title">
<div class="ag-copy"><h2 id="care-title" class="ag-price ag-price-left"><span class="ag-price-from ag-rise">${words(t.care.lead)}</span> <span class="ag-care-amount ag-rise">${chars(t.care.amount)}<span class="per">${esc(t.care.per)}</span></span></h2><p class="sub ag-fade">${esc(t.care.sub)}</p></div>
<div class="ag-vis"><ol class="months">${months}<li class="stop" style="--i:3"><span>${esc(t.care.stop)}</span></li></ol></div>
</section>

<section class="ag-sec ag-door" id="door" aria-labelledby="door-title">
<p class="door-hours ag-fade" aria-hidden="true">${esc(t.door.hours)}</p>
<div class="ag-copy"><h2 id="door-title" class="display-2 ag-rise">${words(t.door.title)}</h2><p class="sub ag-fade">${esc(t.door.sub)}</p></div>
<ul class="chips door-chips">${examples}</ul>
<div class="actions ag-fade"><a class="btn btn-primary" href="${esc(mailto(t.doorMail))}">${esc(t.door.cta)}</a></div>
</section>

<section class="ag-sec ag-split" id="book" aria-labelledby="book-title">
<div class="ag-copy"><h2 id="book-title" class="display-2 ag-rise">${words(t.book.title)}</h2><p class="sub ag-fade">${esc(t.book.sub)}</p>
<div class="actions ag-fade">${cta()}${copyButton}</div>
<p class="xline ag-fade"><a href="${LINKEDIN_URL}" rel="me noopener">${esc(t.book.linkedin)}</a></p></div>
<div class="ag-vis"><a class="mail" href="${esc(mailto(t.mail))}" aria-label="${esc(t.cta)}"><p class="mail-row"><span>${esc(t.book.to)}</span>${esc(EMAIL)}</p><p class="mail-row"><span>${esc(t.book.subjectLabel)}</span>${esc(t.mail.subject)}</p><div class="mail-body">${mailLines}</div></a></div>
</section>
</main>
<footer class="footer">
<div class="footer-row">
<p>${esc(t.footer.line)}</p>
<p class="footer-links"><a href="${esc(mailto(t.mail))}">${esc(t.book.emailMe)}</a><a href="${LINKEDIN_URL}" rel="me noopener">LinkedIn</a><a href="${t.home}">${esc(t.footer.other)}</a><a href="${other.path}" hreflang="${other.lang}" lang="${other.lang}">${esc(t.nav.switchLabel)}</a></p>
</div>
</footer>
<div class="sr-only" aria-live="polite" data-copy-status></div>
<script type="module" src="/src/agents.ts"></script>`;

  return `<!doctype html>
<html lang="${t.lang}">
<head>
${head}
</head>
<body>
${body}
</body>
</html>
`;
}
