import { storage } from "./storage";
const KEY = "intended_route";

export function saveIntendedRoute(path: string) {
  storage.set(KEY, path);
}
export function popIntendedRoute(): string | null {
  const p = storage.get<string>(KEY);
  storage.del(KEY);
  return p || null;
}
