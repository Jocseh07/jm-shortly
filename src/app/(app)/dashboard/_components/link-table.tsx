"use client";

import { deleteLink, toggleLinkStatus } from "@/actions/links";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { useTransition, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DataTable } from "./data-table";
import { createColumns, LinkType } from "./columns";
import { EditLinkDialog } from "./edit-link-dialog";
import { SearchInput } from "./search-input";
import { DataTableViewOptions } from "./data-table-view-options";

interface LinkTableProps {
  links: LinkType[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    pageCount: number;
  };
  searchQuery?: string;
}

export function LinkTable({ links, pagination, searchQuery }: LinkTableProps) {
  const [, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    
    if (newPageSize !== 50) {
      params.set('pageSize', newPageSize.toString());
    } else {
      params.delete('pageSize');
    }
    
    if (newPage > 1) {
      params.set('page', newPage.toString());
    } else {
      params.delete('page');
    }
    
    router.push(`${pathname}?${params.toString()}`);
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
      <DataTable 
        columns={columns} 
        data={links} 
        onRowClick={handleRowClick}
        serverPagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalCount: pagination.totalCount,
          pageCount: pagination.pageCount,
          onPaginationChange: handlePaginationChange,
        }}
        renderControls={(table) => (
          <div className="flex items-center justify-between gap-4">
            <div className="max-w-2xl flex-1">
              <SearchInput />
            </div>
            {searchQuery && (
              <div className="text-sm text-muted-foreground hidden sm:block">
                {pagination.totalCount === 0 ? (
                  <>No results found</>
                ) : (
                  <>{pagination.totalCount} result{pagination.totalCount !== 1 ? "s" : ""}</>
                )}
              </div>
            )}
            <DataTableViewOptions table={table} />
          </div>
        )}
      />
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
