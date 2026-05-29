export type ThemeKey = "luxury" | "pixel";

const KEY = "dotai-finance:theme";

export function loadTheme(): ThemeKey {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "pixel" || v === "luxury") return v;
  } catch {
    /* ignore */
  }
  return "luxury";
}

export function saveTheme(t: ThemeKey): void {
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* ignore */
  }
  document.documentElement.setAttribute("data-theme", t);
}
