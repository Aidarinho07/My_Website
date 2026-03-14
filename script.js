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

// Ромашка в центре экрана, вращается при прокрутке
const scrollDaisy = () => {
  const wrap = document.getElementById("scroll-daisy");
  if (!wrap) return;
  const deg = window.scrollY * 0.25;
  wrap.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`;
};
const daisyEl = document.createElement("div");
daisyEl.id = "scroll-daisy";
daisyEl.className = "scroll-daisy";
daisyEl.setAttribute("aria-hidden", "true");
daisyEl.innerHTML = `<svg class="scroll-daisy__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g class="petals">
    ${[0, 45, 90, 135, 180, 225, 270, 315].map((r) => `<ellipse class="petal" cx="50" cy="50" rx="10" ry="22" transform="rotate(${r} 50 50)"/>`).join("")}
  </g>
  <circle class="center" cx="50" cy="50" r="14"/>
</svg>`;
document.body.appendChild(daisyEl);
window.addEventListener("scroll", scrollDaisy, { passive: true });
scrollDaisy();

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

// Psychology news parsing from Naked Science section
const psyNewsListEl = document.getElementById("psy-news-list");
const psyNewsFilterEl = document.getElementById("psy-news-filter");
const psyNewsSortEl = document.getElementById("psy-news-sort");
const psyNewsRefreshEl = document.getElementById("psy-news-refresh");
let psyNewsCache = [];

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const monthMap = {
  января: 0,
  февраля: 1,
  марта: 2,
  апреля: 3,
  мая: 4,
  июня: 5,
  июля: 6,
  августа: 7,
  сентября: 8,
  октября: 9,
  ноября: 10,
  декабря: 11,
};

const parseDateScore = (dateText) => {
  if (!dateText) return 0;
  const dotMatch = dateText.match(/(\d{1,2})\.(\d{2})\.(\d{4})/);
  if (dotMatch) {
    const [, d, m, y] = dotMatch;
    return new Date(Number(y), Number(m) - 1, Number(d)).getTime();
  }

  const ruMatch = dateText.toLowerCase().match(/(\d{1,2})\s+([а-яё]+)/);
  if (ruMatch) {
    const day = Number(ruMatch[1]);
    const month = monthMap[ruMatch[2]];
    if (Number.isFinite(day) && month !== undefined) {
      return new Date(new Date().getFullYear(), month, day).getTime();
    }
  }
  return 0;
};

const detectTopic = (item) => {
  const source = `${item.title} ${item.excerpt}`.toLowerCase();
  if (/тревог|стресс|выгоран|паник|депресс|горе/.test(source)) return "stress";
  if (/отношен|любов|близост|партнер|поцелу|влюблен/.test(source)) return "relationships";
  if (/самооцен|цель|призвани|перфекциониз|мотивац|принять себя/.test(source)) return "self";
  return "other";
};

const topicLabel = {
  stress: "Стресс и тревога",
  relationships: "Отношения",
  self: "Самооценка и развитие",
  other: "Другое",
};

const parsePsyNewsFromMirror = (text) => {
  // Mirror content keeps headings like: ### Title
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const items = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.startsWith("### ")) continue;

    const title = line.replace(/^###\s+/, "").trim();
    if (!title || title.length < 8) continue;

    let excerpt = "";
    for (let j = i + 1; j < Math.min(i + 8, lines.length); j += 1) {
      const candidate = lines[j];
      if (!candidate) continue;
      if (candidate.startsWith("#")) continue;
      if (candidate.startsWith("*")) continue;
      excerpt = candidate;
      break;
    }

    let dateText = "";
    for (let j = i - 1; j >= Math.max(0, i - 4); j -= 1) {
      const candidate = lines[j];
      if (/\d{1,2}\s+[а-яА-ЯёЁ]+\b/.test(candidate) || /\d{1,2}\.\d{2}\.\d{4}/.test(candidate)) {
        dateText = candidate;
        break;
      }
    }

    const item = { title, excerpt, dateText };
    items.push({
      ...item,
      topic: detectTopic(item),
      dateScore: parseDateScore(dateText),
    });
    if (items.length >= 12) break;
  }

  return items;
};

const renderPsyNews = (items) => {
  if (!psyNewsListEl) return;

  if (!items.length) {
    psyNewsListEl.innerHTML = `
      <article class="card">
        <h3 class="card__title">Нет новостей по текущему фильтру</h3>
        <p class="card__text">Измените тему или попробуйте обновить ленту.</p>
      </article>
    `;
    return;
  }

  psyNewsListEl.innerHTML = items
    .slice(0, 6)
    .map(
      (item) => `
        <article class="card">
          <span class="news-chip">${escapeHtml(topicLabel[item.topic] || topicLabel.other)}</span>
          ${item.dateText ? `<p class="card__meta">${escapeHtml(item.dateText)}</p>` : ""}
          <h3 class="card__title">${escapeHtml(item.title)}</h3>
          <p class="card__text">${escapeHtml(item.excerpt || "Свежая публикация из раздела психологии.")}</p>
          <a class="card__link" href="https://naked-science.ru/article/psy" target="_blank" rel="noreferrer">Читать в источнике</a>
        </article>
      `,
    )
    .join("");
};

const applyPsyNewsFilters = () => {
  if (!psyNewsListEl) return;
  const filter = psyNewsFilterEl?.value || "all";
  const sortMode = psyNewsSortEl?.value || "newest";

  const filtered = psyNewsCache.filter((item) => filter === "all" || item.topic === filter);
  filtered.sort((a, b) => (sortMode === "oldest" ? a.dateScore - b.dateScore : b.dateScore - a.dateScore));
  renderPsyNews(filtered);
};

const loadLocalPsyNews = async () => {
  if (!psyNewsListEl) return false;
  try {
    const response = await fetch("data/psy-news.json", { method: "GET", cache: "no-store" });
    if (!response.ok) return false;
    const payload = await response.json();
    if (!Array.isArray(payload)) return false;
    psyNewsCache = payload.map((item) => ({
      title: item.title || "",
      excerpt: item.excerpt || "",
      dateText: item.dateText || "",
      topic: item.topic || detectTopic(item),
      dateScore: parseDateScore(item.dateText || ""),
    }));
    applyPsyNewsFilters();
    return psyNewsCache.length > 0;
  } catch (error) {
    return false;
  }
};

const loadPsyNewsFromRemote = async () => {
  if (!psyNewsListEl) return;
  psyNewsListEl.innerHTML = `
    <article class="card">
      <h3 class="card__title">Обновляю новости...</h3>
      <p class="card__text">Секунду, получаю свежую ленту.</p>
    </article>
  `;

  try {
    const mirrorUrl = "https://r.jina.ai/http://naked-science.ru/article/psy";
    const response = await fetch(mirrorUrl, { method: "GET" });
    if (!response.ok) throw new Error(`Bad status: ${response.status}`);
    const text = await response.text();
    psyNewsCache = parsePsyNewsFromMirror(text);
    applyPsyNewsFilters();
  } catch (error) {
    psyNewsCache = [];
    renderPsyNews([]);
  }
};

psyNewsFilterEl?.addEventListener("change", applyPsyNewsFilters);
psyNewsSortEl?.addEventListener("change", applyPsyNewsFilters);
psyNewsRefreshEl?.addEventListener("click", () => loadPsyNewsFromRemote());

const initPsyNews = async () => {
  if (!psyNewsListEl) return;
  const hasLocal = await loadLocalPsyNews();
  if (!hasLocal) {
    await loadPsyNewsFromRemote();
  }
};

initPsyNews();
