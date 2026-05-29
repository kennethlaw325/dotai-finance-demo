import { useRef, useState } from "react";
import { Camera, FolderOpen, Loader2, Sparkles, Trash2 } from "lucide-react";
import type { Budget, Receipt } from "../types";
import { CATEGORIES } from "../types";
import { extractReceipt, isMockMode } from "../lib/mimo";
import { fileToDataUrl, fmtHKD, isInCurrentMonth, uid } from "../lib/utils";
import type { ToastMsg } from "../components/Toast";

interface Props {
  receipts: Receipt[];
  budgets: Budget[];
  setReceipts: (r: Receipt[]) => void;
  pushToast: (t: Omit<ToastMsg, "id">) => void;
  onGoToSettings: () => void;
}

interface BatchProgress {
  total: number;
  done: number;
  ok: number;
  fail: number;
}

export function ReceiptsView({ receipts, budgets, setReceipts, pushToast, onGoToSettings }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Receipt | null>(null);
  const [batch, setBatch] = useState<BatchProgress | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) return;
    e.target.value = "";

    // Single file → open draft (manual confirm)
    if (files.length === 1) {
      setBusy(true);
      try {
        const dataUrl = await fileToDataUrl(files[0]);
        const extracted = await extractReceipt(dataUrl);
        setDraft({
          id: uid(),
          ...extracted,
          reimbursable: false,
          imageDataUrl: dataUrl,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        pushToast({ kind: "danger", text: `解析失敗：${(err as Error).message}` });
      } finally {
        setBusy(false);
      }
      return;
    }

    // Batch mode → auto-save each, show progress
    setBusy(true);
    setBatch({ total: files.length, done: 0, ok: 0, fail: 0 });
    const newReceipts: Receipt[] = [];
    let ok = 0;
    let fail = 0;
    for (const file of files) {
      try {
        const dataUrl = await fileToDataUrl(file);
        const extracted = await extractReceipt(dataUrl);
        newReceipts.push({
          id: uid(),
          ...extracted,
          reimbursable: false,
          imageDataUrl: dataUrl,
          createdAt: new Date().toISOString()
        });
        ok += 1;
      } catch {
        fail += 1;
      }
      setBatch((cur) =>
        cur ? { ...cur, done: cur.done + 1, ok, fail } : cur
      );
    }
    setReceipts([...newReceipts, ...receipts]);
    setBusy(false);
    setBatch(null);
    pushToast({
      kind: fail === 0 ? "success" : "warn",
      text: `Batch 完成：${ok} 張入賬${fail ? `，${fail} 張失敗` : ""}`
    });
  }

  function saveDraft() {
    if (!draft) return;
    const next = [draft, ...receipts];
    setReceipts(next);
    checkBudgetAlert(draft, next);
    setDraft(null);
    pushToast({ kind: "success", text: `已記錄 ${draft.merchant} ${fmtHKD(draft.amount)}` });
  }

  function checkBudgetAlert(added: Receipt, all: Receipt[]) {
    const b = budgets.find((x) => x.category === added.category);
    if (!b || b.monthlyLimit <= 0) return;
    const spent = all
      .filter((r) => r.category === added.category && isInCurrentMonth(r.date))
      .reduce((s, r) => s + r.amount, 0);
    const ratio = spent / b.monthlyLimit;
    if (ratio >= 1) {
      pushToast({
        kind: "danger",
        text: `🚨 ${added.category} 本月已超支 ${fmtHKD(spent - b.monthlyLimit)}`
      });
    } else if (ratio >= 0.8) {
      pushToast({
        kind: "warn",
        text: `⚠️ ${added.category} 已用 ${Math.round(ratio * 100)}% 本月預算`
      });
    }
  }

  function deleteReceipt(id: string) {
    setReceipts(receipts.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">收據</h2>
          <p className="text-muted text-sm mt-1">
            拍張單據，AI 自動入賬
            {isMockMode() && (
              <button
                onClick={onGoToSettings}
                className="ml-2 px-2 py-0.5 rounded bg-warn/10 text-warn text-xs hover:bg-warn/20"
              >
                Demo mock 模式 · 點此入 API key
              </button>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="flex items-center gap-2 rounded-lg bg-brand text-white px-4 py-2 font-medium disabled:opacity-50 hover:bg-brand/90"
          >
            {busy && !batch ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                MiMo 解析中…
              </>
            ) : (
              <>
                <Camera className="size-4" />
                上傳單據
              </>
            )}
          </button>
          <button
            onClick={() => folderInputRef.current?.click()}
            disabled={busy}
            title="揀整個 folder 入面所有圖（適合一次過 import 一個月）"
            className="flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2 text-sm font-medium disabled:opacity-50 hover:bg-canvas"
          >
            <FolderOpen className="size-4" />
            選資料夾
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={onPick}
          className="hidden"
        />
        <input
          ref={folderInputRef}
          type="file"
          accept="image/*"
          /* @ts-expect-error non-standard but widely supported in Chromium/Edge/Safari */
          webkitdirectory=""
          directory=""
          multiple
          onChange={onPick}
          className="hidden"
        />
      </header>

      {batch && (
        <div className="rounded-xl border border-brand/30 bg-brand/5 p-4">
          <div className="flex items-center gap-2 text-brand text-sm font-medium mb-2">
            <Loader2 className="size-4 animate-spin" />
            Batch 解析中：{batch.done} / {batch.total}
            {batch.fail > 0 && (
              <span className="text-danger ml-2">（{batch.fail} 失敗）</span>
            )}
          </div>
          <div className="h-2 rounded-full bg-canvas overflow-hidden">
            <div
              className="h-full bg-brand transition-all"
              style={{ width: `${(batch.done / batch.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {draft && (
        <DraftCard
          draft={draft}
          onChange={setDraft}
          onSave={saveDraft}
          onCancel={() => setDraft(null)}
        />
      )}

      <section>
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
          歷史 ({receipts.length})
        </h3>
        {receipts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-8 text-center text-muted">
            未有收據，按右上「上傳單據」開始。
          </div>
        ) : (
          <div className="divide-y divide-line rounded-xl border border-line bg-panel">
            {receipts.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{r.merchant}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-canvas text-muted">
                      {r.category}
                    </span>
                    {r.reimbursable && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-brand/10 text-brand">
                        報銷
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted mt-0.5">{r.date}</div>
                </div>
                <div className="text-right font-mono font-semibold">
                  {fmtHKD(r.amount)}
                </div>
                <button
                  onClick={() => deleteReceipt(r.id)}
                  className="text-muted hover:text-danger p-1"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DraftCard({
  draft,
  onChange,
  onSave,
  onCancel
}: {
  draft: Receipt;
  onChange: (r: Receipt) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-xl border border-brand/30 bg-brand/5 p-4">
      <div className="flex items-center gap-2 text-brand text-sm font-medium mb-3">
        <Sparkles className="size-4" />
        MiMo 解析結果（可手動修正）
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4">
        {draft.imageDataUrl && (
          <img
            src={draft.imageDataUrl}
            alt="receipt"
            className="rounded-lg border border-line object-cover w-full h-32 md:h-full"
          />
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="商戶">
            <input
              value={draft.merchant}
              onChange={(e) => onChange({ ...draft, merchant: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="金額">
            <input
              type="number"
              step="0.01"
              value={draft.amount}
              onChange={(e) =>
                onChange({ ...draft, amount: Number(e.target.value) })
              }
              className="input"
            />
          </Field>
          <Field label="日期">
            <input
              type="date"
              value={draft.date}
              onChange={(e) => onChange({ ...draft, date: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="分類">
            <select
              value={draft.category}
              onChange={(e) =>
                onChange({ ...draft, category: e.target.value as Receipt["category"] })
              }
              className="input"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.reimbursable}
              onChange={(e) =>
                onChange({ ...draft, reimbursable: e.target.checked })
              }
            />
            標記為公司報銷
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-muted hover:bg-canvas"
        >
          取消
        </button>
        <button
          onClick={onSave}
          className="px-4 py-1.5 rounded-lg bg-brand text-white font-medium hover:bg-brand/90"
        >
          確認入賬
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}
