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
