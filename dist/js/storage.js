/**
 * storage.js — single responsibility: settings persistence.
 * Knows nothing about the DOM, themes or languages.
 */

export function createStorage(prefix) {
  return {
    get(key) {
      try {
        return localStorage.getItem(prefix + key);
      } catch {
        return null; // private browsing mode
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(prefix + key, value);
      } catch {
        /* silent: the setting is not critical */
      }
    }
  };
}
