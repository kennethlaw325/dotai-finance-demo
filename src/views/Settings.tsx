import { useEffect, useState } from "react";
import { ExternalLink, KeyRound, Save, Trash2 } from "lucide-react";
import { clearMimoConfig, loadMimoConfig, saveMimoConfig } from "../lib/config";
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

  useEffect(() => {
    const cfg = loadMimoConfig();
    setApiKey(cfg.apiKey);
    setBaseUrl(cfg.baseUrl);
    setModel(cfg.model);
  }, []);

  function save() {
    saveMimoConfig({ apiKey: apiKey.trim(), baseUrl: baseUrl.trim(), model: model.trim() });
    onChange();
    pushToast({
      kind: "success",
      text: apiKey ? "已儲存 MiMo API key（只存喺你個 browser）" : "已清除 API key，會切回 mock mode"
    });
  }

  function clear() {
    clearMimoConfig();
    setApiKey("");
    setBaseUrl("https://token-plan-sgp.xiaomimimo.com/v1");
    setModel("mimo-v2-omni");
    onChange();
    pushToast({ kind: "warn", text: "已清除所有設定" });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h2 className="text-2xl font-semibold">設定</h2>
        <p className="text-muted text-sm mt-1">
          配置 Xiaomi MiMo Vision API key。
        </p>
      </header>

      <section className="rounded-xl border border-line bg-panel p-5 space-y-4">
        <div className="flex items-start gap-2 text-sm text-muted bg-canvas rounded-lg p-3">
          <KeyRound className="size-4 mt-0.5 shrink-0 text-brand" />
          <div>
            <div className="font-medium text-ink">Bring Your Own Key（BYOK）</div>
            <p className="mt-1">
              API key 只存喺你個 browser LocalStorage，唔會 send 去任何 server，
              亦唔會跟 deploy 出去。Demo 唔填 key 就走 mock mode（5 個 sample）。
            </p>
            <a
              href="https://platform.xiaomimimo.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-brand mt-2 hover:underline"
            >
              去 platform.xiaomimimo.com 攞 key
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-muted">API Key</span>
            <div className="flex gap-2 mt-1">
              <input
                type={show ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="tp-xxxxxxxxxxxxxxxxxx"
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
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://token-plan-sgp.xiaomimimo.com/v1"
              className="input w-full mt-1 font-mono text-sm"
            />
          </label>

          <label className="block">
            <span className="text-xs text-muted">Model</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input w-full mt-1"
            >
              <option value="mimo-v2-omni">mimo-v2-omni（多模態，支援圖片）</option>
              <option value="mimo-v2.5-pro">mimo-v2.5-pro（純文字，唔支援圖）</option>
              <option value="mimo-v2.5">mimo-v2.5（純文字）</option>
            </select>
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
          <li>所有收據圖片同欄位 100% 存喺你 browser LocalStorage</li>
          <li>除咗送圖去 MiMo Vision 解析之外，冇任何 backend</li>
          <li>清 browser data = 全部資料清掉</li>
        </ul>
      </section>
    </div>
  );
}
