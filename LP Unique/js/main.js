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

  /* ---------- Pix copy-and-paste ---------- */
  let pixStatus = document.getElementById("pix-copy-status");
  if (!pixStatus) {
    pixStatus = document.createElement("div");
    pixStatus.id = "pix-copy-status";
    pixStatus.className = "sr-only";
    pixStatus.setAttribute("aria-live", "polite");
    pixStatus.setAttribute("aria-atomic", "true");
    document.body.appendChild(pixStatus);
  }

  document.querySelectorAll("[data-pix-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.getAttribute("data-pix-copy");
      try {
        await navigator.clipboard.writeText(code);
      } catch (err) {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      button.setAttribute("data-copied", "");
      pixStatus.textContent = "Código Pix copiado.";
      window.clearTimeout(button._copyTimeout);
      button._copyTimeout = window.setTimeout(() => {
        button.removeAttribute("data-copied");
        pixStatus.textContent = "";
      }, 1800);
    });
  });

  /* ---------- Sticky CTA — mobile, after hero scroll ---------- */
  const stickyCta = document.querySelector("[data-sticky-cta]");
  const hero = document.getElementById("hero");
  const investimento = document.getElementById("investimento");

  if (stickyCta && hero && investimento && "IntersectionObserver" in window) {
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
    investObserver.observe(investimento);
  }
})();
