// Client-side runtime config (BYOK pattern: user brings own key, stored in LocalStorage)
// Build-time env vars (.env.local) only used as fallback during dev.
//
// Provider-agnostic — any OpenAI-compatible vision endpoint works.
// No default provider; user picks via Settings (preset buttons or custom).

export interface MimoConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const KEY = "dotai-finance:mimo-config";

const DEFAULTS = {
  baseUrl: "",
  model: ""
};

export interface ProviderPreset {
  label: string;
  baseUrl: string;
  model: string;
  helpUrl: string;
  note: string;
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    helpUrl: "https://platform.openai.com/api-keys",
    note: "GPT-4o-mini 支援 vision，便宜常用"
  },
  {
    label: "Xiaomi MiMo",
    baseUrl: "https://token-plan-sgp.xiaomimimo.com/v1",
    model: "mimo-v2-omni",
    helpUrl: "https://platform.xiaomimimo.com/",
    note: "100T Token 計劃，mimo-v2-omni 係多模態"
  },
  {
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "google/gemini-2.5-flash",
    helpUrl: "https://openrouter.ai/keys",
    note: "代理多個 provider，gemini-2.5-flash 平兼快"
  }
];

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
