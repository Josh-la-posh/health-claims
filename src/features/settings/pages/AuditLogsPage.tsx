// src/pages/settings/AuditLogsPage.tsx
import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../../components/ui/table/DataTable";
import { Badge } from "../../../components/ui/badge";
import { Dialog } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { DropdownSelect } from "../../../components/ui/dropdown-select";
import { Button } from "../../../components/ui/button";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";

type AuditLog = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target?: string;
  ip: string;
  status: "SUCCESS" | "FAILURE";
  metadata?: Record<string, unknown>;
};

const dummyLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2025-09-23T09:15:00Z",
    user: "support@naira.com",
    action: "Updated Merchant Settings",
    target: "Merchant Nai0000319",
    ip: "102.89.45.22",
    status: "SUCCESS",
    metadata: { changed: ["returnUrl", "notificationURL"] },
  },
  {
    id: "2",
    timestamp: "2025-09-22T21:03:00Z",
    user: "admin@pelpay.com",
    action: "Suspended Merchant",
    target: "Merchant Nai0000035",
    ip: "105.22.16.77",
    status: "FAILURE",
    metadata: { reason: "Insufficient compliance documents" },
  },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  // Filters
  const [userFilter, setUserFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | number>("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");

  React.useEffect(() => {
    // Replace with API call later
    setTimeout(() => {
      setLogs(dummyLogs);
      setLoading(false);
    }, 800);
  }, []);

  const clearFilters = () => {
    setUserFilter("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
  };

  // Apply filters locally (replace with server-side filters later)
  const filteredLogs = logs.filter((log) => {
    const byUser = userFilter
      ? log.user.toLowerCase().includes(userFilter.toLowerCase())
      : true;
    const byStatus = statusFilter ? log.status === statusFilter : true;
    const byDate =
      (dateFrom ? new Date(log.timestamp) >= new Date(dateFrom) : true) &&
      (dateTo ? new Date(log.timestamp) <= new Date(dateTo) : true);
    return byUser && byStatus && byDate;
  });

  const filtersActive = !!(
    userFilter || statusFilter || dateFrom || dateTo
  );

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }) => new Date(row.original.timestamp).toLocaleString(),
    },
    { accessorKey: "user", header: "User" },
    { accessorKey: "action", header: "Action" },
    { accessorKey: "target", header: "Target" },
    { accessorKey: "ip", header: "IP Address" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge color={row.original.status === "SUCCESS" ? "green" : "red"}>
          {row.original.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <p className="text-muted-foreground">
        Track user actions and system events for compliance and security.
      </p>

      {/* Collapsible Filters */}
      <Collapsible.Root open={filtersOpen} onOpenChange={setFiltersOpen}>
        <Collapsible.Trigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-2 relative"
          >
            <Filter size={16} />
            Filters
            {filtersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {filtersActive && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"></span>
            )}
          </Button>
        </Collapsible.Trigger>

        <Collapsible.Content className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-muted/40 p-4 rounded-lg items-end">
            <Input
              title="User"
              placeholder="Search by user"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            />
            <DropdownSelect
              label="Status"
              options={[
                { value: "", label: "All" },
                { value: "SUCCESS", label: "Success" },
                { value: "FAILURE", label: "Failure" },
              ]}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
            />
            <Input
              title="From"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              title="To"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={clearFilters}
              className="h-10"
            >
              Clear Filters
            </Button>
          </div>
        </Collapsible.Content>
      </Collapsible.Root>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        isLoading={loading}
        isError={false}
        emptyMessage="No audit logs found"
        selectable
        onRowClick={(row) => setSelectedLog(row)}
      />

      {/* Details Dialog */}
      <Dialog.Root open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Log Details</Dialog.Title>
            <Dialog.Description>
              Full details of the selected audit log
            </Dialog.Description>
          </Dialog.Header>

          <Dialog.Body>
            {selectedLog && (
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Timestamp:</span>{" "}
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">User:</span> {selectedLog.user}
                </p>
                <p>
                  <span className="font-medium">Action:</span>{" "}
                  {selectedLog.action}
                </p>
                {selectedLog.target && (
                  <p>
                    <span className="font-medium">Target:</span>{" "}
                    {selectedLog.target}
                  </p>
                )}
                <p>
                  <span className="font-medium">IP Address:</span>{" "}
                  {selectedLog.ip}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <Badge
                    color={
                      selectedLog.status === "SUCCESS" ? "green" : "red"
                    }
                  >
                    {selectedLog.status}
                  </Badge>
                </p>
                {selectedLog.metadata && (
                  <div>
                    <span className="font-medium">Metadata:</span>
                    <pre className="mt-1 rounded bg-muted p-2 text-xs">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.Close>
              <button className="rounded bg-primary px-4 py-2 text-white">
                Close
              </button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
