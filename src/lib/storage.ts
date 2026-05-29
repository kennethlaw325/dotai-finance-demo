import type { Budget, Receipt } from "../types";

const KEY_RECEIPTS = "dotai-finance:receipts";
const KEY_BUDGETS = "dotai-finance:budgets";

export function loadReceipts(): Receipt[] {
  try {
    const raw = localStorage.getItem(KEY_RECEIPTS);
    return raw ? (JSON.parse(raw) as Receipt[]) : [];
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
    return raw ? (JSON.parse(raw) as Budget[]) : [];
  } catch {
    return [];
  }
}

export function saveBudgets(budgets: Budget[]): void {
  localStorage.setItem(KEY_BUDGETS, JSON.stringify(budgets));
}
