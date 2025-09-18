import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { cn } from "../../../utils/cn";
import { SkeletonLine } from "../../ui/skeleton";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  className?: string;
  selectable?: boolean;
  onSelectionChange?: (selected: TData[]) => void;
  /** Bulk action buttons, shown when rows are selected */
  bulkActions?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  isError,
  emptyMessage = "No data to display.",
  onRowClick,
  className,
  selectable = false,
  onSelectionChange,
  bulkActions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns: React.useMemo(() => {
      if (!selectable) return columns;
      return [
        {
          id: "_select",
          header: ({ table }) => (
            <input
              type="checkbox"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
              aria-label="Select row"
            />
          ),
          size: 40,
        } as ColumnDef<TData, TValue>,
        ...columns,
      ];
    }, [columns, selectable]),
    state: { sorting, columnVisibility, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: selectable,
  });

  // Expose selected rows
  React.useEffect(() => {
    if (onSelectionChange) {
      const selected = table.getSelectedRowModel().rows.map((r) => r.original);
      onSelectionChange(selected);
    }
  }, [rowSelection, onSelectionChange, table]);

  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-border bg-card", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-border">
        {selectedCount > 0 && bulkActions ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{selectedCount} selected</span>
            {bulkActions}
          </div>
        ) : (
          <>
            {/* Search */}
            <input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search…"
              className="w-56 rounded-md border border-border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />

            {/* Column toggle menu */}
            <div className="flex items-center gap-2 text-xs">
              {table.getAllLeafColumns()
                .filter((c) => c.id !== "_select")
                .map((col) => (
                  <label key={col.id} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={col.getIsVisible()}
                      onChange={col.getToggleVisibilityHandler()}
                    />
                    {col.id}
                  </label>
                ))}
            </div>
          </>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" role="table">
          <thead className="bg-border/40 text-muted">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
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
                  {table.getAllLeafColumns().map((_, j) => (
                    <td key={j} className="px-3 py-2">
                      <SkeletonLine />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr className="border-t border-border">
                <td
                  colSpan={table.getAllLeafColumns().length}
                  className="px-3 py-6 text-center text-red-600"
                >
                  Failed to load data.
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr className="border-t border-border">
                <td
                  colSpan={table.getAllLeafColumns().length}
                  className="px-3 py-6 text-center text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-t border-border hover:bg-border/20",
                    row.getIsSelected() && "bg-primary/5"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
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
      <div className="flex items-center justify-between border-t border-border p-2 text-xs">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          {selectable && ` • ${selectedCount} selected`}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-border px-2 py-1 hover:bg-border/40 disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </button>
          <button
            className="rounded-md border border-border px-2 py-1 hover:bg-border/40 disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}