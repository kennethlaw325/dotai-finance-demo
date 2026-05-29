export type ThemeKey = "luxury" | "pixel" | "classic";

export const THEME_KEYS: ThemeKey[] = ["luxury", "pixel", "classic"];

export const THEME_LABELS: Record<ThemeKey, string> = {
  luxury: "Luxury",
  pixel: "Pixel",
  classic: "Classic"
};

const KEY = "dotai-finance:theme";

export function loadTheme(): ThemeKey {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "pixel" || v === "luxury" || v === "classic") return v;
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
