const body = document.body;
const toggle = document.querySelector(".menu-toggle");
const panel = document.querySelector(".mobile-panel");
const closeButton = document.querySelector(".panel-close");
const scrim = document.querySelector("[data-scrim]");
const panelLinks = document.querySelectorAll(".mobile-panel a");
const form = document.querySelector("#interest-form");
const note = document.querySelector("#form-note");
const countEl = document.querySelector("#interest-count");
const copyLink = document.querySelector("[data-copy-link]");

const storageKey = "making-history-vinyl-interest";
const baseInterest = 37;

function setMenu(open) {
  body.classList.toggle("menu-open", open);
  toggle?.setAttribute("aria-expanded", String(open));
  panel?.setAttribute("aria-hidden", String(!open));
}

function getLocalInterest() {
  return Number(localStorage.getItem(storageKey) || 0);
}

function renderCounter() {
  if (!countEl) return;
  countEl.textContent = String(baseInterest + getLocalInterest());
}

toggle?.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
closeButton?.addEventListener("click", () => setMenu(false));
scrim?.addEventListener("click", () => setMenu(false));
panelLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const email = String(data.get("email") || "").trim();
  if (!email) return;

  if (!localStorage.getItem(`${storageKey}:${email.toLowerCase()}`)) {
    localStorage.setItem(storageKey, String(getLocalInterest() + 1));
    localStorage.setItem(`${storageKey}:${email.toLowerCase()}`, "1");
  }

  renderCounter();
  note.textContent = "Registered for this preview. Email platform connection comes later.";
  form.reset();
});

copyLink?.addEventListener("click", async (event) => {
  event.preventDefault();
  await navigator.clipboard?.writeText(window.location.href);
  note.textContent = "Page link copied.";
});

renderCounter();
