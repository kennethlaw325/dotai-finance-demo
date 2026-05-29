import { useCallback, useEffect, useState } from "react";
import {
  Receipt as ReceiptIcon,
  Building2,
  Target,
  Wallet,
  Settings as SettingsIcon
} from "lucide-react";
import type { Budget, Receipt } from "./types";
import { loadBudgets, loadReceipts, saveBudgets, saveReceipts } from "./lib/storage";
import { THEME_KEYS, THEME_LABELS, loadTheme, saveTheme, type ThemeKey } from "./lib/theme";
import { ReceiptsView } from "./views/classic/Receipts";
import { ReimbursementsView } from "./views/classic/Reimbursements";
import { BudgetView } from "./views/classic/Budget";
import { SettingsView } from "./views/classic/Settings";
import { ToastStack, type ToastMsg } from "./components/Toast";
import { uid } from "./lib/utils";

type ViewKey = "receipts" | "reimbursements" | "budget" | "settings";

const NAV: { key: ViewKey; label: string; icon: typeof ReceiptIcon }[] = [
  { key: "receipts", label: "收據", icon: ReceiptIcon },
  { key: "reimbursements", label: "公司報銷", icon: Building2 },
  { key: "budget", label: "預算", icon: Target },
  { key: "settings", label: "設定", icon: SettingsIcon }
];

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

  function pickTheme(next: ThemeKey) {
    setTheme(next);
    saveTheme(next);
  }

  const ThemeSwitcher = (
    <div className="flex items-center border border-accent overflow-hidden">
      {THEME_KEYS.map((k) => {
        const active = theme === k;
        return (
          <button
            key={k}
            onClick={() => pickTheme(k)}
            className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] transition-colors border-r border-accent last:border-r-0 ${
              active
                ? "bg-accent text-canvas font-medium"
                : "bg-panel text-ink hover:bg-canvas"
            }`}
            title={`切去 ${THEME_LABELS[k]} theme`}
          >
            {THEME_LABELS[k]}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-line bg-panel">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 text-ink font-semibold">
            <Wallet className="size-5" />
            Finance Demo
          </div>
          <nav className="ml-auto flex items-center gap-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = view === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => setView(n.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-brand text-white"
                      : "text-muted hover:bg-canvas hover:text-ink"
                  }`}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{n.label}</span>
                </button>
              );
            })}
            <div className="ml-3 hidden md:block">{ThemeSwitcher}</div>
          </nav>
        </div>
        <div className="md:hidden border-t border-line px-4 py-2 flex justify-end">
          {ThemeSwitcher}
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
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

      <footer className="border-t border-line py-3 text-center text-xs text-muted">
        Dot.ai Codex Level 1 · Finance Demo · Vision OCR (BYOK)
      </footer>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
