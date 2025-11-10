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
  expiresAt: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    }, "Expiration date must be in the future")
    .or(z.literal("")),
  expirationMessage: z
    .string()
    .max(200, "Message must be at most 200 characters")
    .optional()
    .or(z.literal("")),
  activateAt: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    }, "Activation date must be in the future")
    .or(z.literal("")),
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

export const updateLinkSchema = z.object({
  originalUrl: z.url("Please enter a valid URL"),
  expiresAt: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    }, "Expiration date must be in the future")
    .or(z.literal("")),
  expirationMessage: z
    .string()
    .max(200, "Message must be at most 200 characters")
    .optional()
    .or(z.literal("")),
  activateAt: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    }, "Activation date must be in the future")
    .or(z.literal("")),
});
