const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const headerEl = document.querySelector(".header");
const navToggle = document.querySelector(".nav-toggle");
const navEl = document.querySelector("#site-nav");
const navOverlay = document.querySelector(".nav-overlay");

const closeMenu = () => {
  if (!navToggle || !navEl) return;
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.classList.remove("is-active");
  navEl.classList.remove("is-open");
  if (navOverlay) {
    navOverlay.setAttribute("hidden", "");
    navOverlay.classList.remove("is-open");
  }
  document.body.classList.remove("menu-open");
  headerEl?.classList.remove("is-hidden");
};

const openMenu = () => {
  if (!navToggle || !navEl) return;
  navToggle.setAttribute("aria-expanded", "true");
  navToggle.classList.add("is-active");
  navEl.classList.add("is-open");
  if (navOverlay) {
    navOverlay.removeAttribute("hidden");
    requestAnimationFrame(() => navOverlay.classList.add("is-open"));
  }
  document.body.classList.add("menu-open");
  headerEl?.classList.remove("is-hidden");
};

if (navToggle && navEl) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    if (expanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navEl.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });
  navOverlay?.addEventListener("click", () => closeMenu());

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

const onScroll = () => {
  if (!headerEl) return;
  headerEl.classList.toggle("is-scrolled", window.scrollY > 10);

  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  if (!isMobile || document.body.classList.contains("menu-open")) {
    headerEl.classList.remove("is-hidden");
    lastScrollY = window.scrollY;
    return;
  }

  const currentY = window.scrollY;
  const delta = currentY - lastScrollY;

  if (currentY < 24 || delta < -5) {
    headerEl.classList.remove("is-hidden");
  } else if (delta > 8 && currentY > 120) {
    headerEl.classList.add("is-hidden");
  }

  lastScrollY = currentY;
};

let lastScrollY = window.scrollY;
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Hero media position: mobile after subtitle, before booking actions
const heroInnerEl = document.querySelector(".hero__inner");
const heroContentEl = document.querySelector(".hero__content");
const heroMediaEl = document.querySelector(".hero__media");
const heroActionsEl = document.querySelector(".hero__actions");

const relocateHeroMedia = () => {
  if (!heroInnerEl || !heroContentEl || !heroMediaEl || !heroActionsEl) return;
  const isMobile = window.matchMedia("(max-width: 760px)").matches;

  if (isMobile) {
    if (heroMediaEl.parentElement !== heroContentEl) {
      heroContentEl.insertBefore(heroMediaEl, heroActionsEl);
    }
  } else if (heroMediaEl.parentElement !== heroInnerEl) {
    heroInnerEl.appendChild(heroMediaEl);
  }
};

relocateHeroMedia();
window.addEventListener("resize", relocateHeroMedia);

// Smooth anchor navigation with focus management
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id === "#") return;

    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });

    if (target instanceof HTMLElement) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.addEventListener(
        "blur",
        () => {
          target.removeAttribute("tabindex");
        },
        { once: true },
      );
    }
  });
});

// Explicit "scroll to top" handling for fixed/mobile controls
document.querySelectorAll("[data-scroll-top='true']").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    closeMenu();
  });
});

// Reveal-on-scroll animation + graceful fallback
const revealEls = document.querySelectorAll(".reveal");
const hasIntersectionObserver = "IntersectionObserver" in window;

if (revealEls.length > 0) {
  if (hasIntersectionObserver) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" },
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback for old browsers: just show content.
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }
}

// Counter animation for hero stats + fallback
const counters = document.querySelectorAll("[data-counter]");
const animateCounter = (el) => {
  if (el.dataset.animated === "1") return;

  const target = Number(el.getAttribute("data-counter"));
  if (!Number.isFinite(target) || target <= 0) return;

  el.dataset.animated = "1";

  const duration = 1000;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    const value = Math.round(target * eased);
    el.textContent = String(value);
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

if (counters.length > 0) {
  if (hasIntersectionObserver) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.1 },
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach((counter) => animateCounter(counter));
  }
}

// Documents lightbox with keyboard and swipe navigation
const docLinks = Array.from(document.querySelectorAll(".gallery [data-lightbox='docs']"));
const lightboxEl = document.getElementById("lightbox");
const lightboxImg = lightboxEl?.querySelector(".lightbox__image");
const lightboxCaption = lightboxEl?.querySelector(".lightbox__caption");
const lightboxCounter = lightboxEl?.querySelector(".lightbox__counter");
const lightboxClose = lightboxEl?.querySelector(".lightbox__close");
const lightboxBackdrop = lightboxEl?.querySelector(".lightbox__backdrop");
const lightboxPrev = lightboxEl?.querySelector(".lightbox__nav--prev");
const lightboxNext = lightboxEl?.querySelector(".lightbox__nav--next");
const lightboxViewport = lightboxEl?.querySelector(".lightbox__viewport");

let lightboxIndex = 0;

const renderLightbox = () => {
  if (!lightboxEl || !lightboxImg || !lightboxCaption || !lightboxCounter || docLinks.length === 0) return;

  const safeIndex = ((lightboxIndex % docLinks.length) + docLinks.length) % docLinks.length;
  lightboxIndex = safeIndex;
  const link = docLinks[safeIndex];
  const img = link.querySelector("img");

  lightboxImg.setAttribute("src", link.getAttribute("href") || "");
  lightboxImg.setAttribute("alt", img?.getAttribute("alt") || "Документ");
  lightboxCaption.textContent = img?.getAttribute("alt") || "Документ о квалификации";
  lightboxCounter.textContent = `${safeIndex + 1} / ${docLinks.length}`;
};

const openLightbox = (index) => {
  if (!lightboxEl || docLinks.length === 0) return;
  lightboxIndex = index;
  renderLightbox();
  lightboxEl.removeAttribute("hidden");
  document.body.classList.add("lightbox-open");
};

const closeLightbox = () => {
  if (!lightboxEl) return;
  lightboxEl.setAttribute("hidden", "");
  document.body.classList.remove("lightbox-open");
};

const stepLightbox = (direction) => {
  lightboxIndex += direction;
  renderLightbox();
};

if (lightboxEl && docLinks.length > 0) {
  docLinks.forEach((link, index) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      openLightbox(index);
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxBackdrop?.addEventListener("click", closeLightbox);
  lightboxPrev?.addEventListener("click", () => stepLightbox(-1));
  lightboxNext?.addEventListener("click", () => stepLightbox(1));

  document.addEventListener("keydown", (e) => {
    if (lightboxEl.hasAttribute("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
  });

  let pointerStartX = 0;
  let pointerDiffX = 0;
  let pointerActive = false;

  lightboxViewport?.addEventListener("pointerdown", (e) => {
    pointerActive = true;
    pointerStartX = e.clientX;
    pointerDiffX = 0;
  });

  lightboxViewport?.addEventListener("pointermove", (e) => {
    if (!pointerActive) return;
    pointerDiffX = e.clientX - pointerStartX;
  });

  const onPointerEnd = () => {
    if (!pointerActive) return;
    pointerActive = false;
    if (Math.abs(pointerDiffX) < 50) return;
    if (pointerDiffX < 0) stepLightbox(1);
    if (pointerDiffX > 0) stepLightbox(-1);
  };

  lightboxViewport?.addEventListener("pointerup", onPointerEnd);
  lightboxViewport?.addEventListener("pointercancel", onPointerEnd);
  lightboxViewport?.addEventListener("pointerleave", onPointerEnd);
}

// Micro-interaction on tap/click for buttons
document.querySelectorAll(".button").forEach((button) => {
  button.addEventListener("pointerdown", () => {
    button.classList.remove("is-tapped");
    // Force reflow so animation can replay
    void button.offsetWidth;
    button.classList.add("is-tapped");
  });

  button.addEventListener("animationend", () => {
    button.classList.remove("is-tapped");
  });
});
