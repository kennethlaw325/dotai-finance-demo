import { useEffect, useState } from "react";
import { ExternalLink, KeyRound, Save, Trash2 } from "lucide-react";
import {
  PROVIDER_PRESETS,
  clearMimoConfig,
  loadMimoConfig,
  saveMimoConfig,
  type ProviderPreset
} from "../../lib/config";
import type { ToastMsg } from "../../components/Toast";

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
    <div className="space-y-6 max-w-2xl">
      <header>
        <h2 className="text-2xl font-semibold">設定</h2>
        <p className="text-muted text-sm mt-1">
          配置 Vision API（OpenAI-compatible）。
        </p>
      </header>

      <section className="rounded-xl border border-line bg-panel p-5 space-y-4">
        <div className="flex items-start gap-2 text-sm text-muted bg-canvas rounded-lg p-3">
          <KeyRound className="size-4 mt-0.5 shrink-0 text-brand" />
          <div>
            <div className="font-medium text-ink">Bring Your Own Key（BYOK）</div>
            <p className="mt-1">
              API key 只存喺你個 browser LocalStorage，唔會 send 去任何 server，
              亦唔會跟 deploy 出去。冇 key 就走 mock mode（5 個 sample 收據）。
            </p>
          </div>
        </div>

        <div>
          <div className="text-xs text-muted mb-2">快速 preset（揀一個自動填 base URL + model）</div>
          <div className="flex flex-wrap gap-2">
            {PROVIDER_PRESETS.map((p) => {
              const active = activePreset === p.label;
              return (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
                    active
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-line bg-panel text-ink hover:bg-canvas"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          {activePresetObj && (
            <p className="text-xs text-muted mt-2">
              {activePresetObj.note}
              {" · "}
              <a
                href={activePresetObj.helpUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-brand hover:underline"
              >
                攞 key
                <ExternalLink className="size-3" />
              </a>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-muted">API Key</span>
            <div className="flex gap-2 mt-1">
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
                className="px-3 rounded-md border border-line text-sm text-muted hover:bg-canvas"
              >
                {show ? "隱藏" : "顯示"}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-xs text-muted">Base URL</span>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value);
                setActivePreset(null);
              }}
              placeholder="https://api.openai.com/v1"
              className="input w-full mt-1 font-mono text-sm"
            />
          </label>

          <label className="block">
            <span className="text-xs text-muted">Model</span>
            <input
              type="text"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setActivePreset(null);
              }}
              placeholder="gpt-4o-mini"
              className="input w-full mt-1 font-mono text-sm"
            />
          </label>
        </div>

        <div className="flex justify-between pt-2">
          <button
            onClick={clear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger/5"
          >
            <Trash2 className="size-4" />
            清除設定
          </button>
          <button
            onClick={save}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white font-medium hover:bg-brand/90"
          >
            <Save className="size-4" />
            儲存
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-panel p-5 text-sm space-y-2">
        <h3 className="font-semibold">資料隱私</h3>
        <ul className="list-disc pl-5 text-muted space-y-1">
          <li>所有收據圖片、欄位、預算、API key 100% 存喺你 browser LocalStorage</li>
          <li>唯一 outbound：送圖去你 configured Vision API endpoint 解析</li>
          <li>清 browser data = 全部清除</li>
        </ul>
      </section>
    </div>
  );
}
