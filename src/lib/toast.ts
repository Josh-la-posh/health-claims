import { toast } from "sonner";

const seen = new Map<string, number>();
const WINDOW_MS = 3000;

export function toastOnce(kind: "success" | "error" | "info", message: string, id?: string) {
  const key = id || message;
  const now = Date.now();
  const last = seen.get(key) || 0;
  if (now - last < WINDOW_MS) return;
  seen.set(key, now);

  if (kind === "success") toast.success(message, { id: key });
  else if (kind === "info") toast(message, { id: key });
  else toast.error(message, { id: key });
}

export { toast };
