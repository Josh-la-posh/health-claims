import { z } from "zod";

const Env = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_MERCHANT_BASE_URL: z.string().url(),
  VITE_SENTRY_DSN: z.string().optional(),
});

export const env = Env.parse(import.meta.env);
