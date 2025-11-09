"use client";

import { deleteLink, toggleLinkStatus } from "@/actions/links";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { useTransition, useState } from "react";
import Link from "next/link";
import { DataTable } from "./data-table";
import { createColumns, LinkType } from "./columns";

export function LinkTable({ links }: { links: LinkType[] }) {
  const [, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  const handleDelete = async (linkId: string) => {
    startTransition(async () => {
      const result = await deleteLink(linkId);
      if (!result.success) {
        alert(result.error || "Failed to delete link");
      }
    });
  };

  const handleToggleStatus = async (linkId: string) => {
    startTransition(async () => {
      const result = await toggleLinkStatus(linkId);
      if (!result.success) {
        alert(result.error || "Failed to update link status");
      }
    });
  };

  const handleCopy = async (shortCode: string) => {
    const shortUrl = `${window.location.origin}/${shortCode}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(shortCode);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (links.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No links yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first shortened link to get started
        </p>
        <Button asChild>
          <Link href="/">Create Link</Link>
        </Button>
      </div>
    );
  }

  const columns = createColumns({
    onToggleStatus: handleToggleStatus,
    onDelete: handleDelete,
    onCopy: handleCopy,
    copied,
  });

  return <DataTable columns={columns} data={links} />;
}
