import { z } from "zod";

export const createLinkSchema = z.object({
  originalUrl: z.url("Please enter a valid URL"),
  customAlias: z
    .string()
    .min(4, "Custom alias must be at least 4 characters")
    .max(20, "Custom alias must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Custom alias can only contain letters, numbers, hyphens, and underscores"
    )
    .optional()
    .or(z.literal("")),
  expiryDuration: z
    .enum(["1h", "24h", "7d", "30d", "never"])
    .catch("never"),
});

export const linkIdSchema = z.string().uuid("Invalid link ID");

export const aliasSchema = z
  .string()
  .min(4, "Alias must be at least 4 characters")
  .max(20, "Alias must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Alias can only contain letters, numbers, hyphens, and underscores"
  );
