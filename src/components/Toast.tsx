import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

export interface ToastMsg {
  id: string;
  kind: "success" | "warn" | "danger";
  text: string;
}

export function ToastStack({
  toasts,
  onDismiss
}: {
  toasts: ToastMsg[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastMsg; onDismiss: () => void }) {
  // Depend on toast.id (stable) instead of onDismiss (recreated each parent
  // render), otherwise the auto-dismiss timer keeps resetting and toasts
  // never disappear when sibling state churns.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timer);
  }, [toast.id]);

  const tone =
    toast.kind === "success"
      ? "border-l-success text-success"
      : toast.kind === "warn"
      ? "border-l-warn text-warn"
      : "border-l-danger text-danger";

  const Icon = toast.kind === "success" ? CheckCircle2 : AlertTriangle;

  return (
    <div
      className={`flex items-start gap-2 bg-panel border border-line border-l-2 ${tone} px-3 py-2`}
    >
      <Icon className="size-4 shrink-0 mt-0.5" />
      <span className="text-sm flex-1 text-ink">{toast.text}</span>
      <button onClick={onDismiss} className="opacity-60 hover:opacity-100 text-muted">
        <X className="size-3.5" />
      </button>
    </div>
  );
}
