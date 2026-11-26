/**
 * works.js — keeps the WhatsApp links on the work cards in the current language.
 *
 * The cards are demo formats, so clicking one opens a chat with a short
 * pre-filled message. The message is rebuilt whenever the visitor changes
 * the interface language, instead of always being Spanish.
 */

export function initWorkLinks({ t }) {
  const cards = Array.from(document.querySelectorAll(".work-card"));
  if (!cards.length) return;

  function update() {
    const prefix = t("works.waPrefix");
    if (!prefix) return;

    cards.forEach(function (card) {
      const title = card.querySelector("h3");
      if (!title) return;

      const message = prefix + title.textContent.trim();
      card.setAttribute("href", "https://wa.me/595995690990?text=" + encodeURIComponent(message));
    });
  }

  document.addEventListener("oficioev:languagechange", update);
  update();
}
