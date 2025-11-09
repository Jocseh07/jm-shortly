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

export function ReferrersTable({
  referrers,
}: {
  referrers: Array<{ referer: string; count: number }>;
}) {
  if (referrers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Referrers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No referrer data available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = referrers.reduce((sum, ref) => sum + ref.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Referrers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrers.map((ref, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {ref.referer === "direct" ? (
                    <Badge variant="outline">Direct</Badge>
                  ) : (
                    <span className="truncate max-w-[200px] block">
                      {ref.referer}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {ref.count.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {((ref.count / total) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
