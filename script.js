const body = document.body;
const toggle = document.querySelector(".menu-toggle");
const panel = document.querySelector(".mobile-panel");
const closeButton = document.querySelector(".panel-close");
const scrim = document.querySelector("[data-scrim]");
const panelLinks = document.querySelectorAll(".mobile-panel a");
const form = document.querySelector("#interest-form");
const note = document.querySelector("#form-note");
const countEl = document.querySelector("#interest-count");
const counterEl = document.querySelector("#interest-counter");
const countLabel = document.querySelector("#interest-label");
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
// Vinyl interest list: Supabase project "making-history". This public key can only call the two list functions;
// it cannot read the emails.
const interestApi = "https://pxdbewtikunsjuwmmzxi.supabase.co/rest/v1/rpc";
const interestKey = "sb_publishable_KIk92v1qAecFYP2Zxat2iQ_6fIfX1rd";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let shownCount = 0;
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

// The old preview counted sign-ups in each visitor's own browser; clear what it stored.
function clearLocalInterest() {
  try {
    Object.keys(localStorage)
      .filter((key) => key === storageKey || key.startsWith(`${storageKey}:`))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage can be blocked; nothing to clear then.
  }
}

async function callInterest(name, payload) {
  const response = await fetch(`${interestApi}/${name}`, {
    method: "POST",
    headers: { apikey: interestKey, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || `HTTP ${response.status}`);
  return Number(result);
}

function renderCounter(count, animate = false) {
  if (!countEl || !Number.isFinite(count)) return;
  const from = shownCount;
  shownCount = count;
  if (countLabel) {
    countLabel.textContent = count === 1 ? "person has registered interest" : "people have registered interest";
  }
  if (counterEl) counterEl.hidden = false;
  if (!animate || reducedMotion.matches || count <= from) {
    countEl.textContent = String(count);
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min(1, (now - start) / 700);
    countEl.textContent = String(Math.round(from + (count - from) * (1 - (1 - progress) ** 3)));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function loadCounter() {
  callInterest("vinyl_interest_count", {})
    .then((count) => renderCounter(count))
    .catch(() => {
      // Leave the counter hidden rather than show a wrong number.
    });
}

// A short confetti burst from the button, in the site's own colours.
function celebrate(origin) {
  if (reducedMotion.matches || !origin) return;
  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  canvas.setAttribute("aria-hidden", "true");
  body.append(canvas);
  const context = canvas.getContext("2d");
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;

  const theme = getComputedStyle(body);
  const colours = ["--accent", "--ink", "--muted", "--faint"]
    .map((name) => theme.getPropertyValue(name).trim())
    .concat(["#3e7f92", "#fffaf0"])
    .filter(Boolean);
  const box = origin.getBoundingClientRect();
  const pieces = Array.from({ length: 150 }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95;
    const speed = 7 + Math.random() * 10;
    return {
      x: box.left + box.width / 2,
      y: box.top + box.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      width: 6 + Math.random() * 6,
      height: 9 + Math.random() * 9,
      spin: Math.random() * Math.PI,
      spinSpeed: (Math.random() - 0.5) * 0.3,
      flip: Math.random() * Math.PI,
      colour: colours[Math.floor(Math.random() * colours.length)],
    };
  });

  const duration = 3200;
  const start = performance.now();
  let last = start;
  const frame = (now) => {
    const elapsed = now - start;
    const dt = Math.min(2.5, (now - last) / 16.7);
    last = now;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.globalAlpha = Math.max(0, 1 - Math.max(0, elapsed - duration * 0.6) / (duration * 0.4));
    pieces.forEach((piece) => {
      piece.vy += 0.28 * dt;
      piece.vx *= 0.985 ** dt;
      piece.x += piece.vx * dt;
      piece.y += piece.vy * dt;
      piece.spin += piece.spinSpeed * dt;
      piece.flip += 0.12 * dt;
      const height = piece.height * Math.abs(Math.cos(piece.flip));
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.spin);
      context.fillStyle = piece.colour;
      context.fillRect(-piece.width / 2, -height / 2, piece.width, height);
      context.restore();
    });
    if (elapsed < duration) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
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

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  // Bots fill in every field, including the hidden one people never see.
  if (String(data.get("website") || "")) return;
  const email = String(data.get("email") || "").trim();
  if (!email) return;

  const button = form.querySelector('button[type="submit"]');
  if (button) button.disabled = true;
  note.textContent = "Adding you to the list…";
  try {
    const count = await callInterest("register_vinyl_interest", { p_email: email });
    renderCounter(count, true);
    note.textContent = "Thank you! You're on the list. We'll email you when the pre-order goes live.";
    form.reset();
    celebrate(button);
  } catch (error) {
    note.textContent = /invalid email/i.test(error.message)
      ? "That email address doesn't look quite right. Please check it and try again."
      : "Sorry, that didn't go through. Please try again in a moment.";
  } finally {
    if (button) button.disabled = false;
  }
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

clearLocalInterest();
loadCounter();
setTheme(localStorage.getItem(themeStorageKey) || "dark");
