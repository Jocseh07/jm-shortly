"use server";

import { db } from "@/db";
import { links, clicks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getThrowUser } from "./getThrowUser";
import { linkIdSchema } from "@/lib/validations";

type AnalyticsResult =
  | {
      success: true;
      link: {
        id: string;
        shortCode: string;
        originalUrl: string;
        createdAt: number;
        isActive: boolean;
      };
      metrics: {
        totalClicks: number;
        last24Hours: number;
        last7Days: number;
      };
      topReferrers: Array<{ referer: string; count: number }>;
      deviceBreakdown: {
        mobile: number;
        desktop: number;
        tablet: number;
        unknown: number;
      };
      clicksOverTime: Array<{ date: string; clicks: number }>;
      recentClicks: Array<{
        id: string;
        timestamp: number;
        referer: string;
        deviceType: string;
      }>;
    }
  | { success: false; error: string };

export async function getLinkAnalytics(
  linkId: string
): Promise<AnalyticsResult> {
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

    const allClicks = await db.query.clicks.findMany({
      where: eq(clicks.linkId, linkId),
      orderBy: (clicks, { desc }) => desc(clicks.timestamp),
    });

    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;
    const last7Days = now - 7 * 24 * 60 * 60 * 1000;

    const clicksLast24h = allClicks.filter(
      (click) => click.timestamp && click.timestamp.getTime() >= last24Hours
    ).length;

    const clicksLast7Days = allClicks.filter(
      (click) => click.timestamp && click.timestamp.getTime() >= last7Days
    ).length;

    const referrerCounts = allClicks.reduce(
      (acc, click) => {
        const ref = click.referer || "direct";
        acc[ref] = (acc[ref] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topReferrers = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([referer, count]) => ({ referer, count }));

    const deviceCounts = allClicks.reduce(
      (acc, click) => {
        const device = click.deviceType || "unknown";
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      },
      { mobile: 0, desktop: 0, tablet: 0, unknown: 0 } as Record<string, number>
    );

    const clicksByDate = allClicks.reduce(
      (acc, click) => {
        if (click.timestamp) {
          const date = new Date(click.timestamp).toISOString().split("T")[0];
          acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const clicksOverTime = Object.entries(clicksByDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([date, clicks]) => ({ date, clicks }));

    const recentClicks = allClicks.slice(0, 20).map((click) => ({
      id: click.id,
      timestamp: click.timestamp?.getTime() || 0,
      referer: click.referer || "direct",
      deviceType: click.deviceType || "unknown",
    }));

    return {
      success: true,
      link: {
        id: link.id,
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        createdAt: link.createdAt?.getTime() || 0,
        isActive: link.isActive,
      },
      metrics: {
        totalClicks: link.clicks,
        last24Hours: clicksLast24h,
        last7Days: clicksLast7Days,
      },
      topReferrers,
      deviceBreakdown: {
        mobile: deviceCounts.mobile || 0,
        desktop: deviceCounts.desktop || 0,
        tablet: deviceCounts.tablet || 0,
        unknown: deviceCounts.unknown || 0,
      },
      clicksOverTime,
      recentClicks,
    };
  } catch (error) {
    console.error("Error fetching link analytics:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "You must be signed in" };
    }
    return { success: false, error: "Failed to fetch analytics" };
  }
}

export async function getDashboardStats() {
  try {
    const userId = await getThrowUser();

    const userLinks = await db.query.links.findMany({
      where: eq(links.userId, userId),
    });

    const totalLinks = userLinks.length;
    const totalClicks = userLinks.reduce((sum, link) => sum + link.clicks, 0);

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const linksThisWeek = userLinks.filter(
      (link) => link.createdAt && link.createdAt >= oneWeekAgo
    ).length;

    return {
      totalLinks,
      totalClicks,
      linksThisWeek,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}
