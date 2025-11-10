"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Copy,
  ExternalLink,
  Trash2,
  BarChart3,
  MoreHorizontal,
  Power,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { DataTableColumnHeader } from "./data-table-column-header";
import { LoadingSwap } from "@/components/ui/loading-swap";

function StatusCell({
  row,
  onToggleStatus,
}: {
  row: { original: LinkType };
  onToggleStatus: (linkId: string) => Promise<void>;
}) {
  const isActive = row.original.isActive;
  const [isToggling, setIsToggling] = useState(false);
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Badge variant={isActive ? "default" : "destructive"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            disabled={isToggling}
            onClick={async () => {
              setIsToggling(true);
              try {
                await onToggleStatus(row.original.id);
              } finally {
                setIsToggling(false);
              }
            }}
            className="h-7 w-7 p-0"
          >
            <LoadingSwap isLoading={isToggling} className="h-4 w-4">
              <Power className="h-4 w-4" />
            </LoadingSwap>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isActive ? "Deactivate" : "Activate"} link
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function ActionsCell({
  row,
  onCopy,
  onDelete,
  onEdit,
  copied,
}: {
  row: { original: LinkType };
  onCopy: (shortCode: string) => Promise<void>;
  onDelete: (linkId: string) => Promise<void>;
  onEdit: (link: LinkType) => void;
  copied: string | null;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const link = row.original;

  return (
    <>
      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCopy(link.shortCode)}
              className="h-8 w-8 p-0"
            >
              {copied === link.shortCode ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy short URL</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>More actions</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/${link.id}`} className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                View analytics
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={`/${link.shortCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open link
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(link)}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this link? This action cannot be
              undone. All analytics data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(link.id);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export type LinkType = {
  id: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  isActive: boolean;
  createdAt: Date | null;
  expiresAt: Date | null;
};

interface ColumnsConfig {
  onToggleStatus: (linkId: string) => Promise<void>;
  onDelete: (linkId: string) => Promise<void>;
  onEdit: (link: LinkType) => void;
  onCopy: (shortCode: string) => Promise<void>;
  copied: string | null;
}

export const createColumns = ({
  onToggleStatus,
  onDelete,
  onEdit,
  onCopy,
  copied,
}: ColumnsConfig): ColumnDef<LinkType>[] => [
  {
    accessorKey: "shortCode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Short Code" />
    ),
    cell: ({ row }) => (
      <span className="font-mono font-medium">{row.original.shortCode}</span>
    ),
  },
  {
    accessorKey: "originalUrl",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Original URL" />
    ),
    cell: ({ row }) => (
      <span
        className="max-w-xs truncate block"
        title={row.original.originalUrl}
      >
        {row.original.originalUrl}
      </span>
    ),
  },
  {
    accessorKey: "clicks",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Clicks" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.clicks.toLocaleString()}</Badge>
    ),
  },
  {
    id: "status",
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <StatusCell row={row} onToggleStatus={onToggleStatus} />,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return date
        ? formatDistanceToNow(new Date(date), { addSuffix: true })
        : "Unknown";
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      return (
        <ActionsCell
          row={row}
          onCopy={onCopy}
          onDelete={onDelete}
          onEdit={onEdit}
          copied={copied}
        />
      );
    },
  },
];
