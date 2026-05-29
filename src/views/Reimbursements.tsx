import { useMemo } from "react";
import { Download } from "lucide-react";
import type { Receipt } from "../types";
import { fmtHKD, isInCurrentMonth } from "../lib/utils";

export function ReimbursementsView({ receipts }: { receipts: Receipt[] }) {
  const items = useMemo(
    () => receipts.filter((r) => r.reimbursable),
    [receipts]
  );
  const monthTotal = useMemo(
    () =>
      items
        .filter((r) => isInCurrentMonth(r.date))
        .reduce((s, r) => s + r.amount, 0),
    [items]
  );

  function exportCsv() {
    const header = "date,merchant,category,amount,note\n";
    const rows = items
      .map(
        (r) =>
          `${r.date},"${r.merchant.replace(/"/g, '""')}",${r.category},${r.amount},"${(r.note ?? "").replace(/"/g, '""')}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reimbursement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold">公司報銷</h2>
          <p className="text-muted text-sm mt-1">本月待報銷總額</p>
          <div className="text-3xl font-bold text-brand mt-2 font-mono">
            {fmtHKD(monthTotal)}
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
                    {fmtHKD(r.amount)}
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
