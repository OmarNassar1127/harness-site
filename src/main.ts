import "./styles.css";
import readouts from "../content/readouts.mjs";
import { mountGate } from "./live/gate.js";

const lang = document.documentElement.lang === "nl" ? "nl" : "en";
const text = (readouts as Record<string, Record<string, unknown>>)[lang];

const gate = document.querySelector<HTMLElement>('[data-figure="gate"]');
if (gate) mountGate(gate, text.gate);

const canary = document.querySelector<HTMLElement>('[data-figure="canary"]');
if (canary) {
  import("./live/canary.js")
    .then(({ mountCanary }) => mountCanary(canary, text.canary))
    .catch(() => undefined);
}

// Copy the email address, for phones where a mailto link opens nothing useful.
const status = document.querySelector<HTMLElement>("[data-copy-status]");
document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
  const label = button.querySelector("span");
  const original = label?.textContent ?? "";
  button.addEventListener("click", async () => {
    const value = button.dataset.copy ?? "";
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    if (label) label.textContent = button.dataset.copied ?? original;
    if (status) status.textContent = `${button.dataset.copied}: ${value}`;
    window.setTimeout(() => {
      if (label) label.textContent = original;
    }, 2200);
  });
});
