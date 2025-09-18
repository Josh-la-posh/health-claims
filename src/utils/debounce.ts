
export function debounce<F extends (...args: unknown[]) => void>(func: F, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null;

  return function(this: unknown, ...args: Parameters<F>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/** Throttle (optional) */
export function throttle<F extends (...args: unknown[]) => void>(func: F, limit: number) {
  let inThrottle: boolean;
  return function(this: unknown, ...args: Parameters<F>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
