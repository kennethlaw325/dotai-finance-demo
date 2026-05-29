// Client-side runtime config (BYOK pattern: user brings own key, stored in LocalStorage)
// Build-time env vars (.env.local) only used as fallback during dev.

export interface MimoConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const KEY = "dotai-finance:mimo-config";

const DEFAULTS = {
  baseUrl: "https://token-plan-sgp.xiaomimimo.com/v1",
  model: "mimo-v2-omni"
};

export function loadMimoConfig(): MimoConfig {
  let stored: Partial<MimoConfig> = {};
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) stored = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  // SECURITY: env-var fallback ONLY in dev. Production builds must never embed
  // an API key in the bundle — students supply their own via Settings UI.
  const envApiKey = import.meta.env.DEV
    ? (import.meta.env.VITE_MIMO_API_KEY as string | undefined)
    : undefined;
  const envBaseUrl = import.meta.env.DEV
    ? (import.meta.env.VITE_MIMO_BASE_URL as string | undefined)
    : undefined;
  const envModel = import.meta.env.DEV
    ? (import.meta.env.VITE_MIMO_MODEL as string | undefined)
    : undefined;
  return {
    apiKey: stored.apiKey ?? envApiKey ?? "",
    baseUrl: stored.baseUrl ?? envBaseUrl ?? DEFAULTS.baseUrl,
    model: stored.model ?? envModel ?? DEFAULTS.model
  };
}

export function saveMimoConfig(cfg: Partial<MimoConfig>): void {
  const current = loadMimoConfig();
  const next = { ...current, ...cfg };
  // Only persist user-supplied values; if apiKey blank, clear stored config entirely
  if (!next.apiKey) {
    localStorage.removeItem(KEY);
    return;
  }
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearMimoConfig(): void {
  localStorage.removeItem(KEY);
}

export function hasUserKey(): boolean {
  return loadMimoConfig().apiKey.length > 0;
}
