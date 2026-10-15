// English copy. Every figure in here comes from a file on the machine the harness runs on.
import R from "./readouts.mjs";

export default {
  lang: "en",
  locale: "en_GB",
  path: "/",
  meta: {
    title: "Claude Code harness setup, from €1,500 | Omar Nassar",
    description:
      "I set up your team’s Claude Code harness: a completion gate, evals and canaries, hooks, long-term memory, scheduled agent jobs and a phone control surface. Fixed price, from €1,500.",
    ogAlt: "Claude Code says it’s done. I make it prove it. Claude Code harness setup by Omar Nassar, from €1,500.",
  },
  nav: { install: "What you get", incidents: "Incidents", price: "Price", switchLabel: "Nederlands", switchShort: "NL", home: "Omar Nassar, home" },
  cta: "Book a setup",
  mail: {
    subject: "Claude Code harness setup",
    body: "Repo and stack:\nTeam size:\nWhat keeps breaking:\n",
  },
  copy: "Copy email",
  copied: "Copied",
  skip: "Skip to content",
  hero: {
    eyebrow: "Claude Code harness setup",
    title: ["Claude Code says it’s done.", "I make it", "prove it."],
    sub: "I install a gate that sends back any reply whose claims don’t match what actually ran. Fixed price, from €1,500.",
    secondary: "Read the incidents",
  },
  gate: {
    fig: "Fig 1",
    title: "Completion gate",
    hint: "Tap to pull a check",
    aria: "Completion gate figure. Press Enter or Space to pull a check from the next reply.",
    caption:
      "A reply rises from the agent’s lift with one pin for each check it passed. Four feelers drop onto the pins. One missing and its feeler sinks into the empty socket: the lamp lights and the reply goes back until it is finished.",
    keys: [
      { mark: "lit", label: "The feeler that found a missing check" },
      { mark: "raised", label: "Pins: checks the reply can prove" },
    ],
    readout: R.en.gate,
  },
  install: {
    title: "What goes into your repo",
    intro:
      "Each part catches one way Claude Code fails without telling you. All of it is settings, hooks, scripts and docs committed to your repo. Nothing depends on my machine.",
    items: [
      { name: "Completion gate", body: "A Stop hook has a second model read each reply before it reaches you. A claim of done with nothing run behind it goes back to the agent." },
      { name: "Evals and canaries", body: "A few fast cases that prove the agent still knows what your instruction files say. They run after every edit to those files and before every deploy." },
      { name: "Hooks", body: "Guards on tool calls: no reading secrets, no builds in a live directory, no tools at all for headless jobs. Each one is shown to fail closed." },
      { name: "Long-term memory", body: "One index the agent reads every session, a line per memory, with the detail in separate files. Entries nobody uses get pruned on a schedule." },
      { name: "Scheduled agent jobs", body: "Recurring work runs headless with locked-down tools, and it reports when it fails, not only when it succeeds." },
      { name: "Phone control surface", body: "Results and approvals reach your phone as one message per event, with buttons for the decisions." },
    ],
  },
  canary: {
    fig: "Fig 2",
    title: "Canary reader",
    hint: "Tap to edit the card",
    aria: "Canary reader figure. Press Enter or Space to remove a fact from the next card.",
    caption:
      "The instruction file is the card and each canary is a pin that must pass through a fact on it. An edit that drops a fact blocks a pin, its flag goes up and the deploy stays locked until the file and the canary agree again.",
    keys: [
      { mark: "lit", label: "A canary that lost its fact" },
      { mark: "raised", label: "The instruction file, punched with four facts" },
    ],
    readout: R.en.canary,
  },
  incidents: {
    title: "Incident log",
    intro:
      "Every check I install exists because it broke first on the Mac mini that runs my own agents: a chat agent I use from my phone, scheduled jobs, and the harness around them. Six of those incidents, written up as postmortems.",
    labels: { broke: "What broke", found: "How it was found", now: "What runs now" },
    items: [
      {
        date: "2026-08-27",
        area: "completion gate",
        title: "The gate that judged nothing for five days",
        broke:
          "Every reply was meant to pass a second-model review before it reached me. All 124 reviews timed out: the budget was 8 seconds, and a bare judge call on that machine takes 4 to 6 before the real prompt is added.",
        found: "A duration column stuck at about 8,010 ms on every row. The gate had failed open and logged each timeout as a normal approval.",
        now: "The budget comes from a measured floor (now 30 seconds), every fail-open records its reason, and one query proves the gate is alive.",
      },
      {
        date: "2026-07-25",
        area: "headless jobs",
        title: "“No tools” that meant every tool",
        broke:
          "A nightly eval job ran claude -p --allowedTools \"\" and its comments said that meant zero tools. The empty value is dropped, so every tool stayed live. One run built a 229 MB Python environment from a spec it made up.",
        found: "While hardening the job. Blocking Bash alone did not help: the model reached the shell through another tool.",
        now: "Headless jobs carry a deny-all PreToolUse hook written inline in their settings, so there is no script file that can go missing and fail open. An audit then found four more jobs with the same flag.",
      },
      {
        date: "2026-09-03",
        area: "canaries",
        title: "Two deploys refused after a tidy-up",
        broke:
          "A cleanup of the agent’s memory index rewrote one line and dropped the hostname a canary asks about. The deploy gate refused two deploys with “context canaries 3/4”.",
        found: "By the canaries, as designed, and a control call ruled out a quota blip. The cost: it surfaced three minutes into a build and looked like a code regression.",
        now: "The four canaries run in about 35 seconds after any edit to the instruction files, before a deploy. When a canary and a doc disagree, both get fixed. The canary is never loosened.",
      },
      {
        date: "2026-08-22",
        area: "deploy gate",
        title: "A red gate that left the dashboard half deployed",
        broke:
          "The pre-swap check said no, but the build had already overwritten the live directory. The browser got the new UI, the running server kept its old route table, and every new API call returned 404.",
        found: "Only after the second “still 404”. A log line saying the gate is red and nothing was swapped reads as “nothing changed”.",
        now: "A deploy lock stops a second deploy before it builds, and a red gate restores the previous build without a restart. The restore was proven by planting a marker file and watching it disappear.",
      },
      {
        date: "2026-09-22",
        area: "runtime upgrade",
        title: "Health checks green, dependencies dead",
        broke: "A Homebrew Node upgrade moved native modules to a new ABI, 141 to 147. Every compiled addon on the machine stopped loading.",
        found:
          "Not by the health checks. Running services keep the old binary in memory, so they kept answering 200, one of them for two days. A nightly job that starts fresh failed first.",
        now: "Every Node upgrade includes a sweep of all native addons, and each fix is tested on a scratch port against a copy of the database, never the live file.",
      },
      {
        date: "2026-09-01",
        area: "verification",
        title: "A green log from the run before",
        broke:
          "The agent tailed the deploy log, saw “post-swap GREEN” and reported the deploy verified. That block belonged to the previous run. The new build had not even been staged.",
        found: "By checking artifacts: the build directory’s timestamp, the bundle hash and a missing route all disagreed with the log.",
        now: "A deploy counts as verified only from artifacts: the bundle hash being served, the new route on disk, a process that started after the build. Logs are read from the current run’s header down.",
      },
    ],
  },
  price: {
    title: "One setup, one price",
    amount: "€1,500",
    from: "from",
    note: "Fixed scope, agreed in writing before I start. No hourly billing.",
    includedTitle: "Included",
    included: [
      "Completion gate on your Stop hook, its time budget measured on your machine",
      "Canary evals for your instruction files, wired into deploys or CI",
      "Guard hooks for secrets, live directories and headless jobs, each shown to fail closed",
      "A memory index with a pruning schedule",
      "One scheduled agent job of your choice, reporting to your phone",
      "Results and approvals on your phone, one message per event",
      "A README in your repo for every part",
      "A handover where each check is made to fail once, in front of you",
    ],
    moreTitle: "Bigger than one repo?",
    more: "More repos, more jobs, or 30 days of tuning after handover, where every repeat failure becomes a new check. You get a fixed quote for that before we start.",
  },
  process: {
    title: "How it runs",
    steps: [
      { name: "You tell me what keeps breaking", body: "A few lines about your repo, your Claude Code setup and the failures you see." },
      { name: "I send a fixed quote", body: "Scope and price in writing, from €1,500. You decide before any work starts." },
      { name: "I build it in your repo", body: "Settings, hooks, scripts and docs, committed where your team already works." },
      { name: "Every check fails once, in front of you", body: "At handover I break each check on purpose, so you see it catch the failure. Then it is yours." },
    ],
  },
  close: {
    title: "Tell me what keeps breaking.",
    body: "Email a few lines about your setup and I reply with a fixed scope and price.",
    x: "Or message me on X",
  },
  footer: { line: "Omar Nassar, AI engineer in the Netherlands." },
};
