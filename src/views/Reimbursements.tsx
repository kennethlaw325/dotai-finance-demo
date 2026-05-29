import { useMemo } from "react";
import { Download } from "lucide-react";
import type { Currency, Receipt } from "../types";
import { fmtMoney, isInCurrentMonth } from "../lib/utils";

export function ReimbursementsView({ receipts }: { receipts: Receipt[] }) {
  const items = useMemo(
    () => receipts.filter((r) => r.reimbursable),
    [receipts]
  );

  const monthTotals = useMemo(() => {
    const map = new Map<Currency, number>();
    for (const r of items) {
      if (!isInCurrentMonth(r.date)) continue;
      map.set(r.currency, (map.get(r.currency) ?? 0) + r.amount);
    }
    return [...map.entries()];
  }, [items]);

  // CSV formula injection guard: cells starting with = + - @ can be
  // interpreted as formulas by Excel/LibreOffice. Prefix with single-quote.
  function csvCell(s: string): string {
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
  }

  function exportCsv() {
    const header = "date,merchant,category,currency,amount,note\n";
    const rows = items
      .map(
        (r) =>
          `${r.date},${csvCell(r.merchant)},${r.category},${r.currency},${r.amount},${csvCell(r.note ?? "")}`
      )
      .join("\n");
    // Prepend UTF-8 BOM so Excel on Windows / macOS auto-detects encoding
    // and renders CJK correctly (without BOM Excel falls back to system code
    // page like Big5/GBK and shows garbage).
    const blob = new Blob(["﻿", header + rows], {
      type: "text/csv;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reimbursement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-10">
      <header className="text-center">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted">
          Section · 02
        </div>
        <h2 className="font-display text-3xl sm:text-4xl text-ink mt-2 leading-tight">
          Reimbursable
        </h2>
        <p className="text-muted text-sm mt-3 max-w-md mx-auto leading-relaxed">
          本月待報銷總額，按貨幣分組以避免換匯誤導。CSV 可直接交財務。
        </p>
        <div className="flex justify-center mt-6">
          <button
            onClick={exportCsv}
            disabled={items.length === 0}
            className="flex items-center gap-2 border border-line text-muted px-4 py-2.5 text-sm uppercase tracking-[0.15em] hover:text-ink hover:border-ink disabled:opacity-40 transition-colors"
          >
            <Download className="size-4" />
            Export CSV
          </button>
        </div>
      </header>

      <section>
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted mb-4">
          This month
        </div>
        {monthTotals.length === 0 ? (
          <div className="font-display text-2xl text-muted">— Nil —</div>
        ) : (
          <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {monthTotals.map(([cur, total]) => (
              <div key={cur} className="border-t border-line pt-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  {cur}
                </div>
                <div className="font-display text-3xl text-ink mt-1 tabular-nums">
                  {fmtMoney(total, cur)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between border-b border-line pb-2 mb-1">
          <h3 className="text-[11px] uppercase tracking-[0.25em] text-muted">
            All entries
          </h3>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted font-mono">
            {String(items.length).padStart(3, "0")}
          </span>
        </div>
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="font-display text-2xl text-muted">No reimbursable entries</div>
            <p className="text-sm text-muted mt-3 max-w-sm mx-auto leading-relaxed">
              喺「收據」頁勾選「Mark as reimbursable」即可入呢度。
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((r) => (
              <li key={r.id} className="grid grid-cols-[1fr_auto] gap-4 py-4 items-baseline">
                <div className="min-w-0">
                  <div className="font-display text-lg text-ink truncate">
                    {r.merchant}
                  </div>
                  <div className="text-xs text-muted mt-1 font-mono">
                    {r.date}
                    <span className="ml-3 uppercase tracking-[0.15em]">{r.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-base text-ink tabular-nums">
                    {fmtMoney(r.amount, r.currency)}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
                    {r.currency}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
