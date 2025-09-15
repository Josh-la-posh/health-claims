import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { cn } from "../../../utils/cn";
import { SkeletonLine } from "../../ui/skeleton";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  isError?: boolean;
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  isError,
  page = 1,
  pageCount = 1,
  onPageChange,
  emptyMessage = "No data to display.",
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-border bg-card", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-border/40 text-muted">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={cn("px-3 py-2 font-medium", canSort && "cursor-pointer select-none")}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted === "asc" && <span aria-hidden>▲</span>}
                        {sorted === "desc" && <span aria-hidden>▼</span>}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={`s-${i}`} className="border-t border-border">
                  {columns.map((_, j) => (
                    <td key={j} className="px-3 py-2">
                      <SkeletonLine />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr className="border-t border-border">
                <td colSpan={columns.length} className="px-3 py-6 text-center text-red-600">
                  Failed to load data.
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr className="border-t border-border">
                <td colSpan={columns.length} className="px-3 py-6 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-border hover:bg-border/20">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPageChange && pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-border p-2">
          <div className="text-xs text-muted">
            Page <span className="font-medium text-card-foreground">{page}</span> of{" "}
            <span className="font-medium text-card-foreground">{pageCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-border px-2 py-1 text-sm hover:bg-border/40 disabled:opacity-50"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Prev
            </button>
            <button
              className="rounded-md border border-border px-2 py-1 text-sm hover:bg-border/40 disabled:opacity-50"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pageCount}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
