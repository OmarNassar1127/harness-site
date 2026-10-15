# DESIGN.md: harness.omardev.xyz, v2

## Job

A developer arrives from an X post, usually on a phone, and scrolls once through
the page. Within 30 seconds they must hold three facts: Claude Code says it is
done, Omar makes it prove it, and the setup has a fixed price from €1,500. Then
they tap "Book a setup" (a mailto). Each scene moves them toward that tap. A scene
that does not is cut.

Design read: a product page for one service, for developers on a phone, in
Apple's product-page language (real 3D, scroll-scrubbed sticky scenes, giant
type beats), with the playful character of Omar's own portfolio, kept in his
brand: light, serif display, warm orange. Static Vite build, Three.js for the
3D, GSAP ScrollTrigger for the scroll timeline. No design-system package.

Dials: DESIGN_VARIANCE 6, MOTION_INTENSITY 9, VISUAL_DENSITY 3. The motion is
the explanation: every move in a scene shows one mechanism of the harness.
Position follows scroll.

## Exemplar

The page stands beside **apple.com/airpods-pro**. Its method, copied on purpose:

- Real 3D, driven by scroll inside full-viewport sticky scenes. Things turn,
  open up, show their parts, close again and light up. Position follows scroll.
- One large headline per scene and at most one short sentence. Copy arrives with
  the motion and leaves with it.
- Big claims as their own type beats.
- Every viewport is full: the 3D or the type fills it. No dead columns.

The character comes from Omar's own portfolio hero (omardev.xyz): lively,
playful, crafted 3D where things float and move. That page is a measure of
spirit only. No avatar and none of its characters are reused here.

The gap between apple.com/airpods-pro and this page:

- Apple shows one photoreal product, rendered offline as image sequences. This
  page shows software, so it has no single product. It builds a small cast of
  objects in code from primitives (extruded rounded shapes, spheres, tori,
  rounded boxes) under a studio environment map. They read as designed toys,
  not as photographs.
- Apple holds one object through the whole page. Here each scene has its own
  3D moment, floating in space with no base plate, so the page trades Apple's
  continuity for variety.
- Apple chains dozens of scenes. This page has seven, because the offer has
  seven things to say.

## The cast

Five 3D moments. Each floats in space on its own, enters by scaling up with a
small overshoot and leaves the same way.

| Moment | Objects | What moves |
|---|---|---|
| Gate | A thick ceramic gate with a lit orange lip and a lamp; five "done" reply bubbles; a rubber stamp | Bubbles stream into the gate. In the close-up the doors slide shut, the lamp turns red, the stamp presses "NO PROOF" on the reply and the reply is flung back. |
| Parts | The gate, three canary birds, a J-hook with a padlock, a card-catalogue cabinet, an alarm clock, a phone with a notification card | The six parts burst out of a cluster into a grid with a label each. Drawers slide out, the clock hands turn, the lock swings, the notification lifts off the phone. Then they collapse back. |
| Wire | Four canary birds on a wire, one index card | The card with a torn-out fact falls past. The birds light up orange one by one in step with the terminal, the fourth turns red and shakes, the others turn to look at it. |
| Box | A gift box with a hinged lid and a bow; small copies of the six parts | The parts drop into the box one after another, the lid closes, the bow pops. |
| Envelope | An envelope with a pocket, a flap, a postage stamp and a letter | The envelope flies in, the flap opens, the letter with three blank lines rises. |

Materials: glossy ceramic white, satin steel, graphite, ink, and the brand
orange as glossy plastic and as unlit light. Alarm red only for a held reply
and a failed canary.

## Scenes

Seven sticky scenes on one pinned stage. Scroll lengths are in viewport heights.

| # | Scene | Length | 3D moment | Headline (max ~8 words) | Sentence (max ~15 words) | The visitor believes |
|---|---|---|---|---|---|---|
| 1 | Hero | 1.0 | Gate, wide: "done" bubbles stream into the lit gate. | Claude Code says it's done. I make it prove it. | A harness in your repo that checks every claim. Fixed price, from €1,500. | "This stops Claude Code saying done when it isn't, at a fixed price." |
| 2 | The catch | 1.8 | Gate, close-up: doors shut, lamp red, stamp "NO PROOF", reply flung back. | No proof, no done. | A second model reads every reply. A claim with nothing run behind it goes back. | "A false done gets sent back automatically." |
| 3 | Exploded view | 2.0 | Parts: the six parts burst apart, each labelled in HTML, then collapse. | Six parts. One job each. | Settings, hooks and scripts committed to your repo. Nothing runs on my machine. | "It is concrete, it has parts, and it lives in my repo." |
| 4 | Replay | 2.0 | Wire: canaries light up in step with a terminal replay of the 2026-09-03 incident. | Two deploys refused. Correctly. | A tidy-up dropped one fact from the agent's memory. The canaries noticed. | "It catches real mistakes, including his own." |
| 5 | Incidents | 1.6 | None: four incident cards rise in, one line each. | Every check is a failure I already had. | (none) | "He has already hit the failures I will hit." |
| 6 | Price | 1.2 | Box: the parts drop in, the lid closes. The price rolls in digit by digit. | from €1,500 | Fixed scope. In your repo. Proven at handover. No hourly billing. | "The price and the scope are fixed." |
| 7 | Book | 0.8 | Envelope: the flap opens, the letter rises. | Tell me what keeps breaking. | Email a few lines. I reply with a fixed scope and price. | "Booking is one tap." |

Kinetic type: every headline rises out of word masks with a stagger and leaves
the same way. The catch headline lands like a stamp. The price rolls in per
character.

Incident cards (one line each, from the existing postmortems): 124 reviews timed
out and were logged as approvals (2026-08-27); "No tools" meant every tool
(2026-07-25); health checks green, dependencies dead (2026-09-22); a deploy
reported verified from the previous run's log (2026-09-01).

The replay shows only facts from the 2026-09-03 postmortem: one memory-index
line rewritten, the hostname a canary asks about gone, "context canaries 3/4",
the deploy refused, and the rule that the doc gets fixed and the canary is never
loosened.

## Copy budget

The v1 English page showed 1,376 words. v2 shows at most 400 (a cut of more than
70%). No invented numbers, testimonials or logos. English follows the humanizer
rules: no em-dashes, straight quotes. Dutch is written for Dutch developers with
"je", not translated word for word.

One call to action, one label: "Book a setup" / "Plan een setup", a mailto to
omar.portero.nassar1@gmail.com, in the nav, the hero and the last scene. Next to
the last one: "Copy email", for phones without a mail app, and the X link.

## Visual system

- Light only. Canvas `#F4F4F2`, surface `#FBFBFA`, ink `#0F0F0E`, body
  `#4A4A47`, mute `#6F6F6A`.
- One accent: signal `#F2541A` (fills, large text, the lamp), `#C2410C` for
  small text. Alarm red `#E1261C` exists only as the lamp's held state and the
  terminal's FAIL.
- Type: Newsreader (serif display, true italic) for headlines and the price;
  Mona Sans for body and UI; system mono for the terminal and dates.
- Shapes: pills for buttons, 18px for cards and the terminal. No other radius.
- No eyebrows, no section numbers, no decorative dots, no scroll cue.

## Motion and performance rules

- Scroll-scrubbed. One GSAP timeline, 10.4 viewport heights long, drives both
  the copy and the 3D. The 3D reads the timeline's smoothed time, so text and
  objects never drift apart. After the first input, objects also float gently
  (30 fps, scroll still drives every move).
- The canvas renders only when the timeline time changes or the float runs, and
  not at all while it is hidden (scene 5) or the stage is off screen.
- Device pixel ratio capped at 2. Three.js loads on the first input (pointer,
  touch, wheel, key, scroll). Until then a pre-rendered still of the hero moment
  stands in, so first paint never waits on WebGL. Geometry is cached and the
  boot yields between moments.
- `prefers-reduced-motion`, no WebGL, or no JavaScript: the scenes become normal
  sections, each with a static keyframe image rendered from the same model.

## SEO kept

`/` (en) and `/nl/` (nl), canonical, hreflang pair plus x-default, meta
description, Open Graph and Twitter cards with images rendered from the hero
object, JSON-LD (Person, ProfessionalService, Service with an Offer of 1500 EUR,
WebPage), sitemap with the language pair, robots.txt, CNAME. All copy is HTML.

## Build

`content/*.mjs` holds the copy. `scripts/pages.mjs` writes `index.html`,
`nl/index.html`, the sitemap, robots and CNAME. `src/stage/` builds and poses the
3D moments (`objects.js` the cast, `world.js` the choreography, `timeline.js` the
tracks, `stage.js` the renderer and framing). `scripts/keyframes.mjs` renders the stills into `public/keyframes/` and
`scripts/og.mjs` the share images; both need Google Chrome and are run by hand.
GitHub Actions builds and deploys `dist/` to GitHub Pages.
