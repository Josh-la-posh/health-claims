// src/utils/currency.ts

/** Format a number into a currency string */
export function formatCurrency(
  amount: number | string,
  currency: string = "NGN",
  locale: string = "en-NG"
): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Parse a currency string back to number */
export function parseCurrency(value: string): number {
  return Number(value.replace(/[^0-9.-]+/g, ""));
}

/** Format large numbers (K, M, B) for dashboards */
export function formatCompact(amount: number | string, locale: string = "en-NG"): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, { notation: "compact" }).format(value);
}
