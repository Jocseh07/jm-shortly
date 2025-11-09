import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export function RecentClicks({
  clicks,
}: {
  clicks: Array<{
    id: string;
    timestamp: number;
    referer: string;
    deviceType: string;
  }>;
}) {
  if (clicks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No clicks yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Clicks</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Referrer</TableHead>
              <TableHead>Device</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clicks.map((click) => (
              <TableRow key={click.id}>
                <TableCell>
                  {formatDistanceToNow(new Date(click.timestamp), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {click.referer === "direct" ? (
                    <Badge variant="outline">Direct</Badge>
                  ) : (
                    <span title={click.referer}>{click.referer}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {click.deviceType}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
