/**
 * mock-scroll.js — sets the distance for the decorative device screens.
 *
 * The mocks animate `top` instead of `transform`. Chrome can promote a
 * transformed scrolling layer above the screen fade, producing a light streak
 * at the top edge on some Retina/ARM frames. A layout offset avoids that
 * compositing path while keeping the same visual loop.
 */

export function initMockScroll() {
  const scrolls = Array.from(document.querySelectorAll(".mock-scroll"));
  if (!scrolls.length) return;

  function measure() {
    scrolls.forEach(function (el) {
      // Two identical pages: one page height is half the scroll height.
      el.style.setProperty("--mock-distance", el.scrollHeight / 2 + "px");
    });
  }

  measure();
  window.addEventListener("load", measure);
  window.addEventListener("resize", measure);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measure);
  }
}
