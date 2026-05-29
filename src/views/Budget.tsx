import { useMemo } from "react";
import type { Budget, Category, Receipt } from "../types";
import { CATEGORIES } from "../types";
import { fmtHKD, isInCurrentMonth } from "../lib/utils";

interface Props {
  receipts: Receipt[];
  budgets: Budget[];
  setBudgets: (b: Budget[]) => void;
}

export function BudgetView({ receipts, budgets, setBudgets }: Props) {
  const spent = useMemo(() => {
    const map = new Map<Category, number>();
    for (const r of receipts) {
      if (!isInCurrentMonth(r.date)) continue;
      map.set(r.category, (map.get(r.category) ?? 0) + r.amount);
    }
    return map;
  }, [receipts]);

  function setLimit(cat: Category, limit: number) {
    const others = budgets.filter((b) => b.category !== cat);
    if (limit > 0) {
      setBudgets([...others, { category: cat, monthlyLimit: limit }]);
    } else {
      setBudgets(others);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">預算</h2>
        <p className="text-muted text-sm mt-1">
          設定每月分類預算。超 80% 黃燈，超 100% 紅燈 + Toast 提示。
        </p>
      </header>

      <div className="space-y-3">
        {CATEGORIES.map((cat) => {
          const b = budgets.find((x) => x.category === cat);
          const limit = b?.monthlyLimit ?? 0;
          const used = spent.get(cat) ?? 0;
          const ratio = limit > 0 ? used / limit : 0;
          const color =
            ratio >= 1
              ? "bg-danger"
              : ratio >= 0.8
              ? "bg-warn"
              : "bg-success";
          return (
            <div
              key={cat}
              className="rounded-xl border border-line bg-panel p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{cat}</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted">月度上限</span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={limit || ""}
                    placeholder="未設"
                    onChange={(e) => setLimit(cat, Number(e.target.value))}
                    className="input w-28 text-right"
                  />
                </div>
              </div>
              <div className="h-2 rounded-full bg-canvas overflow-hidden">
                <div
                  className={`h-full ${color} transition-all`}
                  style={{ width: `${Math.min(ratio, 1) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted mt-1.5 font-mono">
                <span>{fmtHKD(used)} 已用</span>
                <span>
                  {limit > 0
                    ? `${Math.round(ratio * 100)}% · 剩 ${fmtHKD(Math.max(limit - used, 0))}`
                    : "未設預算"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
