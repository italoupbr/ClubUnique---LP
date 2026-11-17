(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero load sequence ---------- */
  const heroStagger = document.querySelector(".reveal-stagger");
  if (heroStagger) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => heroStagger.classList.add("is-loaded"));
    });
    window.setTimeout(() => {
      if (!heroStagger.classList.contains("is-loaded")) {
        heroStagger.classList.add("is-loaded");
      }
    }, 2500);
  }

  /* ---------- Programação — sequential timeline reveal ---------- */
  const timelineItems = document.querySelectorAll("[data-timeline-item]");

  if (prefersReducedMotion) {
    timelineItems.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window && timelineItems.length) {
    const itemObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -10% 0px" }
    );
    timelineItems.forEach((el) => itemObserver.observe(el));
  } else {
    timelineItems.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Programação — spine draws with scroll progress ---------- */
  const spineFill = document.querySelector(".timeline__spine-fill");
  const timeline = document.getElementById("timeline");

  if (spineFill && timeline && !prefersReducedMotion) {
    let ticking = false;

    const updateSpine = () => {
      const rect = timeline.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const drawStart = viewportH * 0.85;
      const drawEnd = viewportH * 0.35;
      const total = rect.height + (drawStart - drawEnd);
      const traveled = drawStart - rect.top;
      const progress = Math.min(1, Math.max(0, traveled / total));
      spineFill.style.transform = `scaleY(${progress})`;
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(updateSpine);
          ticking = true;
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", updateSpine, { passive: true });
    updateSpine();
  } else if (spineFill && prefersReducedMotion) {
    spineFill.style.transform = "scaleY(1)";
  }

  /* ---------- Sticky CTA — mobile, after hero scroll ---------- */
  const stickyCta = document.querySelector("[data-sticky-cta]");
  const hero = document.getElementById("hero");
  const closing = document.getElementById("garanta-sua-vaga");

  if (stickyCta && hero && closing && "IntersectionObserver" in window) {
    let heroPassed = false;
    let investVisible = false;

    const syncSticky = () => {
      const show = heroPassed && !investVisible;
      stickyCta.hidden = !show;
      stickyCta.classList.toggle("is-visible", show);
    };

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        syncSticky();
      },
      { threshold: 0 }
    );

    const investObserver = new IntersectionObserver(
      ([entry]) => {
        investVisible = entry.isIntersecting;
        syncSticky();
      },
      { threshold: 0.15 }
    );

    heroObserver.observe(hero);
    investObserver.observe(closing);
  }
})();
