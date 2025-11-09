import { getLinkAnalytics } from "@/actions/analytics";
import { MetricsCards } from "../_components/metrics-cards";
import { ClicksChart } from "../_components/clicks-chart";
import { ReferrersTable } from "../_components/referrers-table";
import { DeviceBreakdown } from "../_components/device-breakdown";
import { RecentClicks } from "../_components/recent-clicks";
import { CopyButton } from "../_components/copy-button";
import { LinkStatusToggle } from "./_components/link-status-toggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getBaseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ linkId: string }>;
}) {
  const { linkId } = await params;
  const analytics = await getLinkAnalytics(linkId);

  if (!analytics.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{analytics.error}</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const baseUrl = await getBaseUrl();
  const shortUrl = `${baseUrl}/${analytics.link.shortCode}`;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Button variant="outline" size="icon" asChild className="shrink-0 mt-1">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-lg font-mono font-semibold">
                {analytics.link.shortCode}
              </code>
              <LinkStatusToggle
                linkId={analytics.link.id}
                isActive={analytics.link.isActive}
                shortCode={analytics.link.shortCode}
              />
            </div>

            <p
              className="text-sm text-muted-foreground truncate max-w-2xl"
              title={analytics.link.originalUrl}
            >
              → {analytics.link.originalUrl}
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <CopyButton shortUrl={shortUrl} />
          <Button variant="outline" size="sm" asChild>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </a>
          </Button>
        </div>
      </header>

      <MetricsCards metrics={analytics.metrics} />

      <ClicksChart data={analytics.clicksOverTime} />

      <div className="grid gap-6 md:grid-cols-2">
        <ReferrersTable referrers={analytics.topReferrers} />
        <DeviceBreakdown breakdown={analytics.deviceBreakdown} />
      </div>

      <RecentClicks clicks={analytics.recentClicks} />
    </div>
  );
}


