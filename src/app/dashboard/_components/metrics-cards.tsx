import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MousePointerClick, Clock, Calendar } from "lucide-react";

export function MetricsCards({
  metrics,
}: {
  metrics: {
    totalClicks: number;
    last24Hours: number;
    last7Days: number;
  };
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {metrics.totalClicks.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {metrics.last24Hours.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.totalClicks > 0
              ? `${((metrics.last24Hours / metrics.totalClicks) * 100).toFixed(1)}% of total`
              : "No clicks yet"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {metrics.last7Days.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.totalClicks > 0
              ? `${((metrics.last7Days / metrics.totalClicks) * 100).toFixed(1)}% of total`
              : "No clicks yet"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
