import { useEffect, useRef, useState } from "react";
import { Camera, FolderOpen, Loader2, Pencil, Trash2 } from "lucide-react";
import type { Budget, Receipt } from "../types";
import { extractReceipt, isMockMode } from "../lib/mimo";
import { fileToDataUrl, fmtMoney, isInCurrentMonth, uid } from "../lib/utils";
import type { ToastMsg } from "../components/Toast";
import { ReceiptEditor } from "../components/ReceiptEditor";

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

export function ReceiptsView({
  receipts,
  budgets,
  setReceipts,
  pushToast,
  onGoToSettings
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Receipt | null>(null);
  const [editing, setEditing] = useState<Receipt | null>(null);
  const [batch, setBatch] = useState<BatchProgress | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) return;
    e.target.value = "";

    // Single file → open draft for manual confirm
    if (files.length === 1) {
      setBusy(true);
      try {
        const dataUrl = await fileToDataUrl(files[0]);
        const extracted = await extractReceipt(dataUrl);
        if (!mountedRef.current) return;
        setDraft({
          id: uid(),
          ...extracted,
          reimbursable: false,
          imageDataUrl: dataUrl,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        if (!mountedRef.current) return;
        pushToast({ kind: "danger", text: `解析失敗：${(err as Error).message}` });
      } finally {
        if (mountedRef.current) setBusy(false);
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
      if (!mountedRef.current) return;
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
      if (mountedRef.current) {
        setBatch((cur) => (cur ? { ...cur, done: cur.done + 1, ok, fail } : cur));
      }
    }
    if (!mountedRef.current) return;
    setReceipts([...newReceipts, ...receipts]);
    setBusy(false);
    setBatch(null);
    pushToast({
      kind: fail === 0 ? "success" : "warn",
      text: `Batch 完成：${ok} 張入賬${fail ? `，${fail} 張失敗（可以按列「✏️」逐張人手修正）` : "，可以按列「✏️」逐張調整"}`
    });
  }

  function saveDraft() {
    if (!draft) return;
    const next = [draft, ...receipts];
    setReceipts(next);
    checkBudgetAlert(draft, next);
    setDraft(null);
    pushToast({
      kind: "success",
      text: `已記錄 ${draft.merchant} ${fmtMoney(draft.amount, draft.currency)}`
    });
  }

  function saveEdit() {
    if (!editing) return;
    setReceipts(receipts.map((r) => (r.id === editing.id ? editing : r)));
    setEditing(null);
    pushToast({ kind: "success", text: "已更新" });
  }

  function checkBudgetAlert(added: Receipt, all: Receipt[]) {
    const b = budgets.find((x) => x.category === added.category);
    if (!b || b.monthlyLimit <= 0) return;
    // Budget is HKD baseline; warn but don't crunch numbers when mixed currencies
    const monthRows = all.filter(
      (r) => r.category === added.category && isInCurrentMonth(r.date)
    );
    const hasMixed = monthRows.some((r) => r.currency !== "HKD");
    const spent = monthRows.reduce((s, r) => s + r.amount, 0);
    const ratio = spent / b.monthlyLimit;
    const suffix = hasMixed ? "（多幣種混合，數字僅供參考）" : "";
    if (ratio >= 1) {
      pushToast({
        kind: "danger",
        text: `🚨 ${added.category} 本月已超支 ${fmtMoney(spent - b.monthlyLimit, "HKD")}${suffix}`
      });
    } else if (ratio >= 0.8) {
      pushToast({
        kind: "warn",
        text: `⚠️ ${added.category} 已用 ${Math.round(ratio * 100)}% 本月預算${suffix}`
      });
    }
  }

  function deleteReceipt(id: string) {
    setReceipts(receipts.filter((r) => r.id !== id));
    if (editing?.id === id) setEditing(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
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
                AI 解析中…
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
          // No `capture` attribute — mobile users still get the native
          // "Take Photo / Photo Library / Choose File" picker via accept;
          // forcing camera blocks them from picking existing photos.
          onChange={onPick}
          className="hidden"
        />
        <input
          ref={folderInputRef}
          type="file"
          accept="image/*"
          /* @ts-expect-error non-standard but widely supported */
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
        <ReceiptEditor
          title="AI 解析結果（可手動修正）"
          value={draft}
          onChange={setDraft}
          onSave={saveDraft}
          onCancel={() => setDraft(null)}
          saveLabel="確認入賬"
        />
      )}

      {editing && (
        <ReceiptEditor
          title="編輯收據"
          value={editing}
          onChange={setEditing}
          onSave={saveEdit}
          onCancel={() => setEditing(null)}
          saveLabel="儲存修改"
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
                  <div className="flex items-center gap-2 flex-wrap">
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
                  <div className="text-xs text-muted mt-0.5">
                    {r.date}
                    {r.note && <span className="ml-2">· {r.note}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold">
                    {fmtMoney(r.amount, r.currency)}
                  </div>
                  <div className="text-[10px] text-muted uppercase">{r.currency}</div>
                </div>
                <button
                  onClick={() => setEditing(r)}
                  className="text-muted hover:text-brand p-1"
                  title="編輯"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => deleteReceipt(r.id)}
                  className="text-muted hover:text-danger p-1"
                  title="刪除"
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
