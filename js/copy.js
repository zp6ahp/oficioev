/**
 * copy.js — single responsibility: clipboard copying.
 * Takes the "Copiar" / "¡Copiado!" labels from i18n via the given t() function.
 */

export function initCopy({ t }) {
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    const label = btn.querySelector("[data-copy-label]");

    btn.addEventListener("click", function () {
      const value = btn.getAttribute("data-copy") || "";

      const done = function () {
        if (!label) return;
        label.textContent = t("contact.copied") || "¡Copiado!";
        window.setTimeout(function () {
          label.textContent = t("contact.copy") || "";
        }, 1600);
      };

      const fallback = function () {
        const input = document.createElement("textarea");
        input.value = value;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        try {
          document.execCommand("copy");
          done();
        } catch {
          /* ignore: copying is not critical */
        }
        document.body.removeChild(input);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done).catch(fallback);
      } else {
        fallback();
      }
    });
  });
}
