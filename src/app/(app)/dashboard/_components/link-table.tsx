"use client";

import { deleteLink, toggleLinkStatus } from "@/actions/links";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { useTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable } from "./data-table";
import { createColumns, LinkType } from "./columns";
import { EditLinkDialog } from "./edit-link-dialog";

export function LinkTable({ links }: { links: LinkType[] }) {
  const [, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const router = useRouter();

  const handleDelete = async (linkId: string) => {
    startTransition(async () => {
      const result = await deleteLink(linkId);
      if (!result.success) {
        alert(result.error || "Failed to delete link");
      }
    });
  };

  const handleToggleStatus = (linkId: string): Promise<void> => {
    const operation = toggleLinkStatus(linkId);
    startTransition(async () => {
      const result = await operation;
      if (!result.success) {
        alert(result.error || "Failed to update link status");
      }
    });
    return operation.then(() => undefined);
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

  const handleRowClick = (link: LinkType) => {
    router.push(`/dashboard/${link.id}`);
  };

  const handleEdit = (link: LinkType) => {
    setEditingLink(link);
  };

  const columns = createColumns({
    onToggleStatus: handleToggleStatus,
    onDelete: handleDelete,
    onEdit: handleEdit,
    onCopy: handleCopy,
    copied,
  });

  return (
    <>
      <DataTable columns={columns} data={links} onRowClick={handleRowClick} />
      {editingLink && (
        <EditLinkDialog
          link={editingLink}
          open={!!editingLink}
          onOpenChange={(open) => !open && setEditingLink(null)}
        />
      )}
    </>
  );
}
