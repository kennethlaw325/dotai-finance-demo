import { useEffect, useState } from "react";
import { Receipt as ReceiptIcon, Building2, Target, Wallet, Settings as SettingsIcon } from "lucide-react";
import type { Budget, Receipt } from "./types";
import { loadBudgets, loadReceipts, saveBudgets, saveReceipts } from "./lib/storage";
import { ReceiptsView } from "./views/Receipts";
import { ReimbursementsView } from "./views/Reimbursements";
import { BudgetView } from "./views/Budget";
import { SettingsView } from "./views/Settings";
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
  const [configVersion, setConfigVersion] = useState(0); // force ReceiptsView to re-read isMockMode()

  useEffect(() => {
    setReceiptsState(loadReceipts());
    setBudgetsState(loadBudgets());
  }, []);

  function setReceipts(next: Receipt[]) {
    setReceiptsState(next);
    saveReceipts(next);
  }
  function setBudgets(next: Budget[]) {
    setBudgetsState(next);
    saveBudgets(next);
  }
  function pushToast(t: Omit<ToastMsg, "id">) {
    setToasts((cur) => [...cur, { ...t, id: uid() }]);
  }
  function dismissToast(id: string) {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-line bg-panel">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 text-navy font-semibold">
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
          </nav>
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
        Dot.ai Codex Level 1 · Finance Demo · MiMo V2.5 Vision
      </footer>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
