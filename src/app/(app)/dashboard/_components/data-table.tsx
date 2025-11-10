"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { useLocalStorage } from "@uidotdev/usehooks";

interface ServerPagination {
  page: number;
  pageSize: number;
  totalCount: number;
  pageCount: number;
  onPaginationChange: (page: number, pageSize: number) => void;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  renderControls?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode;
  serverPagination?: ServerPagination;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  renderControls,
  serverPagination,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  
  // Use useLocalStorage for persistent page size
  const [pageSize, setPageSize] = useLocalStorage("dashboard-page-size", 50);

  // Sync page size with server when it changes
  React.useEffect(() => {
    if (serverPagination && pageSize !== serverPagination.pageSize) {
      serverPagination.onPaginationChange(1, pageSize);
    }
  }, [pageSize, serverPagination]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: serverPagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: !!serverPagination,
    pageCount: serverPagination?.pageCount ?? -1,
    onPaginationChange: (updater) => {
      if (!serverPagination) return;
      
      const current = {
        pageIndex: serverPagination.page - 1,
        pageSize: serverPagination.pageSize,
      };
      
      const newState = typeof updater === "function" ? updater(current) : updater;
      
      // Update pageSize in localStorage
      if (newState.pageSize !== pageSize) {
        setPageSize(newState.pageSize);
      }
      
      // Trigger server update
      serverPagination.onPaginationChange(
        newState.pageIndex + 1,
        newState.pageSize
      );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: serverPagination
        ? {
            pageIndex: serverPagination.page - 1,
            pageSize: serverPagination.pageSize,
          }
        : {
            pageIndex: 0,
            pageSize,
          },
    },
  });

  return (
    <div className="space-y-4">
      {renderControls && renderControls(table)}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} serverPagination={serverPagination} />
    </div>
  );
}
