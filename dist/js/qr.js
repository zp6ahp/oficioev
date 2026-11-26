/**
 * qr.js — QR dialog for moving the current page or a contact from desktop
 * to a phone. The QR library is loaded only when a QR button is pressed.
 */

let qrLibrary;

function getQrLibrary() {
  if (!qrLibrary) qrLibrary = import("./vendor/qrcode.mjs");
  return qrLibrary;
}

export function initQr() {
  const triggers = Array.from(document.querySelectorAll("[data-qr-open]"));
  const dialog = document.querySelector("[data-qr-dialog]");
  if (!triggers.length || !dialog) return;

  const box = dialog.querySelector("[data-qr-code]");
  const urlLine = dialog.querySelector("[data-qr-url]");
  const localNote = dialog.querySelector("[data-qr-local]");
  const closeButton = dialog.querySelector("[data-qr-close]");
  if (!box || !urlLine || !closeButton) return;

  function close() {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  async function open(trigger) {
    const url = trigger.getAttribute("data-qr-url") || location.origin + location.pathname;

    urlLine.textContent = url;

    if (localNote) {
      const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
      localNote.hidden = !local;
    }

    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");

    closeButton.focus({ preventScroll: true });

    try {
      const { qrcode } = await getQrLibrary();
      const qr = qrcode(0, "M");
      qr.addData(url);
      qr.make();
      box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 4, scalable: true });
    } catch {
      box.textContent = "—";
    }
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      open(trigger);
    });
  });

  closeButton.addEventListener("click", close);

  dialog.addEventListener("click", function (event) {
    // Click on the backdrop (outside the card) closes the dialog.
    if (event.target === dialog) close();
  });
}

initQr();
