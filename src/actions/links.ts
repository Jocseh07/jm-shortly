"use server";

import { db } from "@/db";
import { links } from "@/db/schema";
import { eq, desc, or, like, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getThrowUser } from "./getThrowUser";
import { createLinkSchema, linkIdSchema, aliasSchema, updateLinkSchema } from "@/lib/validations";
import { getBaseUrl } from "@/lib/url";

function generateShortCode(): string {
  return crypto.randomUUID().slice(0, 6).replace(/-/g, "");
}

function calculateExpiresAt(duration: string): Date | null {
  if (duration === "never") return null;
  const now = new Date();
  switch (duration) {
    case "1h":
      return new Date(now.getTime() + 60 * 60 * 1000);
    case "24h":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

export async function createLink(
  prevState: unknown,
  formData: FormData
): Promise<
  | { success: true; shortCode: string; shortUrl: string }
  | { success: false; error: string }
> {
  try {
    const userId = await getThrowUser();

    const originalUrl = formData.get("originalUrl") as string;
    const customAlias = formData.get("customAlias") as string;
    const expiryDuration = formData.get("expiryDuration") as string;

    const validationResult = createLinkSchema.safeParse({
      originalUrl,
      customAlias: customAlias || undefined,
      expiryDuration: expiryDuration || "never",
    });

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.message,
      };
    }

    const {
      originalUrl: validatedUrl,
      customAlias: validatedAlias,
      expiryDuration: validatedExpiryDuration,
    } = validationResult.data;

    const shortCode = validatedAlias || generateShortCode();
    const expiresAt = calculateExpiresAt(validatedExpiryDuration || "never");

    const existingLink = await db.query.links.findFirst({
      where: eq(links.shortCode, shortCode),
    });

    if (existingLink) {
      return {
        success: false,
        error: "This short code is already taken. Please choose another one.",
      };
    }

    const linkId = crypto.randomUUID();
    const now = new Date();

    await db.insert(links).values({
      id: linkId,
      shortCode,
      originalUrl: validatedUrl,
      userId,
      clicks: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      expiresAt,
    });

    revalidatePath("/dashboard");

    const baseUrl = await getBaseUrl();
    const shortUrl = `${baseUrl}/${shortCode}`;

    return {
      success: true,
      shortCode,
      shortUrl,
    };
  } catch (error) {
    console.error("Error creating link:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        success: false,
        error: "You must be signed in to create links",
      };
    }
    return {
      success: false,
      error: "Failed to create link. Please try again.",
    };
  }
}

export async function getUserLinks(searchQuery?: string) {
  try {
    const userId = await getThrowUser();

    // Build where clause
    const baseCondition = eq(links.userId, userId);
    
    let whereCondition;
    if (searchQuery && searchQuery.trim().length > 0) {
      const searchTerm = `%${searchQuery.trim()}%`;
      whereCondition = and(
        baseCondition,
        or(
          like(links.shortCode, searchTerm),
          like(links.originalUrl, searchTerm)
        )
      );
    } else {
      whereCondition = baseCondition;
    }

    const userLinks = await db.query.links.findMany({
      where: whereCondition,
      orderBy: desc(links.createdAt),
    });

    return userLinks;
  } catch (error) {
    console.error("Error fetching user links:", error);
    throw error;
  }
}

export async function deleteLink(
  linkId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getThrowUser();

    const validationResult = linkIdSchema.safeParse(linkId);
    if (!validationResult.success) {
      return { success: false, error: "Invalid link ID" };
    }

    const link = await db.query.links.findFirst({
      where: eq(links.id, linkId),
    });

    if (!link) {
      return { success: false, error: "Link not found" };
    }

    if (link.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await db.delete(links).where(eq(links.id, linkId));

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting link:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "You must be signed in" };
    }
    return { success: false, error: "Failed to delete link" };
  }
}

export async function toggleLinkStatus(
  linkId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getThrowUser();

    const validationResult = linkIdSchema.safeParse(linkId);
    if (!validationResult.success) {
      return { success: false, error: "Invalid link ID" };
    }

    const link = await db.query.links.findFirst({
      where: eq(links.id, linkId),
    });

    if (!link) {
      return { success: false, error: "Link not found" };
    }

    if (link.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(links)
      .set({
        isActive: !link.isActive,
        updatedAt: new Date(),
      })
      .where(eq(links.id, linkId));

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error toggling link status:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "You must be signed in" };
    }
    return { success: false, error: "Failed to update link status" };
  }
}

export async function checkAliasAvailability(
  alias: string
): Promise<{ available: boolean; error?: string }> {
  try {
    const validationResult = aliasSchema.safeParse(alias);
    if (!validationResult.success) {
      return { available: false, error: validationResult.error.message };
    }

    const existingLink = await db.query.links.findFirst({
      where: eq(links.shortCode, alias),
    });

    return { available: !existingLink };
  } catch (error) {
    console.error("Error checking alias availability:", error);
    return { available: false, error: "Failed to check availability" };
  }
}

export async function updateLink(
  linkId: string,
  data: { originalUrl: string; expiryDuration: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getThrowUser();

    const linkValidation = linkIdSchema.safeParse(linkId);
    if (!linkValidation.success) {
      return { success: false, error: "Invalid link ID" };
    }

    const validationResult = updateLinkSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Invalid data",
      };
    }

    const { originalUrl, expiryDuration } = validationResult.data;

    const link = await db.query.links.findFirst({
      where: eq(links.id, linkId),
    });

    if (!link) {
      return { success: false, error: "Link not found" };
    }

    if (link.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const expiresAt = calculateExpiresAt(expiryDuration);

    await db
      .update(links)
      .set({
        originalUrl,
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(links.id, linkId));

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error updating link:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "You must be signed in" };
    }
    return { success: false, error: "Failed to update link" };
  }
}
