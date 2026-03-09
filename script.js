const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const headerEl = document.querySelector(".header");
const onScroll = () => {
  if (!headerEl) return;
  headerEl.classList.toggle("is-scrolled", window.scrollY > 10);
};
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
