/**
 * params.js — single responsibility: URL parameters.
 * ?lang=ru&theme=orange&mode=dark
 */

export function readParams() {
  try {
    return new URLSearchParams(window.location.search);
  } catch {
    return new URLSearchParams("");
  }
}
