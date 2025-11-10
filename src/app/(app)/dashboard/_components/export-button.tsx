"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { getAnalyticsForExport } from "@/actions/analytics";
import { convertToCSV, downloadCSV } from "@/lib/csv";
import { toast } from "sonner";

interface ExportButtonProps {
  linkId: string;
  shortCode: string;
}

export function ExportButton({ linkId, shortCode }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await getAnalyticsForExport(linkId);

      if (!result.success) {
        toast.error("Export failed", {
          description: result.error,
        });
        return;
      }

      if (result.data.length === 0) {
        toast.info("No data to export", {
          description: "There are no clicks to export yet.",
        });
        return;
      }

      const csv = convertToCSV(result.data);
      const filename = `analytics-${shortCode}-${new Date().toISOString().split("T")[0]}.csv`;
      downloadCSV(filename, csv);

      toast.success("Export successful", {
        description: `Downloaded ${result.data.length} click records.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </>
      )}
    </Button>
  );
}
