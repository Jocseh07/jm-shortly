"use server";

import { db } from "@/db";
import { links, clicks } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";

function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }

  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return "mobile";
  }

  return "desktop";
}

export async function trackClick(
  linkId: string,
  shortCode: string
): Promise<void> {
  try {
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";
    const referer = headersList.get("referer") || "direct";

    const deviceType = getDeviceType(userAgent);

    await Promise.all([
      db
        .update(links)
        .set({
          clicks: sql`${links.clicks} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(links.shortCode, shortCode)),

      db.insert(clicks).values({
        id: crypto.randomUUID(),
        linkId,
        timestamp: new Date(),
        ipAddress,
        userAgent,
        referer,
        deviceType,
      }),
    ]);
  } catch (error) {
    console.error("Error tracking click:", error);
  }
}
