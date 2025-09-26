import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { DropdownSelect } from "../../../components/ui/dropdown-select";
import { DataTable } from "../../../components/ui/table/DataTable";
import { Dialog } from "../../../components/ui/dialog";
import { type ColumnDef } from "@tanstack/react-table";
import { api } from "../../../lib/axios";
import { toast } from "sonner";
import { exportToCsv } from "../../../utils/exportCsv";
import { exportToExcel } from "../../../utils/exportFile";

type Webhook = {
  id: number;
  url: string;
  event: string;
  status: "ENABLED" | "DISABLED";
  createdAt: string;
};

const eventOptions = [
  { value: "transaction.success", label: "Transaction Success" },
  { value: "transaction.failed", label: "Transaction Failed" },
  { value: "dispute.opened", label: "Dispute Opened" },
  { value: "dispute.closed", label: "Dispute Closed" },
];

export default function WebhooksPage() {
  const [data, setData] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [open, setOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newEvent, setNewEvent] = useState<string | number>("");

  const [selected, setSelected] = useState<Webhook[]>([]);

  async function fetchWebhooks() {
    try {
      setLoading(true);
      const { data } = await api.get("/settings/webhooks");
      setData(data.responseData || []);
      setError(false);
    } catch {
      setError(true);
      toast.error("Failed to load webhooks");
    } finally {
      setLoading(false);
    }
  }

  async function addWebhook() {
    try {
      if (!newUrl || !newEvent) return toast.error("All fields required");
      await api.post("/settings/webhooks", { url: newUrl, event: newEvent });
      toast.success("Webhook added");
      setOpen(false);
      setNewUrl("");
      setNewEvent("");
      fetchWebhooks();
    } catch {
      toast.error("Failed to add webhook");
    }
  }

  async function toggleWebhook(id: number, status: string) {
    try {
      await api.patch(`/settings/webhooks/${id}`, { status });
      fetchWebhooks();
    } catch {
      toast.error("Failed to update webhook");
    }
  }

  async function deleteWebhook(id: number) {
    try {
      await api.delete(`/settings/webhooks/${id}`);
      fetchWebhooks();
    } catch {
      toast.error("Failed to delete webhook");
    }
  }

  // Bulk actions
  async function bulkEnable() {
    try {
      await Promise.all(
        selected.map((wh) =>
          api.patch(`/settings/webhooks/${wh.id}`, { status: "ENABLED" })
        )
      );
      toast.success("Selected webhooks enabled");
      fetchWebhooks();
    } catch {
      toast.error("Failed to enable webhooks");
    }
  }

  async function bulkDisable() {
    try {
      await Promise.all(
        selected.map((wh) =>
          api.patch(`/settings/webhooks/${wh.id}`, { status: "DISABLED" })
        )
      );
      toast.success("Selected webhooks disabled");
      fetchWebhooks();
    } catch {
      toast.error("Failed to disable webhooks");
    }
  }

  async function bulkDelete() {
    try {
      await Promise.all(selected.map((wh) => api.delete(`/settings/webhooks/${wh.id}`)));
      toast.success("Selected webhooks deleted");
      fetchWebhooks();
    } catch {
      toast.error("Failed to delete webhooks");
    }
  }

  function handleExportExcel() {
    const headers = ["ID", "URL", "Event", "Status", "Created At"];
    const rows = data.map((wh) => [
        wh.id,
        wh.url,
        wh.event,
        wh.status,
        new Date(wh.createdAt).toLocaleString(),
    ]);
    exportToExcel("webhooks.xlsx", headers, rows);
    }

  // Export to CSV
  async function handleExportCsv() {
    const headers = ["ID", "URL", "Event", "Status", "Created At"];
    const rows = data.map((wh) => [
    wh.id,
    wh.url,
    wh.event,
    wh.status,
    new Date(wh.createdAt).toLocaleString(),
    ]);
    exportToCsv("webhooks.csv", headers, rows);
  }

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const columns: ColumnDef<Webhook>[] = [
    { accessorKey: "url", header: "URL" },
    { accessorKey: "event", header: "Event" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`px-2 py-1 rounded text-xs ${
              status === "ENABLED"
                ? "bg-green-100 text-green-600"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const wh = row.original;
        return (
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toggleWebhook(
                  wh.id,
                  wh.status === "ENABLED" ? "DISABLED" : "ENABLED"
                )
              }
            >
              {wh.status === "ENABLED" ? "Disable" : "Enable"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteWebhook(wh.id)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Webhooks</h1>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>Add New</Button>
          </Dialog.Trigger>

          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Add Webhook</Dialog.Title>
              <Dialog.Description>
                Define the endpoint and event type.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body className="space-y-4">
              <Input
                title="Webhook URL"
                placeholder="https://example.com/webhook"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
              <DropdownSelect
                options={eventOptions}
                placeholder="Select event"
                value={newEvent}
                onChange={(v) => setNewEvent(v)}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </Dialog.Close>
              <Button onClick={addWebhook}>Save</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading}
        isError={error}
        emptyMessage="No webhooks configured."
        selectable
        onSelectionChange={setSelected}
        bulkActions={
          <>
            <Button variant="secondary" onClick={bulkEnable}>
              Enable
            </Button>
            <Button variant="secondary" onClick={bulkDisable}>
              Disable
            </Button>
            <Button variant="destructive" onClick={bulkDelete}>
              Delete
            </Button>
          </>
        }
        exportOptions={[
            { label: "Export CSV", onClick: handleExportCsv },
            { label: "Export Excel", onClick: handleExportExcel },
        ]}
      />
    </div>
  );
}

