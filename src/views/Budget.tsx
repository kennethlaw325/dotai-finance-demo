import { useMemo } from "react";
import type { Budget, Category, Receipt } from "../types";
import { CATEGORIES } from "../types";
import { fmtMoney, isInCurrentMonth } from "../lib/utils";

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
    <div className="space-y-10">
      <header>
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted">
          Section · 03
        </div>
        <h2 className="font-display text-3xl sm:text-4xl text-ink mt-2 leading-tight">
          Budget
        </h2>
        <p className="text-muted text-sm mt-3 max-w-md leading-relaxed">
          設定每月分類上限（HKD 基準）。80% 警示，100% 觸發 toast。多幣種混合時數字僅供參考。
        </p>
      </header>

      <ul className="divide-y divide-line">
        {CATEGORIES.map((cat) => {
          const b = budgets.find((x) => x.category === cat);
          const limit = b?.monthlyLimit ?? 0;
          const used = spent.get(cat) ?? 0;
          const ratio = limit > 0 ? used / limit : 0;
          const tone =
            ratio >= 1 ? "bg-danger" : ratio >= 0.8 ? "bg-warn" : "bg-accent";
          return (
            <li key={cat} className="py-5">
              <div className="flex items-baseline justify-between mb-3 gap-4">
                <span className="font-display text-lg text-ink">{cat}</span>
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted">
                  <span>Monthly</span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={limit || ""}
                    placeholder="—"
                    onChange={(e) => setLimit(cat, Number(e.target.value))}
                    className="input w-28 text-right font-mono tracking-normal text-sm"
                  />
                </div>
              </div>
              <div className="h-px bg-line overflow-hidden">
                <div
                  className={`h-full ${tone} transition-all`}
                  style={{ width: `${Math.min(ratio, 1) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] uppercase tracking-[0.15em] text-muted mt-2 font-mono">
                <span>{fmtMoney(used, "HKD")} used</span>
                <span>
                  {limit > 0
                    ? `${Math.round(ratio * 100)}% · ${fmtMoney(Math.max(limit - used, 0), "HKD")} left`
                    : "no limit set"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
