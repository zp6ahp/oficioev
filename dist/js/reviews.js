/**
 * reviews.js — horizontal reviews carousel.
 *
 * Native scrolling handles trackpads. Touch and mouse dragging are handled
 * here so horizontal swipes never turn into the browser's back gesture, and
 * every gesture ends snapped to a card. The side arrows scroll one card at a
 * time and wrap around at both ends.
 */

export function initReviews() {
  const track = document.querySelector("[data-reviews]");
  const prev = document.querySelector("[data-reviews-prev]");
  const next = document.querySelector("[data-reviews-next]");
  if (!track || !prev || !next) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let settle = 0;
  let drag = null;

  function maxScroll() {
    return Math.max(0, track.scrollWidth - track.clientWidth);
  }

  function cardStep() {
    const card = track.querySelector(".review");
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const width = card ? card.getBoundingClientRect().width : track.clientWidth;
    return width + gap;
  }

  function update() {
    const canScroll = maxScroll() > 2;
    prev.disabled = !canScroll;
    next.disabled = !canScroll;
  }

  function cancelSettle() {
    window.clearTimeout(settle);
    settle = 0;
  }

  function animateTo(target) {
    cancelSettle();

    track.scrollTo({
      left: target,
      behavior: reduceMotion.matches ? "auto" : "smooth"
    });

    // Safety net: if smooth scrolling is unavailable or gets interrupted,
    // land on the card anyway instead of leaving the gesture without effect.
    settle = window.setTimeout(function () {
      if (Math.abs(track.scrollLeft - target) > 2) track.scrollLeft = target;
      update();
    }, 420);

    window.setTimeout(update, 60);
  }

  function scrollByCards(direction) {
    const max = maxScroll();
    if (max <= 2) return;

    const from = track.scrollLeft;
    let to = from + direction * cardStep();

    // Wrap around: the arrows never look "dead" at either end.
    if (direction < 0 && from <= 2) to = max;
    if (direction > 0 && from >= max - 2) to = 0;

    animateTo(Math.min(max, Math.max(0, to)));
  }

  function snapToNearest() {
    const step = cardStep();
    const target = Math.min(maxScroll(), Math.max(0, Math.round(track.scrollLeft / step) * step));
    animateTo(target);
  }

  function startDrag(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    cancelSettle();
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: track.scrollLeft,
      horizontal: false,
      active: false
    };
  }

  function moveDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;

    if (!drag.horizontal) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        drag = null; // vertical scroll: let the page do its thing
        return;
      }
      drag.horizontal = true;
      drag.active = true;
      track.classList.add("is-dragging");
      try {
        track.setPointerCapture(event.pointerId);
      } catch {
        /* synthetic events and old browsers: pointer already stays on track */
      }
    }

    track.scrollLeft = drag.left - dx;
    if (event.cancelable) event.preventDefault();
  }

  function endDrag(event) {
    if (!drag || (event && event.pointerId !== drag.id)) return;

    const active = drag.active;
    drag = null;
    if (!active) return;

    track.classList.remove("is-dragging");
    snapToNearest();
  }

  prev.addEventListener("click", function () {
    scrollByCards(-1);
  });
  next.addEventListener("click", function () {
    scrollByCards(1);
  });

  track.addEventListener("pointerdown", startDrag);
  track.addEventListener("pointermove", moveDrag, { passive: false });
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);

  // Safari can still treat a horizontal swipe as "go back". Once the gesture
  // is clearly horizontal inside the carousel, block that default.
  track.addEventListener(
    "touchmove",
    function (event) {
      if (drag && drag.horizontal) event.preventDefault();
    },
    { passive: false }
  );

  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);

  update();
}
