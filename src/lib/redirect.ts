import { storage } from "./storage";
const KEY = "intended_route";

export function saveIntendedRoute(path: string) {
  // expect a path like pathname + search
  storage.set(KEY, path);
}
export function popIntendedRoute(): string | null {
  const p = storage.get<string>(KEY);
  storage.del(KEY);
  return p || null;
}
