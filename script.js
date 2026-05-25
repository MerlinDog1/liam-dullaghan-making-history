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
const noteCards = Array.from(document.querySelectorAll("[data-note-index]"));
const noteLightbox = document.querySelector(".note-lightbox");
const noteLightboxImage = noteLightbox?.querySelector("img");
const noteLightboxClose = document.querySelector(".note-lightbox-close");
const noteLightboxPrev = document.querySelector(".note-lightbox-prev");
const noteLightboxNext = document.querySelector(".note-lightbox-next");

const storageKey = "making-history-vinyl-interest";
const baseInterest = 37;
const noteImages = noteCards.map((card) => {
  const image = card.querySelector("img");
  return {
    src: image?.getAttribute("src") || "",
    alt: image?.getAttribute("alt") || "",
  };
});
let activeNoteIndex = 0;

if (noteImages.length <= 1) {
  noteLightboxPrev?.setAttribute("hidden", "");
  noteLightboxNext?.setAttribute("hidden", "");
}

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

function setActiveNote(index) {
  if (!noteLightboxImage || noteImages.length === 0) return;
  activeNoteIndex = (index + noteImages.length) % noteImages.length;
  noteLightboxImage.src = noteImages[activeNoteIndex].src;
  noteLightboxImage.alt = noteImages[activeNoteIndex].alt;
}

toggle?.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
closeButton?.addEventListener("click", () => setMenu(false));
scrim?.addEventListener("click", () => setMenu(false));
panelLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
    noteLightbox?.close();
  }
  if (!noteLightbox?.open) return;
  if (event.key === "ArrowLeft") setActiveNote(activeNoteIndex - 1);
  if (event.key === "ArrowRight") setActiveNote(activeNoteIndex + 1);
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

noteCards.forEach((card) => {
  card.addEventListener("click", () => {
    setActiveNote(Number(card.dataset.noteIndex || 0));
    noteLightbox?.showModal();
  });
});

noteLightboxClose?.addEventListener("click", () => noteLightbox?.close());
noteLightboxPrev?.addEventListener("click", () => setActiveNote(activeNoteIndex - 1));
noteLightboxNext?.addEventListener("click", () => setActiveNote(activeNoteIndex + 1));

noteLightbox?.addEventListener("click", (event) => {
  if (event.target === noteLightbox) noteLightbox.close();
});

renderCounter();
