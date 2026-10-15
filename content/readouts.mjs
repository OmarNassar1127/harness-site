// Live readout strings for the figures, per language. The page script imports only this file.
export default {
  en: {
    gate: {
      rising: (n) => `reply rising · ${n} of 4 checks`,
      toGate: (n) => `to the gate · ${n} of 4 checks`,
      probing: "feelers down",
      held: (n) => `${n} of 4 seated · held`,
      passed: "4 of 4 seated · passed",
      sentBack: (i) => `sent back · check ${i} missing`,
      rework: (i) => `agent adds check ${i}`,
      open: "gate open",
      shipped: (n) => `shipped · ${n}`,
      pulled: (n) => `check pulled · ${n} of 4 left`,
      pulledNext: "next reply will be a check short",
    },
    canary: {
      feeding: (rev) => `card rev ${rev} · feeding`,
      reading: "pins down",
      pass: "4 of 4 through · deploy unlocked",
      fail: (n) => `${n} of 4 through · deploy locked`,
      edited: "next card is missing a fact",
    },
  },
  nl: {
    gate: {
      rising: (n) => `antwoord komt op · ${n} van 4 checks`,
      toGate: (n) => `naar de gate · ${n} van 4 checks`,
      probing: "tasters omlaag",
      held: (n) => `${n} van 4 in orde · tegengehouden`,
      passed: "4 van 4 in orde · door",
      sentBack: (i) => `teruggestuurd · check ${i} ontbreekt`,
      rework: (i) => `agent voegt check ${i} toe`,
      open: "gate open",
      shipped: (n) => `verstuurd · ${n}`,
      pulled: (n) => `check eruit · nog ${n} van 4`,
      pulledNext: "volgend antwoord mist een check",
    },
    canary: {
      feeding: (rev) => `kaart rev ${rev} · invoer`,
      reading: "pinnen omlaag",
      pass: "4 van 4 door · deploy vrij",
      fail: (n) => `${n} van 4 door · deploy op slot`,
      edited: "volgende kaart mist een feit",
    },
  },
};
