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
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const tone =
    toast.kind === "success"
      ? "bg-success/10 border-success/40 text-success"
      : toast.kind === "warn"
      ? "bg-warn/10 border-warn/40 text-warn"
      : "bg-danger/10 border-danger/40 text-danger";

  const Icon = toast.kind === "success" ? CheckCircle2 : AlertTriangle;

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 shadow-sm backdrop-blur ${tone}`}
    >
      <Icon className="size-4 shrink-0 mt-0.5" />
      <span className="text-sm flex-1">{toast.text}</span>
      <button onClick={onDismiss} className="opacity-60 hover:opacity-100">
        <X className="size-3.5" />
      </button>
    </div>
  );
}
