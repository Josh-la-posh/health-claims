import { useState } from "react";
import { useThemeStore } from "../../store/theme";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function BrandPicker() {
  const { primaryHsl, setPrimaryHsl } = useThemeStore();
  const [value, setValue] = useState(primaryHsl);

  const apply = () => {
    const v = value.trim();
    if (v.startsWith("#")) setPrimaryHsl(hexToHslTriplet(v));
    else setPrimaryHsl(v); // assumes "H S L"
  };

  return (
    <div className="flex items-end gap-2">
      <div className="w-40">
        <label className="mb-1 block text-sm font-medium">Primary (H S L or #hex)</label>
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder='e.g. "222 89% 56%" or "#2563eb"' />
      </div>
      <Button onClick={apply}>Apply</Button>
      <span className="inline-block h-8 w-8 rounded-full border border-border" style={{ background: `hsl(${primaryHsl})` }} />
    </div>
  );
}

function hexToHslTriplet(hex: string): string {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = h * 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
