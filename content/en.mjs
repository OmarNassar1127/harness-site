// English copy. Every fact comes from the postmortems in v1 of this site; nothing is invented.
export default {
  lang: "en",
  locale: "en_GB",
  path: "/",
  meta: {
    title: "Claude Code harness setup, from €1,500 | Omar Nassar",
    description:
      "I set up a Claude Code harness in your repo: a completion gate, canaries, hooks, memory, scheduled jobs and phone control. Fixed price, from €1,500.",
    ogAlt: "Claude Code says it's done. I make it prove it. Claude Code harness setup by Omar Nassar, from €1,500.",
  },
  nav: { home: "Omar Nassar, home", main: "Main", switchLabel: "Nederlands", switchShort: "NL" },
  cta: "Book a setup",
  mail: {
    subject: "Claude Code harness setup",
    body: "Repo and stack:\nTeam size:\nWhat keeps breaking:\n",
  },
  skip: "Skip to content",
  stillAlt: "The harness module: six stacked layers with an orange lamp ring under the gate on top.",
  hero: {
    title: ["Claude Code says it's done.", "I make it", "prove it."],
    sub: "A harness in your repo that checks every claim. Fixed price, from €1,500.",
  },
  catch: {
    title: "No proof, no done.",
    sub: "A second model reads every reply. A claim with nothing run behind it goes back.",
    tile: "done",
    alt: "A reply marked done is stopped by the closed gate. The lamp ring is red.",
  },
  parts: {
    title: "Six parts. One job each.",
    sub: "Settings, hooks and scripts committed to your repo. Nothing runs on my machine.",
    labels: ["Gate", "Canaries", "Hooks", "Memory", "Scheduled jobs", "Phone control"],
    alt: "The harness module taken apart into its six layers.",
  },
  replay: {
    title: "Two deploys refused. Correctly.",
    sub: "A tidy-up dropped one fact from the agent's memory. The canaries noticed.",
    aria: "Replay of the incident on 3 September 2026: the canaries refused a deploy.",
    alt: "The harness module from the front: three canary lights orange, the fourth red.",
  },
  incidents: {
    title: "Every check is a failure I already had.",
    items: [
      { date: "2026-08-27", area: "completion gate", line: "124 reviews timed out and were logged as approvals." },
      { date: "2026-07-25", area: "headless jobs", line: "\"No tools\" meant every tool. One run built a 229 MB Python environment." },
      { date: "2026-09-22", area: "runtime upgrade", line: "Health checks green for two days. Dependencies dead." },
      { date: "2026-09-01", area: "verification", line: "A deploy reported verified from the previous run's log." },
    ],
  },
  price: {
    from: "from",
    amount: "€1,500",
    scope: ["Fixed scope", "In your repo", "Proven at handover", "No hourly billing"],
    note: "Fixed scope, agreed in writing before I start. No hourly billing.",
    alt: "The harness module with every light on.",
  },
  book: {
    title: "Tell me what keeps breaking.",
    sub: "Email a few lines. I reply with a fixed scope and price.",
    copy: "Copy email",
    copied: "Copied",
    x: "Or message me on LinkedIn",
    emailMe: "Email me",
    alt: "The harness module from the front, gate open, lamp ring orange.",
  },
  footer: { line: "Omar Nassar, AI engineer in the Netherlands." },
};
