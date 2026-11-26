/**
 * compare.js — keeps the mobile comparison cards labelled in the current language.
 *
 * The table headers are translated by i18n; the mobile card labels are CSS
 * pseudo-elements fed by `data-label`. Sync them whenever the language changes.
 */

export function initCompare() {
  const table = document.querySelector(".compare-table");
  if (!table) return;

  const head = table.querySelector("thead");
  const body = table.querySelector("tbody");
  if (!head || !body) return;

  function syncLabels() {
    const labels = Array.from(head.querySelectorAll("th")).map(function (th) {
      return th.textContent.trim();
    });

    body.querySelectorAll("tr").forEach(function (row) {
      Array.from(row.children).forEach(function (cell, index) {
        if (cell.tagName !== "TD") return;
        cell.setAttribute("data-label", labels[index] || "");
      });
    });
  }

  syncLabels();
  document.addEventListener("oficioev:languagechange", syncLabels);
}
