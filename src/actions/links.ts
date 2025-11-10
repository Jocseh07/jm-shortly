"use server";

import { db } from "@/db";
import { links } from "@/db/schema";
import { eq, desc, or, like, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getThrowUser } from "./getThrowUser";
import { createLinkSchema, linkIdSchema, aliasSchema, updateLinkSchema } from "@/lib/validations";
import { getBaseUrl } from "@/lib/url";

function generateShortCode(): string {
  return crypto.randomUUID().slice(0, 6).replace(/-/g, "");
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
    const expiresAt = formData.get("expiresAt") as string;
    const expirationMessage = formData.get("expirationMessage") as string;
    const activateAt = formData.get("activateAt") as string;

    const validationResult = createLinkSchema.safeParse({
      originalUrl,
      customAlias: customAlias || undefined,
      expiresAt: expiresAt || undefined,
      expirationMessage: expirationMessage || undefined,
      activateAt: activateAt || undefined,
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
      expiresAt: validatedExpiresAt,
      expirationMessage: validatedExpirationMessage,
      activateAt: validatedActivateAt,
    } = validationResult.data;

    const shortCode = validatedAlias || generateShortCode();
    const expiresAtDate = validatedExpiresAt ? new Date(validatedExpiresAt) : null;
    const activateAtDate = validatedActivateAt ? new Date(validatedActivateAt) : null;

    // Validate that activation date is before expiry date
    if (activateAtDate && expiresAtDate && activateAtDate >= expiresAtDate) {
      return {
        success: false,
        error: "Activation date must be before expiry date",
      };
    }

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
      expiresAt: expiresAtDate,
      expirationMessage: validatedExpirationMessage || null,
      activateAt: activateAtDate,
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

export async function getUserLinks(params?: {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
}) {
  try {
    const userId = await getThrowUser();

    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 50;
    const searchQuery = params?.searchQuery;
    const offset = (page - 1) * pageSize;

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

    // Get total count
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(links)
      .where(whereCondition);

    // Get paginated data
    const userLinks = await db.query.links.findMany({
      where: whereCondition,
      orderBy: desc(links.createdAt),
      limit: pageSize,
      offset: offset,
    });

    const pageCount = Math.ceil(totalCount / pageSize);

    return {
      data: userLinks,
      pagination: {
        page,
        pageSize,
        totalCount,
        pageCount,
      },
    };
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
  data: { originalUrl: string; expiresAt?: string; expirationMessage?: string; activateAt?: string }
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

    const { originalUrl, expiresAt, expirationMessage, activateAt } = validationResult.data;

    const link = await db.query.links.findFirst({
      where: eq(links.id, linkId),
    });

    if (!link) {
      return { success: false, error: "Link not found" };
    }

    if (link.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
    const activateAtDate = activateAt ? new Date(activateAt) : null;

    // Validate that activation date is before expiry date
    if (activateAtDate && expiresAtDate && activateAtDate >= expiresAtDate) {
      return {
        success: false,
        error: "Activation date must be before expiry date",
      };
    }

    await db
      .update(links)
      .set({
        originalUrl,
        expiresAt: expiresAtDate,
        expirationMessage: expirationMessage || null,
        activateAt: activateAtDate,
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
