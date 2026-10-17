import "./styles.css";
import "./agents.css";

// ------------------------------------------------------------ copy email (phones without a mail app)
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

if (document.documentElement.classList.contains("ag-js")) {
  // Sections play their reveal once, when a quarter of them is on screen.
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    },
    { threshold: 0.25 },
  );
  document.querySelectorAll(".ag-sec").forEach((s) => io.observe(s));

  // Hero: scroll position folds the four sheets (--a) and then raises the answer card (--b).
  const hero = document.querySelector<HTMLElement>(".ag-hero")!;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const ease = (v: number) => 1 - Math.pow(1 - v, 3);
  let queued = false;
  const update = () => {
    queued = false;
    const r = hero.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
    hero.style.setProperty("--a", ease(clamp((p - 0.04) / 0.46)).toFixed(4));
    hero.style.setProperty("--b", ease(clamp((p - 0.42) / 0.38)).toFixed(4));
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  update();
}
