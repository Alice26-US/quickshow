export const THEME_STORAGE_KEY = "quickshow-theme";

const VALID_THEMES = new Set(["light", "dark"]);

export const getSystemTheme = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const normalizeTheme = (value, fallback = "dark") => {
  return VALID_THEMES.has(value) ? value : fallback;
};

export const getStoredTheme = () => {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return VALID_THEMES.has(saved) ? saved : null;
  } catch {
    return null;
  }
};

export const getInitialTheme = () => {
  const stored = getStoredTheme();
  if (stored) return stored;
  return getSystemTheme();
};

export const applyTheme = (theme) => {
  if (typeof document === "undefined") return;

  const resolved = normalizeTheme(theme, "dark");
  const root = document.documentElement;

  root.classList.remove("theme-light", "theme-dark");
  root.classList.add(resolved === "light" ? "theme-light" : "theme-dark");
  root.setAttribute("data-theme", resolved);
};
