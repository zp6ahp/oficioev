/**
 * chrome.js — single responsibility: small page behaviour.
 * Footer year, header border on scroll, and section reveal animation.
 *
 * Why the reveal is built this way:
 *  - the .reveal-ready class is set in <head>, before first paint;
 *  - if the JS module never loads, index.html removes the class after 2.5 s;
 *  - if the observer does not fire (iframe, print, background tab),
 *    a getBoundingClientRect() sweep reveals whatever is on screen;
 *  - with prefers-reduced-motion the class is never added, so no animation.
 * Result: the content can never stay invisible.
 */

export function initChrome() {
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  revealSections();
}

function revealSections() {
  if (!document.documentElement.classList.contains("reveal-ready")) return;

  const sections = Array.from(document.querySelectorAll(".section, .hero"));
  if (!sections.length) return;

  // Module is alive: tell the guard timer not to remove the class.
  document.documentElement.dataset.reveal = "on";

  sections.forEach(function (el) {
    el.setAttribute("data-reveal", "");
  });

  function reveal(el) {
    el.classList.add("is-in");
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.04 }
  );

  sections.forEach(function (el) {
    observer.observe(el);
  });

  // Fallback: manual visibility check instead of the observer.
  function sweep() {
    const height = window.innerHeight || 0;
    sections.forEach(function (el) {
      if (el.classList.contains("is-in")) return;
      const box = el.getBoundingClientRect();
      if (box.top < height * 0.94 && box.bottom > 0) reveal(el);
    });
  }

  sweep();
  window.addEventListener("scroll", sweep, { passive: true });
  window.addEventListener("resize", sweep);
  window.addEventListener("load", sweep);
  window.setTimeout(sweep, 900);
}
