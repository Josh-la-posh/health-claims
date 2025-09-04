import { zxcvbn } from "@zxcvbn-ts/core";

export default function PasswordStrength({ value }: { value: string }) {
  const { score, feedback } = zxcvbn(value);
  const pct = ((score + 1) / 5) * 100; // 0..5 → %
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-600"];
  return (
    <div className="mt-2">
      <div className="h-2 w-full rounded bg-border">
        <div className={`h-2 rounded ${colors[score]}`} style={{ width: `${pct}%` }} />
      </div>
      {feedback.warning && <p className="mt-1 text-xs text-muted">{feedback.warning}</p>}
    </div>
  );
}
