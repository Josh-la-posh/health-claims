import { useEffect, useState } from "react";
export function useCooldown(seconds = 30) {
  const [left, setLeft] = useState(0);
  const start = () => setLeft(seconds);
  useEffect(() => {
    if (!left) return;
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [left]);
  return { left, start, active: left > 0 };
}
