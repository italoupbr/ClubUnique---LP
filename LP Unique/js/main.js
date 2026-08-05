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

  /* ---------- Venue carousel ---------- */
  document.querySelectorAll("[data-venue-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-venue-track]");
    const slides = carousel.querySelectorAll(".venue__slide");
    const prevBtn = carousel.querySelector("[data-venue-prev]");
    const nextBtn = carousel.querySelector("[data-venue-next]");
    const currentEl = carousel.querySelector("[data-venue-current]");
    const totalEl = carousel.querySelector("[data-venue-total]");
    const dotsRoot = carousel.querySelector("[data-venue-dots]");

    if (!track || !slides.length) return;

    let index = 0;
    const total = slides.length;
    if (totalEl) totalEl.textContent = String(total);

    const dots = Array.from({ length: total }, (_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "venue__dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Foto ${i + 1} de ${total}`);
      dot.addEventListener("click", () => goTo(i));
      dotsRoot?.appendChild(dot);
      return dot;
    });

    const update = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      if (currentEl) currentEl.textContent = String(index + 1);
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === total - 1;
      dots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });
    };

    const goTo = (nextIndex) => {
      index = Math.max(0, Math.min(total - 1, nextIndex));
      update();
    };

    prevBtn?.addEventListener("click", () => goTo(index - 1));
    nextBtn?.addEventListener("click", () => goTo(index + 1));

    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(index - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(index + 1);
      }
    });

    if (!prefersReducedMotion) {
      let touchStartX = 0;
      track.addEventListener(
        "touchstart",
        (event) => {
          touchStartX = event.changedTouches[0]?.clientX ?? 0;
        },
        { passive: true }
      );
      track.addEventListener(
        "touchend",
        (event) => {
          const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX;
          if (Math.abs(delta) < 40) return;
          goTo(delta < 0 ? index + 1 : index - 1);
        },
        { passive: true }
      );
    }

    if (prefersReducedMotion) {
      track.style.transition = "none";
    }

    carousel.setAttribute("tabindex", "0");
    update();
  });

  /* ---------- Venue video — YouTube embed on play ---------- */
  document.querySelectorAll("[data-venue-video]").forEach((wrap) => {
    const videoId = wrap.getAttribute("data-youtube-id");
    const playBtn = wrap.querySelector(".venue__play");
    if (!videoId || !playBtn) return;

    const loadVideo = () => {
      if (wrap.querySelector(".venue__iframe")) return;

      const params = new URLSearchParams({
        autoplay: "1",
        rel: "0",
        modestbranding: "1",
        playsinline: "1",
        enablejsapi: "1",
      });

      if (window.location.origin && window.location.origin !== "null") {
        params.set("origin", window.location.origin);
      }

      const iframe = document.createElement("iframe");
      iframe.className = "venue__iframe";
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
      iframe.title = "Tour pelo espaço, Club Unique";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      wrap.appendChild(iframe);
      wrap.classList.add("is-playing");
    };

    playBtn.addEventListener("click", loadVideo);
  });

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
