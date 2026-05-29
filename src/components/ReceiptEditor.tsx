import { Sparkles } from "lucide-react";
import type { Receipt } from "../types";
import { CATEGORIES, CURRENCIES } from "../types";

export function ReceiptEditor({
  value,
  onChange,
  onSave,
  onCancel,
  title,
  saveLabel
}: {
  value: Receipt;
  onChange: (r: Receipt) => void;
  onSave: () => void;
  onCancel: () => void;
  title?: string;
  saveLabel?: string;
}) {
  return (
    <div className="border border-accent/40 bg-panel p-5">
      {title && (
        <div className="flex items-center gap-2 text-accent text-[11px] uppercase tracking-[0.2em] mb-4">
          <Sparkles className="size-3.5" />
          {title}
        </div>
      )}
      <div
        className={`grid gap-4 ${
          value.imageDataUrl ? "grid-cols-1 md:grid-cols-[120px_1fr]" : "grid-cols-1"
        }`}
      >
        {value.imageDataUrl && (
          <img
            src={value.imageDataUrl}
            alt="receipt"
            className="rounded-lg border border-line object-cover w-full h-32 md:h-full"
          />
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="商戶" className="col-span-2">
            <input
              value={value.merchant}
              onChange={(e) => onChange({ ...value, merchant: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="金額">
            <input
              type="number"
              step="0.01"
              value={value.amount}
              onChange={(e) =>
                onChange({ ...value, amount: Number(e.target.value) })
              }
              className="input"
            />
          </Field>
          <Field label="貨幣">
            <select
              value={value.currency}
              onChange={(e) =>
                onChange({ ...value, currency: e.target.value as Receipt["currency"] })
              }
              className="input"
            >
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="日期">
            <input
              type="date"
              value={value.date}
              onChange={(e) => onChange({ ...value, date: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="分類">
            <select
              value={value.category}
              onChange={(e) =>
                onChange({ ...value, category: e.target.value as Receipt["category"] })
              }
              className="input"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="備註" className="col-span-2">
            <input
              value={value.note ?? ""}
              onChange={(e) => onChange({ ...value, note: e.target.value })}
              placeholder="（可選）"
              className="input"
            />
          </Field>
          <label className="col-span-2 flex items-center gap-2 text-sm text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={value.reimbursable}
              onChange={(e) =>
                onChange({ ...value, reimbursable: e.target.checked })
              }
              className="accent-accent"
            />
            <span className="uppercase tracking-[0.15em] text-[11px]">Mark as reimbursable</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-line">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm uppercase tracking-[0.15em] text-muted hover:text-ink transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-5 py-2 text-sm uppercase tracking-[0.15em] border border-accent text-accent hover:bg-accent hover:text-canvas transition-colors"
        >
          {saveLabel ?? "Save"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = ""
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}
