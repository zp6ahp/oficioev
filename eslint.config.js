/**
 * ESLint flat config. Browser globals are declared explicitly so the
 * site stays dependency-free at runtime; tooling is development-only.
 */

const browserGlobals = {
  window: "readonly",
  document: "readonly",
  location: "readonly",
  localStorage: "readonly",
  navigator: "readonly",
  getComputedStyle: "readonly",
  IntersectionObserver: "readonly",
  URLSearchParams: "readonly"
};

export default [
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: browserGlobals
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["error", { args: "none" }],
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "smart"],
      "no-console": "error"
    }
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { console: "readonly", process: "readonly" }
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["error", { args: "none" }],
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "smart"],
      "no-console": "off"
    }
  }
];
