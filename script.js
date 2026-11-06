document.addEventListener("DOMContentLoaded", () => {

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isHoverDevice = window.matchMedia("(hover: hover)").matches;

  /* MENU MOBILNE */
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".navigation");

  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Otwórz menu" : "Zamknij menu");
    navigation?.classList.toggle("open", !isOpen);
  });

  navigation?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("open");
      menuButton?.setAttribute("aria-expanded", "false");
      menuButton?.setAttribute("aria-label", "Otwórz menu");
    });
  });

  /* REVEAL */
  const revealElements = document.querySelectorAll(".reveal, .reveal-stagger, .timeline");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }

  /* CURSOR DOT */
  const cursorDot = document.querySelector(".cursor-dot");
  if (cursorDot && isHoverDevice && !prefersReduced) {
    let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0, rafId = null;

    const animate = () => {
      dotX += (mouseX - dotX) * 0.18;
      dotY += (mouseY - dotY) * 0.18;
      cursorDot.style.transform = `translate(${dotX}px, ${dotY}px)`;
      if (Math.abs(mouseX - dotX) > 0.1 || Math.abs(mouseY - dotY) > 0.1) {
        rafId = requestAnimationFrame(animate);
      } else rafId = null;
    };

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (rafId === null) rafId = requestAnimationFrame(animate);
    }, { passive: true });

    document.addEventListener("mouseleave", () => { cursorDot.style.opacity = "0"; });
    document.addEventListener("mouseenter", () => { cursorDot.style.opacity = ".55"; });

    document.querySelectorAll("a, button, summary").forEach((el) => {
      el.addEventListener("mouseenter", () => { cursorDot.style.transform += " scale(2)"; cursorDot.style.opacity = ".35"; });
      el.addEventListener("mouseleave", () => { cursorDot.style.opacity = ".55"; });
    });
  }

  /* MAGNETIC */
  if (isHoverDevice && !prefersReduced) {
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }

  /* 3D TILT */
  if (isHoverDevice && !prefersReduced) {
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -4;
        const rotateY = ((x - cx) / cx) * 4;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* LIGHTBOX */
  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = lightbox?.querySelector("img");
  const closeButton = lightbox?.querySelector(".lightbox-close");

  const openLightbox = (src, alt) => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = src;
    lightboxImage.alt = alt || "Zdjęcie Freda";
    lightbox.showModal();
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    if (!lightbox?.open) return;
    lightbox.close();
    document.body.style.overflow = "";
  };

  document.querySelectorAll(".gallery-card").forEach((card) => {
    card.addEventListener("click", () => {
      const image = card.querySelector("img");
      if (!image) return;
      openLightbox(card.dataset.full || image.src, image.alt);
    });
  });

  closeButton?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("close", () => {
    document.body.style.overflow = "";
  });
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });

  /* LICZNIKI */
  const counters = document.querySelectorAll(".counter");
  if (counters.length && "IntersectionObserver" in window && !prefersReduced) {
    const animateCounter = (el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const suffix = el.dataset.suffix || "";
      const duration = 1800;
      const startTime = performance.now();
      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach((c) => counterObserver.observe(c));
  } else {
    counters.forEach((el) => {
      const target = Number.parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || "";
      el.textContent = (Number.isFinite(target) ? target : 0) + suffix;
    });
  }

  /* PARALLAX */
  const heroImage = document.querySelector(".hero-image-frame img");
  if (heroImage && !prefersReduced) {
    let rafId = null;
    const updateParallax = () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroImage.style.transform = `translateY(${scrolled * 0.08}px) scale(1.02)`;
      }
      rafId = null;
    };
    window.addEventListener("scroll", () => {
      if (rafId === null) rafId = requestAnimationFrame(updateParallax);
    }, { passive: true });
  }

  /* PROGRESS */
  const progressFill = document.getElementById("progressFill");
  if (progressFill) {
    let rafId = null;
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressFill.style.width = percent + "%";
      rafId = null;
    };
    window.addEventListener("scroll", () => {
      if (rafId === null) rafId = requestAnimationFrame(updateProgress);
    }, { passive: true });
    updateProgress();
  }

  /* BACK TO TOP */
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    let rafId = null;
    const toggleVisibility = () => {
      if (window.scrollY > 600) backToTop.classList.add("visible");
      else backToTop.classList.remove("visible");
      rafId = null;
    };
    window.addEventListener("scroll", () => {
      if (rafId === null) rafId = requestAnimationFrame(toggleVisibility);
    }, { passive: true });

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* ROK */
  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* SMOOTH SCROLL */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerOffset = 88;
      const elementPosition = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerOffset,
        behavior: prefersReduced ? "auto" : "smooth"
      });
    });
  });

});