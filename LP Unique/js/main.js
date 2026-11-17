(() => {
  "use strict";


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
