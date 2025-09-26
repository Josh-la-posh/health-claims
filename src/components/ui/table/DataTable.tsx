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
  type Table,
} from "@tanstack/react-table";
import { cn } from "../../../utils/cn";
import { SkeletonLine } from "../../ui/skeleton";
import { Dropdown } from "../../ui/dropdown";

type ExportOption = {
  label: string;
  onClick: () => void | Promise<void>;
};

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
  /** Export options (CSV, Excel, PDF, …) */
  exportOptions?: ExportOption[];
  /**
   * Controlled/server pagination. When provided, internal pagination row model & controls are bypassed and
   * the component renders simple Prev/Next buttons invoking the supplied callbacks.
   * pageIndex is 0-based externally for consistency with react-table.
   */
  pageIndex?: number;
  pageSize?: number; // informational only for now (not used internally when controlled)
  onNextPage?: () => void;
  onPrevPage?: () => void;
  canNextPage?: boolean;
  canPrevPage?: boolean;
  /** Optional total pages (if known). If omitted, only current page number is shown */
  totalPages?: number;
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
  exportOptions,
  pageIndex,
  pageSize,
  onNextPage,
  onPrevPage,
  canNextPage,
  canPrevPage,
  totalPages,
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
    // Use client pagination row model only when not externally controlled
    getPaginationRowModel: pageIndex === undefined ? getPaginationRowModel() : undefined,
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

            <div className="flex items-center gap-2">
              {/* Column visibility dropdown */}
              <ColumnVisibilityDropdown table={table} />

              {/* Export dropdown */}
              {exportOptions && exportOptions.length > 0 && (
                <Dropdown.Root>
                  <Dropdown.Trigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-border/40 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      Export
                    </button>
                  </Dropdown.Trigger>
                  <Dropdown.Content sideOffset={6} className="bg-bg text-fg border border-border">
                    {exportOptions.map((opt) => (
                      <Dropdown.Item
                        key={opt.label}
                        onSelect={(e) => {
                          e.preventDefault();
                          opt.onClick();
                        }}
                      >
                        {opt.label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Content>
                </Dropdown.Root>
              )}
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
                <td colSpan={table.getAllLeafColumns().length} className="px-3 py-6 text-center text-red-600">
                  Failed to load data.
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr className="border-t border-border">
                <td colSpan={table.getAllLeafColumns().length} className="px-3 py-6 text-center text-muted">
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
        {pageIndex === undefined ? (
          <>
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
          </>
        ) : (
          <>
            <span>
              Page {pageIndex + 1}
              {totalPages !== undefined && ` of ${totalPages}`}
              {selectable && ` • ${selectedCount} selected`}
              {pageSize !== undefined && ` • Showing ${data.length} / ${pageSize}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border border-border px-2 py-1 hover:bg-border/40 disabled:opacity-50"
                onClick={onPrevPage}
                disabled={!canPrevPage}
              >
                Prev
              </button>
              <button
                className="rounded-md border border-border px-2 py-1 hover:bg-border/40 disabled:opacity-50"
                onClick={onNextPage}
                disabled={!canNextPage}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Column visibility dropdown
function ColumnVisibilityDropdown<TData>({ table }: { table: Table<TData> }) {
  const cols = table.getAllLeafColumns().filter((c) => c.id !== "_select");
  const visibleCount = cols.filter((c) => c.getIsVisible()).length;
  const total = cols.length;

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-border/40 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Toggle columns"
        >
          View
          <span className="text-muted">
            {visibleCount}/{total}
          </span>
        </button>
      </Dropdown.Trigger>
      <Dropdown.Content className="w-56">
        <Dropdown.Label>Columns</Dropdown.Label>
        {cols.map((col) => {
          const active = col.getIsVisible();
          return (
            <Dropdown.Item
              key={col.id}
              onSelect={(e) => {
                e.preventDefault();
                col.toggleVisibility();
              }}
              className="flex items-center justify-between"
            >
              <span className="truncate">{col.id}</span>
              <span className={active ? "text-primary" : "text-muted"} aria-hidden="true">
                {active ? "✓" : ""}
              </span>
            </Dropdown.Item>
          );
        })}
        <Dropdown.Separator />
        <Dropdown.Item
          onSelect={(e) => {
            e.preventDefault();
            cols.forEach((c) => c.toggleVisibility(true));
          }}
        >
          Show All
        </Dropdown.Item>
        <Dropdown.Item
          onSelect={(e) => {
            e.preventDefault();
            cols.forEach((c) => c.toggleVisibility(false));
          }}
        >
          Hide All
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
