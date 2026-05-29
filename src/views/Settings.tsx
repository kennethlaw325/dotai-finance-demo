import { useEffect, useState } from "react";
import { ExternalLink, KeyRound, Save, Trash2 } from "lucide-react";
import {
  PROVIDER_PRESETS,
  clearMimoConfig,
  loadMimoConfig,
  saveMimoConfig,
  type ProviderPreset
} from "../lib/config";
import type { ToastMsg } from "../components/Toast";

export function SettingsView({
  pushToast,
  onChange
}: {
  pushToast: (t: Omit<ToastMsg, "id">) => void;
  onChange: () => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [show, setShow] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    const cfg = loadMimoConfig();
    setApiKey(cfg.apiKey);
    setBaseUrl(cfg.baseUrl);
    setModel(cfg.model);
    const match = PROVIDER_PRESETS.find(
      (p) => p.baseUrl === cfg.baseUrl && p.model === cfg.model
    );
    setActivePreset(match?.label ?? null);
  }, []);

  function applyPreset(p: ProviderPreset) {
    setBaseUrl(p.baseUrl);
    setModel(p.model);
    setActivePreset(p.label);
  }

  function save() {
    saveMimoConfig({ apiKey: apiKey.trim(), baseUrl: baseUrl.trim(), model: model.trim() });
    onChange();
    pushToast({
      kind: "success",
      text: apiKey ? "已儲存設定（只存喺你個 browser）" : "已清除 API key，會切回 mock mode"
    });
  }

  function clear() {
    clearMimoConfig();
    setApiKey("");
    setBaseUrl("");
    setModel("");
    setActivePreset(null);
    onChange();
    pushToast({ kind: "warn", text: "已清除所有設定" });
  }

  const activePresetObj = PROVIDER_PRESETS.find((p) => p.label === activePreset);

  return (
    <div className="space-y-10 max-w-2xl">
      <header>
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted">
          Section · 04
        </div>
        <h2 className="font-display text-3xl sm:text-4xl text-ink mt-2 leading-tight">
          Settings
        </h2>
        <p className="text-muted text-sm mt-3 max-w-md leading-relaxed">
          配置 Vision API（OpenAI-compatible schema）。Key 只存喺呢部機。
        </p>
      </header>

      <section className="space-y-8">
        <div className="flex items-start gap-3 border-l border-accent pl-4">
          <KeyRound className="size-4 mt-1 shrink-0 text-accent" />
          <div className="text-sm text-muted leading-relaxed">
            <div className="text-[11px] uppercase tracking-[0.2em] text-accent">
              Bring your own key
            </div>
            <p className="mt-1">
              API key 只存喺你個 browser LocalStorage，唔會 send 去任何 server，亦唔會跟 deploy 出去。冇 key 就走 mock mode（5 個 sample 收據）。
            </p>
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted mb-3">
            Provider preset
          </div>
          <div className="flex flex-wrap gap-2">
            {PROVIDER_PRESETS.map((p) => {
              const active = activePreset === p.label;
              return (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className={`px-4 py-2 border text-sm uppercase tracking-[0.1em] transition-colors ${
                    active
                      ? "border-accent text-accent"
                      : "border-line text-muted hover:text-ink hover:border-ink"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          {activePresetObj && (
            <p className="text-xs text-muted mt-3 leading-relaxed">
              {activePresetObj.note}
              {" · "}
              <a
                href={activePresetObj.helpUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-accent hover:underline uppercase tracking-[0.15em]"
              >
                Get key
                <ExternalLink className="size-3" />
              </a>
            </p>
          )}
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.25em] text-muted">
              API key
            </span>
            <div className="flex gap-2 mt-2">
              <input
                type={show ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-... 或 tp-..."
                className="input flex-1 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="px-4 border border-line text-[11px] uppercase tracking-[0.15em] text-muted hover:text-ink hover:border-ink transition-colors"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.25em] text-muted">
              Base URL
            </span>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value);
                setActivePreset(null);
              }}
              placeholder="https://api.openai.com/v1"
              className="input w-full mt-2 font-mono text-sm"
            />
          </label>

          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.25em] text-muted">
              Model
            </span>
            <input
              type="text"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setActivePreset(null);
              }}
              placeholder="gpt-4o-mini"
              className="input w-full mt-2 font-mono text-sm"
            />
          </label>
        </div>

        <div className="flex justify-between pt-4 border-t border-line">
          <button
            onClick={clear}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-[0.15em] text-danger hover:opacity-80 transition-opacity"
          >
            <Trash2 className="size-3.5" />
            Clear
          </button>
          <button
            onClick={save}
            className="flex items-center gap-2 px-5 py-2 border border-accent text-accent text-sm uppercase tracking-[0.15em] hover:bg-accent hover:text-canvas transition-colors"
          >
            <Save className="size-4" />
            Save
          </button>
        </div>
      </section>

      <section className="border-t border-line pt-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted mb-3">
          Privacy
        </div>
        <ul className="text-sm text-muted space-y-2 leading-relaxed">
          <li>· 所有收據圖、欄位、預算、API key 100% 存喺呢部機 LocalStorage</li>
          <li>· 唯一 outbound：送圖去你 configured Vision API endpoint 解析</li>
          <li>· 清 browser data = 全部清除</li>
        </ul>
      </section>
    </div>
  );
}
