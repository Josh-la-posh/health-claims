import { create } from "zustand";
import { popIntendedRoute } from "../lib/redirect";

type User = { id: string; email: string; name?: string; emailVerified?: boolean };

type State = {
  user: User | null;
  accessToken: string | null; // keep in memory only
  isAuthenticated: boolean;
};
type Actions = {
  setSession: (payload: { user: User; accessToken: string }) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
  consumeIntendedRoute: () => string | null;
};

export const useAuthStore = create<State & Actions>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setSession: ({ user, accessToken }) =>
    set({ user, accessToken, isAuthenticated: true }),

  setAccessToken: (accessToken) =>
    set({ accessToken, isAuthenticated: !!accessToken && !!get().user }),

  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),

  consumeIntendedRoute: () => popIntendedRoute(),
}));
