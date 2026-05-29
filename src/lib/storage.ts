import type { Budget, Receipt } from "../types";

const KEY_RECEIPTS = "dotai-finance:receipts";
const KEY_BUDGETS = "dotai-finance:budgets";

export function loadReceipts(): Receipt[] {
  try {
    const raw = localStorage.getItem(KEY_RECEIPTS);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // migrate pre-currency rows (default HKD); skip malformed rows defensively
    return arr
      .filter((r): r is Receipt => !!r && typeof r === "object" && typeof r.id === "string")
      .map((r) => ({ ...r, currency: r.currency ?? "HKD" }));
  } catch {
    return [];
  }
}

export function saveReceipts(receipts: Receipt[]): void {
  localStorage.setItem(KEY_RECEIPTS, JSON.stringify(receipts));
}

export function loadBudgets(): Budget[] {
  try {
    const raw = localStorage.getItem(KEY_BUDGETS);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as Budget[]) : [];
  } catch {
    return [];
  }
}

export function saveBudgets(budgets: Budget[]): void {
  localStorage.setItem(KEY_BUDGETS, JSON.stringify(budgets));
}
