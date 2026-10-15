// Nederlandse tekst. Geschreven voor Nederlandse developers, niet vertaald.
import R from "./readouts.mjs";

export default {
  lang: "nl",
  locale: "nl_NL",
  path: "/nl/",
  meta: {
    title: "Claude Code-harness laten inrichten, vanaf €\u00a01.500 | Omar Nassar",
    description:
      "Ik richt de Claude Code-harness van je team in: een completion gate, evals en canaries, hooks, langetermijngeheugen, geplande agent-jobs en bediening vanaf je telefoon. Vaste prijs, vanaf €\u00a01.500.",
    ogAlt: "Claude Code zegt dat het klaar is. Ik laat het dat bewijzen. Claude Code-harness door Omar Nassar, vanaf €\u00a01.500.",
  },
  nav: { install: "Wat je krijgt", incidents: "Incidenten", price: "Prijs", switchLabel: "English", switchShort: "EN", home: "Omar Nassar, home" },
  cta: "Plan een setup",
  mail: {
    subject: "Claude Code-harness inrichten",
    body: "Repo en stack:\nTeamgrootte:\nWat er steeds misgaat:\n",
  },
  copy: "Kopieer e-mailadres",
  copied: "Gekopieerd",
  skip: "Naar de inhoud",
  hero: {
    eyebrow: "Claude Code-harness, ingericht",
    title: ["Claude Code zegt dat het klaar is.", "Ik laat het", "dat bewijzen."],
    sub: "Ik bouw een gate die elk antwoord terugstuurt als de claims niet kloppen met wat er echt gedraaid heeft. Vaste prijs, vanaf €\u00a01.500.",
    secondary: "Lees de incidenten",
  },
  gate: {
    fig: "Fig 1",
    title: "Completion gate",
    hint: "Tik om een check eruit te halen",
    aria: "Figuur van de completion gate. Druk op Enter of spatie om een check uit het volgende antwoord te halen.",
    caption:
      "Een antwoord komt omhoog uit de lift van de agent, met een pin voor elke check die het doorstaan heeft. Vier tasters zakken op de pinnen. Ontbreekt er één, dan zakt die taster in het lege gat: de lamp gaat aan en het antwoord gaat terug tot het af is.",
    keys: [
      { mark: "lit", label: "De taster die een ontbrekende check vond" },
      { mark: "raised", label: "Pinnen: checks die het antwoord kan bewijzen" },
    ],
    readout: R.nl.gate,
  },
  install: {
    title: "Wat er in je repo komt",
    intro:
      "Elk onderdeel vangt een manier waarop Claude Code stil faalt. Het zijn allemaal settings, hooks, scripts en docs in je eigen repo. Niets draait op mijn machine.",
    items: [
      { name: "Completion gate", body: "Een Stop-hook laat een tweede model elk antwoord lezen voordat jij het ziet. Zegt de agent dat iets klaar is zonder dat er iets gedraaid heeft, dan gaat het terug." },
      { name: "Evals en canaries", body: "Een paar snelle tests die bewijzen dat de agent nog weet wat er in je instructiebestanden staat. Ze draaien na elke wijziging aan die bestanden en voor elke deploy." },
      { name: "Hooks", body: "Bewaking op tool calls: geen secrets lezen, niet builden in een live map, helemaal geen tools voor headless jobs. Van elke hook laat ik zien dat hij bij een fout blokkeert in plaats van doorlaat." },
      { name: "Langetermijngeheugen", body: "Eén index die de agent elke sessie leest, één regel per herinnering, met de details in losse bestanden. Wat niemand gebruikt, wordt periodiek opgeruimd." },
      { name: "Geplande agent-jobs", body: "Terugkerend werk draait headless met dichtgezette tools, en meldt zich als het misgaat, niet alleen als het lukt." },
      { name: "Bediening vanaf je telefoon", body: "Resultaten en goedkeuringen komen op je telefoon binnen: één bericht per gebeurtenis, met knoppen voor de beslissingen." },
    ],
  },
  canary: {
    fig: "Fig 2",
    title: "Canary-lezer",
    hint: "Tik om de kaart te wijzigen",
    aria: "Figuur van de canary-lezer. Druk op Enter of spatie om een feit van de volgende kaart te halen.",
    caption:
      "Het instructiebestand is de kaart en elke canary is een pin die door een feit op die kaart moet. Haalt een wijziging een feit weg, dan blijft er één pin op de kaart staan: de kop komt niet meer onderaan en de deploy-grendel blijft in de sluitkom tot bestand en canary weer kloppen.",
    keys: [
      { mark: "lit", label: "Een canary die zijn feit kwijt is" },
      { mark: "raised", label: "Het instructiebestand, met vier feiten geponst" },
    ],
    readout: R.nl.canary,
  },
  incidents: {
    title: "Incidentlog",
    intro:
      "Elke check die ik installeer, zit erin omdat die fout mij al een keer overkwam, op de Mac mini waarop mijn eigen agents draaien, inclusief de chat-agent die ik vanaf mijn telefoon gebruik. Hieronder zes van die incidenten, uitgeschreven als postmortem.",
    labels: { broke: "Wat er misging", found: "Hoe het boven kwam", now: "Wat er nu draait" },
    items: [
      {
        date: "2026-08-27",
        area: "completion gate",
        title: "De gate die vijf dagen niets beoordeelde",
        broke:
          "Elk antwoord moest eerst langs een tweede model voordat ik het zag. Alle 124 beoordelingen liepen in een time-out: het budget was 8\u00a0seconden, en een kale judge-call kost op die machine al 4 tot 6 seconden voordat de echte prompt erbij komt.",
        found: "Een kolom met de duur die bij elke rij op zo’n 8.010\u00a0ms bleef hangen. De gate faalde open en logde elke time-out als gewone goedkeuring.",
        now: "Het budget komt uit een gemeten ondergrens (nu 30\u00a0seconden), elke fail-open legt de reden vast en één query bewijst dat de gate leeft.",
      },
      {
        date: "2026-07-25",
        area: "headless jobs",
        title: "‘Geen tools’ betekende alle tools",
        broke:
          "Een nachtelijke eval-job draaide `claude -p --allowedTools \"\"` en volgens de comments betekende dat nul tools. De lege waarde wordt genegeerd, dus alle tools bleven aan. Eén run bouwde een Python-omgeving van 229\u00a0MB op basis van een spec die hij zelf verzon.",
        found: "Tijdens het dichttimmeren van die job. Alleen Bash blokkeren hielp niet: het model kwam via een andere tool alsnog bij de shell.",
        now: "Headless jobs krijgen een deny-all PreToolUse-hook die inline in hun settings staat, dus er is geen scriptbestand dat kan verdwijnen en open kan falen. Een audit vond daarna nog vier jobs met dezelfde flag.",
      },
      {
        date: "2026-09-03",
        area: "canaries",
        title: "Twee deploys geweigerd na een opruimronde",
        broke:
          "Bij het opschonen van de geheugenindex van de agent werd één regel herschreven en verdween de hostname waar een canary naar vraagt. De deploy-gate weigerde twee deploys met ‘context canaries 3/4’.",
        found: "De canaries vingen het, zoals bedoeld, en een controle-call sloot een quotahapering uit. Maar het kwam pas drie minuten in een build boven, en daar leek het op een regressie in de code.",
        now: "De vier canaries draaien in zo’n 35\u00a0seconden na elke wijziging aan de instructiebestanden, voor een deploy. Spreken een canary en een doc elkaar tegen, dan worden ze allebei gerepareerd. De canary wordt nooit soepeler gemaakt.",
      },
      {
        date: "2026-08-22",
        area: "deploy-gate",
        title: "Een rode gate die het dashboard half gedeployd achterliet",
        broke:
          "De pre-swap-check zei nee, maar de build had de live map al overschreven. De browser kreeg de nieuwe UI, de draaiende server hield zijn oude routetabel en elke nieuwe API-call gaf een 404.",
        found: "Pas na de tweede melding ‘nog steeds 404’. Een logregel die zegt dat de gate rood is en er niets is gewisseld, lees je als ‘er is niets veranderd’.",
        now: "Een deploy-lock houdt een tweede deploy tegen voordat die gaat builden, en een rode gate zet de vorige build terug zonder herstart. Dat terugzetten is bewezen met een markeerbestand dat daarna weg was.",
      },
      {
        date: "2026-09-22",
        area: "runtime-upgrade",
        title: "Healthchecks groen, dependencies dood",
        broke: "Een Node-upgrade via Homebrew zette native modules op een nieuwe ABI, van 141 naar 147. Geen enkele gecompileerde addon op de machine laadde nog.",
        found:
          "Niet door de healthchecks. Draaiende services houden het oude binary in het geheugen en bleven dus 200 geven, één ervan twee dagen lang. Een nachtelijke job die vers opstart, viel als eerste om.",
        now: "Elke Node-upgrade krijgt een controle van alle native addons, en elke fix wordt getest op een losse poort met een kopie van de database, nooit op het live bestand.",
      },
      {
        date: "2026-09-01",
        area: "verificatie",
        title: "Een groene log van de vorige run",
        broke:
          "De agent las de staart van de deploy-log, zag ‘post-swap GREEN’ en meldde de deploy als geverifieerd. Dat blok hoorde bij de vorige run. De nieuwe build stond nog niet eens klaar.",
        found: "Door de artefacten te checken: de tijdstempel van de buildmap, de bundle-hash en een ontbrekende route spraken de log alle drie tegen.",
        now: "Een deploy telt alleen als geverifieerd op basis van artefacten: de bundle-hash die echt geserveerd wordt, de nieuwe route op schijf, een proces dat na de build is gestart. Logs lees ik vanaf de kop van de huidige run.",
      },
    ],
  },
  price: {
    title: "Eén setup, één prijs",
    amount: "€\u00a01.500",
    from: "vanaf",
    note: "Vaste scope, op papier afgesproken voordat ik begin. Geen uurtje-factuurtje.",
    includedTitle: "Inbegrepen",
    included: [
      "Completion gate op je Stop-hook, met een tijdsbudget dat op jouw machine gemeten is",
      "Canary-evals voor je instructiebestanden, gekoppeld aan je deploys of CI",
      "Bewakingshooks voor secrets, live mappen en headless jobs, die aantoonbaar blokkeren als er iets misgaat",
      "Een geheugenindex met een vast opruimschema",
      "Eén geplande agent-job naar keuze, die rapporteert op je telefoon",
      "Resultaten en goedkeuringen op je telefoon, één bericht per gebeurtenis",
      "Een README in je repo voor elk onderdeel",
      "Een overdracht waarin elke check één keer faalt, waar je bij bent",
    ],
    moreTitle: "Groter dan één repo?",
    more: "Meer repo’s, meer jobs, of 30 dagen bijstellen na de overdracht, waarin elke fout die terugkomt een nieuwe check wordt. Daarvoor krijg je vooraf een vaste offerte.",
  },
  process: {
    title: "Zo gaat het",
    steps: [
      { name: "Je vertelt wat er steeds misgaat", body: "Een paar regels over je repo, je Claude Code-setup en de fouten die je ziet." },
      { name: "Ik stuur een vaste offerte", body: "Scope en prijs op papier, vanaf €\u00a01.500. Jij beslist voordat er iets gebeurt." },
      { name: "Ik bouw het in je repo", body: "Settings, hooks, scripts en docs, gecommit waar je team al werkt." },
      { name: "Elke check faalt één keer, waar je bij bent", body: "Bij de overdracht breek ik elke check expres, zodat je ziet dat hij de fout vangt. Daarna is het van jou." },
    ],
  },
  close: {
    title: "Vertel me wat er steeds misgaat.",
    body: "Mail een paar regels over je setup en ik stuur een vaste scope en prijs terug.",
    x: "Of stuur me een bericht op X",
    pause: "Pauze",
    play: "Afspelen",
    preview: "De mail begint zo",
    to: "Aan",
    subject: "Onderwerp",
  },
  footer: { line: "Omar Nassar, AI engineer in Nederland." },
};
