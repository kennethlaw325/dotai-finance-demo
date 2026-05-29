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

  function exportCsv() {
    const header = "date,merchant,category,currency,amount,note\n";
    const rows = items
      .map(
        (r) =>
          `${r.date},"${r.merchant.replace(/"/g, '""')}",${r.category},${r.currency},${r.amount},"${(r.note ?? "").replace(/"/g, '""')}"`
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
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold">公司報銷</h2>
          <p className="text-muted text-sm mt-1">本月待報銷總額（按貨幣分組）</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
            {monthTotals.length === 0 ? (
              <span className="text-muted text-sm">本月無</span>
            ) : (
              monthTotals.map(([cur, total]) => (
                <div key={cur} className="text-xl font-bold text-brand font-mono">
                  {fmtMoney(total, cur)}
                </div>
              ))
            )}
          </div>
        </div>
        <button
          onClick={exportCsv}
          disabled={items.length === 0}
          className="flex items-center gap-2 rounded-lg border border-line bg-panel px-4 py-2 font-medium hover:bg-canvas disabled:opacity-40"
        >
          <Download className="size-4" />
          匯出 CSV
        </button>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-8 text-center text-muted">
          未有標記為報銷的收據。喺「收據」頁面勾選「公司報銷」即可。
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-canvas text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-2">日期</th>
                <th className="text-left px-4 py-2">商戶</th>
                <th className="text-left px-4 py-2">分類</th>
                <th className="text-right px-4 py-2">金額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2">{r.date}</td>
                  <td className="px-4 py-2 font-medium">{r.merchant}</td>
                  <td className="px-4 py-2 text-muted">{r.category}</td>
                  <td className="px-4 py-2 text-right font-mono">
                    {fmtMoney(r.amount, r.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
