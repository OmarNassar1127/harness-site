# DESIGN.md: harness.omardev.xyz

## Job

A developer or a small dev team arrives from an X post, mostly on a phone. Within 30
seconds they must believe that Omar can make their Claude Code setup reliable, and
then send him a message to book a paid setup. Every section moves the visitor toward
that message. A section that does not is cut.

Design read: solo-consultant sales page for developers, arriving on a phone from X,
in a calm engineering-editorial language (serif display, isometric technical
figures, incident-report proof), built as a static Vite page with Tailwind v4 and
no design-system package.

Dials: DESIGN_VARIANCE 6, MOTION_INTENSITY 4, VISUAL_DENSITY 4. Motion lives in the
figures only, because there it explains a mechanism. The page itself does not
animate on scroll.

Benchmark: Linear, Vercel and Raycast landing pages. The gap to close: they have a
product screenshot; this page has drawings of mechanisms and real incident reports.

## Copy structure

Direct-response order: problem, mechanism, proof, offer, risk reversal, one call to
action. One CTA label for one intent: "Book a setup" (EN) and "Plan een setup" (NL),
a mailto. The only other outbound link is the X profile.

## Sections

| # | Section | The one sentence the visitor must believe | Stands beside |
|---|---|---|---|
| 0 | Floating nav | "I can book this in one tap from anywhere on the page." | Linear's floating pill nav |
| 1 | Hero + Fig 1 (completion gate) | "This person stops Claude Code from saying done when it is not done." | Linear hero: one claim, one product visual |
| 2 | What gets installed + Fig 2 (canary reader) | "Each part catches one specific failure, and I can see how it works." | Raycast feature blocks with a real visual each |
| 3 | Incident log | "He has already hit the failures I will hit, and built the check for each." | Cloudflare and Google SRE postmortems |
| 4 | Pricing: one offer | "The price and the scope are fixed and concrete, from €1,500." | Raycast and Linear pricing |
| 5 | How it runs (risk reversal) | "Booking this is low risk: a fixed quote, everything stays in my repo, I see every check fail once." | Stripe's "how it works" steps |
| 6 | Final CTA | "Sending the message is easy and specific." | Linear closing CTA |
| 7 | Footer | "This is a real person with a real email." | Vercel footer, reduced |

Cut on purpose: a separate failure-modes section (the incident log carries the
problem), a third figure (a memory cabinet explains his system, not the visitor's
pain), price tiers without numbers (only €1,500 is known, so the page shows one
offer and says larger scopes get a fixed quote first), testimonials, client logos,
"trusted by", stats strips, an about section with a photo. No figure is stated
that is not in a source file on the machine.

Second-model review (2026-10-15) drove these cuts and the copy-address fallback
next to every mailto, because a phone without a mail app does nothing on a mailto.

## Proof format

Each incident is written like a postmortem: a mono metadata line (date, component,
impact), a serif title, then "What broke", "Why nothing noticed", "What the harness
checks now". Sources: `~/jarvis-brain/ops/*.md`. Personal names other than Omar,
employers, addresses, tokens and money are stripped.

## Figures (anatomy skill, light theme)

| Fig | Object | What moves, and what that motion means |
|---|---|---|
| 1 (hero) | An inspection gate on a rail bench, with a lift at each end | A reply rises from the agent's lift on a carriage, one pin per check. Four feelers drop onto the pins. All seated: the barrier lifts and the reply rolls forward to the lift that takes it to you. One missing: its feeler drops into the empty socket, the lamp lights, the reply goes back down to the agent and returns finished. |
| 2 | A punched-card reader with four sensing pins | The instruction file is the card. Each canary is a pin that must pass through a punched fact. A cleanup that removes a fact leaves a pin blocked, its flag stays down and the deploy lever is locked. |

## Visual system

- Light only (owner preference). Canvas `#F4F4F2`, surface `#FBFBFA`, ink `#0F0F0E`,
  body `#4A4A47`, mute `#6F6F6A`. These are the tokens of omardev.xyz.
- One accent: signal `#F2541A` for fills and large text, `#C2410C` for small text
  (4.5:1 on canvas). Text on a signal fill is ink.
- Type: Newsreader (serif display, optical sizes, true italic) for headings; Mona
  Sans for body and UI; the system mono for metadata. Emphasis is the italic of the
  same serif, never a second family.
- Shapes: pills for interactive elements (nav, buttons, language switch); 14px for
  containers and figure plates. No other radius.
- One eyebrow at most per three sections. No section numbers, no decorative dots,
  no em-dashes anywhere.
- Mobile first: single column under 768px, figures full width, 44px tap targets.
- Motion: figures use eased, time-based motion, stop offscreen, and go still under
  `prefers-reduced-motion`.

## Build

Static output. `figures/*.mjs` builds each figure's SVG with the vendored anatomy
kit; `scripts/pages.mjs` writes `index.html` (EN) and `nl/index.html` (NL) from
`content/*.mjs`; Vite bundles CSS and the small live script. GitHub Actions
deploys `dist/` to GitHub Pages at harness.omardev.xyz.
