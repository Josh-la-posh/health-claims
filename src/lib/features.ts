type Flags = Record<string, boolean>;

const defaults: Flags = {
  disputesV2: false,
  pwa: false,
};

function loadOverrides(): Flags {
  try { return JSON.parse(localStorage.getItem("feature:overrides") || "{}"); }
  catch { return {}; }
}

let overrides = loadOverrides();

export function isEnabled(flag: keyof typeof defaults): boolean {
  if (flag in overrides) {
    return overrides[flag];
  }
  const envValue = import.meta.env["VITE_FFLAG_" + String(flag).toUpperCase()];
  if (envValue !== undefined) {
    return envValue === "true";
  }
  return defaults[flag];
}

export function setOverride(flag: keyof typeof defaults, value: boolean) {
  overrides = { ...overrides, [flag]: value };
  localStorage.setItem("feature:overrides", JSON.stringify(overrides));
}
