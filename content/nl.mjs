// Nederlandse tekst, geschreven voor Nederlandse developers. Elk feit komt uit de postmortems van v1.
export default {
  lang: "nl",
  locale: "nl_NL",
  path: "/nl/",
  meta: {
    title: "Claude Code-harness laten inrichten, vanaf € 1.500 | Omar Nassar",
    description:
      "Ik richt een Claude Code-harness in je repo in: een completion gate, canaries, hooks, geheugen, geplande jobs en bediening vanaf je telefoon. Vaste prijs, vanaf € 1.500.",
    ogAlt: "Claude Code zegt dat het klaar is. Ik laat het dat bewijzen. Claude Code-harness door Omar Nassar, vanaf € 1.500.",
  },
  nav: { home: "Omar Nassar, home", main: "Hoofdmenu", switchLabel: "English", switchShort: "EN" },
  cta: "Plan een setup",
  mail: {
    subject: "Claude Code-harness inrichten",
    body: "Repo en stack:\nTeamgrootte:\nWat er steeds misgaat:\n",
  },
  skip: "Naar de inhoud",
  stillAlt: "De harness-module: zes gestapelde lagen met een oranje lampring onder de gate bovenop.",
  hero: {
    title: ["Claude Code zegt dat het klaar is.", "Ik laat het", "dat bewijzen."],
    sub: "Een harness in je repo die elke claim controleert. Vaste prijs, vanaf € 1.500.",
  },
  catch: {
    title: "Geen bewijs, niet klaar.",
    sub: "Een tweede model leest elk antwoord. Klaar zonder bewijs gaat terug naar de agent.",
    tile: "done",
    alt: "Een antwoord met 'done' wordt tegengehouden door de gesloten gate. De lampring is rood.",
  },
  parts: {
    title: "Zes onderdelen. Elk één taak.",
    sub: "Settings, hooks en scripts, gecommit in je eigen repo. Niets draait op mijn machine.",
    labels: ["Gate", "Canaries", "Hooks", "Geheugen", "Geplande jobs", "Telefoon"],
    alt: "De harness-module uit elkaar gehaald in zijn zes lagen.",
  },
  replay: {
    title: "Twee deploys geweigerd. Terecht.",
    sub: "Een opruimronde haalde één feit uit het geheugen van de agent. De canaries zagen het.",
    aria: "Replay van het incident op 3 september 2026: de canaries weigerden een deploy.",
    alt: "De harness-module van voren: drie canary-lampjes oranje, het vierde rood.",
  },
  incidents: {
    title: "Elke check komt uit een fout die ik al had.",
    items: [
      { date: "2026-08-27", area: "completion gate", line: "124 beoordelingen liepen in een time-out en telden als goedkeuring." },
      { date: "2026-07-25", area: "headless jobs", line: "'Geen tools' betekende alle tools. Eén run bouwde een Python-omgeving van 229 MB." },
      { date: "2026-09-22", area: "runtime-upgrade", line: "Healthchecks twee dagen groen. Dependencies dood." },
      { date: "2026-09-01", area: "verificatie", line: "Een deploy gemeld als geverifieerd, op de log van de vorige run." },
    ],
  },
  price: {
    from: "vanaf",
    amount: "€ 1.500",
    scope: ["Vaste scope", "In je eigen repo", "Bewezen bij overdracht", "Geen uurtje-factuurtje"],
    note: "Vaste scope, op papier afgesproken voordat ik begin. Geen uurtje-factuurtje.",
    alt: "De harness-module met alle lampjes aan.",
  },
  book: {
    title: "Vertel me wat er steeds misgaat.",
    sub: "Mail een paar regels. Ik stuur een vaste scope en prijs terug.",
    copy: "Kopieer e-mailadres",
    copied: "Gekopieerd",
    x: "Of stuur me een bericht op LinkedIn",
    alt: "De harness-module van voren, gate open, lampring oranje.",
  },
  footer: { line: "Omar Nassar, AI engineer in Nederland." },
};
