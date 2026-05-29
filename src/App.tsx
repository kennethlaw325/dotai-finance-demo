import { useCallback, useEffect, useState } from "react";
import type { Budget, Receipt } from "./types";
import { loadBudgets, loadReceipts, saveBudgets, saveReceipts } from "./lib/storage";
import { loadTheme, saveTheme, type ThemeKey } from "./lib/theme";
import { ReceiptsView } from "./views/Receipts";
import { ReimbursementsView } from "./views/Reimbursements";
import { BudgetView } from "./views/Budget";
import { SettingsView } from "./views/Settings";
import { ToastStack, type ToastMsg } from "./components/Toast";
import { uid } from "./lib/utils";

type ViewKey = "receipts" | "reimbursements" | "budget" | "settings";

const NAV: { key: ViewKey; label: string }[] = [
  { key: "receipts", label: "Receipts" },
  { key: "reimbursements", label: "Reimbursable" },
  { key: "budget", label: "Budget" },
  { key: "settings", label: "Settings" }
];

const NAV_ZH: Record<ViewKey, string> = {
  receipts: "收據",
  reimbursements: "公司報銷",
  budget: "預算",
  settings: "設定"
};

export default function App() {
  const [view, setView] = useState<ViewKey>("receipts");
  const [receipts, setReceiptsState] = useState<Receipt[]>([]);
  const [budgets, setBudgetsState] = useState<Budget[]>([]);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [configVersion, setConfigVersion] = useState(0);
  const [theme, setTheme] = useState<ThemeKey>("luxury");

  useEffect(() => {
    setReceiptsState(loadReceipts());
    setBudgetsState(loadBudgets());
    setTheme(loadTheme());
  }, []);

  function setReceipts(next: Receipt[]) {
    setReceiptsState(next);
    saveReceipts(next);
  }
  function setBudgets(next: Budget[]) {
    setBudgetsState(next);
    saveBudgets(next);
  }
  const pushToast = useCallback((t: Omit<ToastMsg, "id">) => {
    setToasts((cur) => [...cur, { ...t, id: uid() }]);
  }, []);
  const dismissToast = useCallback((id: string) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  function toggleTheme() {
    const next: ThemeKey = theme === "luxury" ? "pixel" : "luxury";
    setTheme(next);
    saveTheme(next);
  }

  const isPixel = theme === "pixel";
  const displayClass = isPixel
    ? "font-display text-[10px] tracking-widest"
    : "font-display text-xl tracking-tight";

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-line relative">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-6 pb-4 text-center">
          <button
            onClick={toggleTheme}
            title={isPixel ? "切去 Luxury theme" : "切去 Pixel theme"}
            className="absolute right-5 sm:right-8 top-6 text-[11px] uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors"
          >
            {isPixel ? "[ luxury ]" : "[ pixel ]"}
          </button>
          <div className={`${displayClass} text-ink`}>
            {isPixel ? "FINANCE.EXE" : "Finance Ledger"}
          </div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted mt-1">
            {isPixel ? "v0.1 · DOT.AI" : "Dot.ai · Codex Level 1"}
          </div>
          <nav className="mt-6 -mb-px flex items-end justify-center gap-6 overflow-x-auto">
            {NAV.map((n) => {
              const active = view === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => setView(n.key)}
                  className={`pb-3 text-sm tracking-wide whitespace-nowrap transition-colors ${
                    active
                      ? "text-ink border-b border-accent"
                      : "text-muted hover:text-ink border-b border-transparent"
                  }`}
                >
                  <span className="hidden sm:inline">{n.label}</span>
                  <span className="sm:hidden">{NAV_ZH[n.key]}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-5 sm:px-8 py-10">
        {view === "receipts" && (
          <ReceiptsView
            key={configVersion}
            receipts={receipts}
            budgets={budgets}
            setReceipts={setReceipts}
            pushToast={pushToast}
            onGoToSettings={() => setView("settings")}
          />
        )}
        {view === "reimbursements" && <ReimbursementsView receipts={receipts} />}
        {view === "budget" && (
          <BudgetView
            receipts={receipts}
            budgets={budgets}
            setBudgets={setBudgets}
          />
        )}
        {view === "settings" && (
          <SettingsView
            pushToast={pushToast}
            onChange={() => setConfigVersion((v) => v + 1)}
          />
        )}
      </main>

      <footer className="border-t border-line py-5">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-[11px] uppercase tracking-[0.2em] text-muted text-center">
          Vision OCR · Bring your own key · Data lives in your browser
        </div>
      </footer>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
