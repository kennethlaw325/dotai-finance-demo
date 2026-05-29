export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function fmtMoney(n: number, currency = "HKD"): string {
  try {
    return new Intl.NumberFormat("zh-HK", {
      style: "currency",
      currency,
      minimumFractionDigits: 2
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

// Backwards-compatible alias
export const fmtHKD = (n: number): string => fmtMoney(n, "HKD");

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function currentMonthKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function isInCurrentMonth(isoDate: string): boolean {
  return isoDate.startsWith(currentMonthKey());
}
