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
const themeButtons = Array.from(document.querySelectorAll("[data-theme-choice]"));
const noteCards = Array.from(document.querySelectorAll("[data-note-index]"));
const noteLightbox = document.querySelector(".note-lightbox");
const noteLightboxImage = noteLightbox?.querySelector("img");
const noteLightboxClose = document.querySelector(".note-lightbox-close");
const noteLightboxPrev = document.querySelector(".note-lightbox-prev");
const noteLightboxNext = document.querySelector(".note-lightbox-next");
const pressCards = Array.from(document.querySelectorAll("[data-press-index]"));

const storageKey = "making-history-vinyl-interest";
const themeStorageKey = "making-history-theme";
const baseInterest = 37;
const noteImages = noteCards.map((card) => {
  const image = card.querySelector("img");
  return {
    src: image?.getAttribute("src") || "",
    alt: image?.getAttribute("alt") || "",
  };
});
let activeNoteIndex = 0;
let activeNoteImages = noteImages;

const pressImages = pressCards.map((card) => {
  const image = card.querySelector("img");
  return {
    src: image?.getAttribute("src") || "",
    alt: image?.getAttribute("alt") || "",
  };
});

const studioCards = Array.from(document.querySelectorAll("[data-studio-index]"));
const studioLightbox = document.querySelector(".studio-lightbox");
const studioLightboxImage = studioLightbox?.querySelector("img");
const studioLightboxClose = document.querySelector(".studio-lightbox-close");
const studioLightboxPrev = document.querySelector(".studio-lightbox-prev");
const studioLightboxNext = document.querySelector(".studio-lightbox-next");

const studioImages = studioCards.map((card) => {
  const image = card.querySelector("img");
  return {
    src: image?.getAttribute("src") || "",
    alt: image?.getAttribute("alt") || "",
  };
});
let activeStudioIndex = 0;

if (studioImages.length <= 1) {
  studioLightboxPrev?.setAttribute("hidden", "");
  studioLightboxNext?.setAttribute("hidden", "");
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

function setTheme(theme) {
  const isLight = theme === "light";
  body.classList.toggle("light-mode", isLight);
  themeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme));
  });
  localStorage.setItem(themeStorageKey, theme);
}

function setActiveNote(index, images = activeNoteImages) {
  if (!noteLightboxImage || images.length === 0) return;
  activeNoteImages = images;
  activeNoteIndex = (index + activeNoteImages.length) % activeNoteImages.length;
  noteLightboxImage.src = activeNoteImages[activeNoteIndex].src;
  noteLightboxImage.alt = activeNoteImages[activeNoteIndex].alt;
  noteLightboxPrev?.toggleAttribute("hidden", activeNoteImages.length <= 1);
  noteLightboxNext?.toggleAttribute("hidden", activeNoteImages.length <= 1);
}

function setActiveStudio(index) {
  if (!studioLightboxImage || studioImages.length === 0) return;
  activeStudioIndex = (index + studioImages.length) % studioImages.length;
  studioLightboxImage.src = studioImages[activeStudioIndex].src;
  studioLightboxImage.alt = studioImages[activeStudioIndex].alt;
}

toggle?.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
closeButton?.addEventListener("click", () => setMenu(false));
scrim?.addEventListener("click", () => setMenu(false));
panelLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));
themeButtons.forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.themeChoice || "dark"));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
    noteLightbox?.close();
    studioLightbox?.close();
  }
  if (noteLightbox?.open) {
    if (event.key === "ArrowLeft") setActiveNote(activeNoteIndex - 1);
    if (event.key === "ArrowRight") setActiveNote(activeNoteIndex + 1);
  }
  if (studioLightbox?.open) {
    if (event.key === "ArrowLeft") setActiveStudio(activeStudioIndex - 1);
    if (event.key === "ArrowRight") setActiveStudio(activeStudioIndex + 1);
  }
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
    setActiveNote(Number(card.dataset.noteIndex || 0), noteImages);
    noteLightbox?.showModal();
  });
});

pressCards.forEach((card) => {
  card.addEventListener("click", () => {
    setActiveNote(Number(card.dataset.pressIndex || 0), pressImages);
    noteLightbox?.showModal();
  });
});

noteLightboxClose?.addEventListener("click", () => noteLightbox?.close());
noteLightboxPrev?.addEventListener("click", () => setActiveNote(activeNoteIndex - 1));
noteLightboxNext?.addEventListener("click", () => setActiveNote(activeNoteIndex + 1));

noteLightbox?.addEventListener("click", (event) => {
  if (event.target === noteLightbox) noteLightbox.close();
});

studioCards.forEach((card) => {
  card.addEventListener("click", () => {
    setActiveStudio(Number(card.dataset.studioIndex || 0));
    studioLightbox?.showModal();
  });
});

studioLightboxClose?.addEventListener("click", () => studioLightbox?.close());
studioLightboxPrev?.addEventListener("click", () => setActiveStudio(activeStudioIndex - 1));
studioLightboxNext?.addEventListener("click", () => setActiveStudio(activeStudioIndex + 1));

studioLightbox?.addEventListener("click", (event) => {
  if (event.target === studioLightbox) studioLightbox.close();
});

renderCounter();
setTheme(localStorage.getItem(themeStorageKey) || "dark");
