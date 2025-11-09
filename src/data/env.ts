import { z } from "zod";
import { config } from "dotenv";

config({ path: ".env" });

const envSchema = z.object({
  TURSO_DATABASE_URL: z.url(),
  TURSO_AUTH_TOKEN: z.string(),
});

export const env = envSchema.parse(process.env);
