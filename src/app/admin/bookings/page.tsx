"use client";
import React from "react";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/types/database.types";
import { EmployeeAssignment } from "./EmployeeAssignment";
import { WorkflowNavigator } from "@/app/components/workflow/WorkflowNavigator";
import { Receipt } from "lucide-react";

type Booking = Tables<"booking">;

// Accepted booking statuses per DB constraint
const STATUS = [
  "Pending",
  "Confirmed",
  "Assigned",
  "In Progress",
  "Completed",
  "Cancelled",
] as const;

export default function AdminBookings() {
  const [status, setStatus] = React.useState<string>("");
  const [query, setQuery] = React.useState("");
  const [rows, setRows] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<Booking | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [showColumns, setShowColumns] = React.useState(false);

  // Column picker
  type ColumnKey =
    | "reference_number"
    | "customer_name"
    | "customer_email"
    | "customer_phone"
    | "service_type"
    | "preferred_date"
    | "status"
    | "customer_address"
    | "amount_due"
    | "amount_paid"
    | "estimated_value"
    | "payment_status"
    | "workflow_status";

  const allColumns: { key: ColumnKey; label: string; render: (b: Booking) => React.ReactNode }[] = [
    { key: "reference_number", label: "Reference", render: (b) => b.reference_number },
    { key: "customer_name", label: "Customer", render: (b) => b.customer_name },
    { key: "customer_email", label: "Email", render: (b) => b.customer_email },
    { key: "customer_phone", label: "Phone", render: (b) => b.customer_phone || "—" },
    { key: "service_type", label: "Service", render: (b) => b.service_type },
    {
      key: "preferred_date",
      label: "Preferred Date",
      render: (b) => (b.preferred_date ? new Date(b.preferred_date).toLocaleDateString() : "—"),
    },
    { key: "status", label: "Status", render: (b) => b.status || "Pending" },
    { key: "customer_address", label: "Address", render: (b) => b.customer_address || "—" },
    { key: "amount_due", label: "Amount Due", render: (b) => b.amount_due ?? "—" },
    { key: "amount_paid", label: "Amount Paid", render: (b) => b.amount_paid ?? "—" },
    { key: "estimated_value", label: "Estimated Value", render: (b) => b.estimated_value ?? "—" },
    { key: "payment_status", label: "Payment Status", render: (b) => b.payment_status ?? "—" },
    { 
      key: "workflow_status", 
      label: "Workflow", 
      render: (b) => (
        <div className="flex items-center gap-1 text-xs">
          <Receipt className={`h-3 w-3 ${(b as any).has_invoice ? 'text-green-500' : 'text-gray-300'}`} />
          <span className={(b as any).has_invoice ? 'text-green-600' : 'text-gray-400'}>
            {(b as any).has_invoice ? 'Invoiced' : 'No Invoice'}
          </span>
        </div>
      )
    },
  ];

  const defaultVisible: ColumnKey[] = [
    "reference_number",
    "customer_name",
    "customer_email",
    "customer_phone",
    "service_type",
    "preferred_date",
    "status",
    "customer_address",
    "amount_due",
    "amount_paid",
    "estimated_value",
    "payment_status",
    "workflow_status",
  ];

  const [visibleKeys, setVisibleKeys] = React.useState<Set<ColumnKey>>(new Set(defaultVisible));

  // After mount, hydrate from localStorage to avoid SSR/CSR mismatches
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("bookings.columns.v1");
      if (raw) {
        const parsed = JSON.parse(raw) as ColumnKey[];
        setVisibleKeys(new Set(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  const visibleColumns = allColumns.filter((c) => visibleKeys.has(c.key));

  const toggleColumn = (key: ColumnKey) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        localStorage.setItem("bookings.columns.v1", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters for the API
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (query) params.append('search', query);
      
      const response = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const { bookings, error } = await response.json();
      if (error) throw new Error(error);
      
      // Enhance bookings with invoice status
      const bookingsWithInvoiceStatus = await Promise.all(
        (bookings ?? []).map(async (booking) => {
          const { data: invoices } = await supabase
            .from('invoices')
            .select('id')
            .eq('booking_id', booking.id)
            .limit(1);
          
          return {
            ...booking,
            has_invoice: invoices && invoices.length > 0
          };
        })
      );
      
      setRows(bookingsWithInvoiceStatus as any);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [status, query]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleQuickUpdateStatus = async (id: string, nextStatus: string) => {
    try {
      setSaving(true);
      setSaveError(null);
      const { error } = await (supabase as any)
        .from("booking")
        .update({ status: nextStatus })
        .eq("id", id);
      if (error) throw error;
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r)));
      setSelected((prev) => (prev && prev.id === id ? { ...prev, status: nextStatus } : prev));
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const saveSelected = async (b: Booking) => {
    try {
      setSaving(true);
      setSaveError(null);
      const updatableKeys: (keyof Booking)[] = [
        "reference_number",
        "service_type",
        "preferred_date",
        "status",
        "notes",
        "payment_status",
        "amount_due",
        "amount_paid",
        "estimated_value",
        "service_cost",
        "deposit_required",
        "service_details",
        "assignment_date",
        "assigned_employee_id",
      ];
      const payload: Partial<Booking> = {};
      for (const k of updatableKeys) {
        // @ts-expect-error index access is safe by design here
        payload[k] = b[k];
      }
      if (!payload.status) payload.status = "Pending";
      const { error } = await (supabase as any).from("booking").update(payload).eq("id", b.id);
      if (error) throw error;
      setRows((prev) => prev.map((r) => (r.id === b.id ? { ...r, ...payload } : r)));
      setSelected(null);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const createInvoiceFromBooking = async (booking: Booking) => {
    try {
      if (!booking.service_cost && !booking.estimated_value) {
        alert('Please set a service cost or estimated value before creating an invoice.');
        return;
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

      const invoiceData = {
        dueDate: dueDate.toISOString().split('T')[0],
        notes: `Invoice for ${booking.service_type} service`,
        adjustments: [] // Can be expanded later for additional charges
      };

      const response = await fetch(`/api/admin/bookings/${booking.id}/invoice-from-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invoice');
      }

      const result = await response.json();
      
      // Show success message with source information
      const sourceMessage = result.source === 'quote' ? 
        `Invoice ${result.invoice.invoice_number} created successfully using original quote data (${result.quote_reference})!` :
        `Invoice ${result.invoice.invoice_number} created successfully!`;
      
      alert(sourceMessage);
      
      // Redirect to financials page to view the invoice
      window.location.href = '/admin/financials?tab=invoices';
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert(error instanceof Error ? error.message : 'Failed to create invoice');
    }
  };

  return (
    <div className="grid gap-4">
      <div className="rounded-md border bg-white dark:bg-gray-950 p-4">
        <h1 className="text-xl font-semibold mb-4">Bookings</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded border px-3 py-2 text-sm bg-white dark:bg-gray-900"
            >
              <option value="">All Statuses</option>
              {STATUS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, service"
              className="rounded border px-3 py-2 text-sm w-64 bg-white dark:bg-gray-900"
            />
            <button onClick={fetchData} className="rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Apply</button>
          </div>
          <div className="flex gap-2 items-center relative">
            <button onClick={() => exportCsv(rows)} className="rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Export CSV</button>
            <button onClick={() => setShowColumns((s) => !s)} className="rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Columns</button>
            {showColumns && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-md border bg-white dark:bg-gray-950 shadow p-3 z-20">
                <div className="text-xs font-semibold mb-2">Visible Columns</div>
                <div className="max-h-80 overflow-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allColumns.map((c) => (
                    <label key={c.key} className="flex items-center gap-2 text-sm whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={visibleKeys.has(c.key)}
                        onChange={() => toggleColumn(c.key)}
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-auto rounded border">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr className="text-left">
                {visibleColumns.map((c) => (
                  <th key={c.key} className="px-3 py-2 font-medium border-b">{c.label}</th>
                ))}
                <th className="px-3 py-2 font-medium border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-3 py-4" colSpan={visibleColumns.length + 1}>Loading…</td></tr>
              ) : error ? (
                <tr><td className="px-3 py-4 text-red-600" colSpan={visibleColumns.length + 1}>{error}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="px-3 py-4 text-gray-500" colSpan={visibleColumns.length + 1}>No bookings found.</td></tr>
              ) : (
                rows.map((b) => (
                  <tr key={b.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-950 dark:even:bg-gray-900">
                    {visibleColumns.map((c) => (
                      <td key={c.key} className="px-3 py-2 border-b">{c.render(b)}</td>
                    ))}
                    <td className="px-3 py-2 border-b">
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(b)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800">View</button>
                        {(!b.status || b.status === "Pending") && (
                          <button
                            onClick={() => handleQuickUpdateStatus(b.id, "Confirmed")}
                            className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selected ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl bg-white dark:bg-gray-950 rounded-md shadow p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Booking Details</h2>
              <button onClick={() => setSelected(null)} className="rounded border px-2 py-1 text-xs">Close</button>
            </div>
            
            <WorkflowNavigator 
              currentType="booking" 
              currentId={selected.id}
              bookingId={selected.id}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <Field label="Reference" value={selected.reference_number} />
              <Field label="Customer" value={selected.customer_name} />
              <Field label="Email" value={selected.customer_email} />
              <Field label="Phone" value={selected.customer_phone} />
              <div>
                <div className="text-xs text-gray-500">Service</div>
                <input
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  value={selected.service_type || ""}
                  onChange={(e) => setSelected({ ...selected, service_type: e.target.value })}
                />
              </div>
              <div>
                <div className="text-xs text-gray-500">Preferred Date</div>
                <input
                  type="date"
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  value={selected.preferred_date ? selected.preferred_date.slice(0, 10) : ""}
                  onChange={(e) => setSelected({ ...selected, preferred_date: e.target.value || null })}
                />
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <select
                  value={selected.status || "Pending"}
                  onChange={(e) => setSelected({ ...selected, status: e.target.value })}
                  className="mt-1 rounded border px-2 py-1 bg-white dark:bg-gray-900 w-full"
                >
                  {STATUS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Field label="Address" value={selected.customer_address} />
              <div>
                <div className="text-xs text-gray-500">Payment Status</div>
                <input
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  value={selected.payment_status || ""}
                  onChange={(e) => setSelected({ ...selected, payment_status: e.target.value })}
                />
              </div>
              <div>
                <div className="text-xs text-gray-500">Amount Due</div>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  value={selected.amount_due ?? ""}
                  onChange={(e) => setSelected({ ...selected, amount_due: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>
              <div>
                <div className="text-xs text-gray-500">Amount Paid</div>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  value={selected.amount_paid ?? ""}
                  onChange={(e) => setSelected({ ...selected, amount_paid: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>
              <div>
                <div className="text-xs text-gray-500">Estimated Value</div>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  value={selected.estimated_value ?? ""}
                  onChange={(e) => setSelected({ ...selected, estimated_value: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>
              <div>
                <div className="text-xs text-gray-500">Service Cost</div>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  value={selected.service_cost ?? ""}
                  onChange={(e) => setSelected({ ...selected, service_cost: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>
              <div>
                <div className="text-xs text-gray-500">Deposit Required</div>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  value={selected.deposit_required ?? ""}
                  onChange={(e) => setSelected({ ...selected, deposit_required: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Service Details</div>
                <textarea
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  rows={3}
                  value={selected.service_details || ""}
                  onChange={(e) => setSelected({ ...selected, service_details: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Notes</div>
                <textarea
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  rows={3}
                  value={selected.notes || ""}
                  onChange={(e) => setSelected({ ...selected, notes: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 border-t pt-4 mt-2">
                <EmployeeAssignment
                  bookingId={selected.id}
                  currentEmployeeId={selected.assigned_employee_id}
                  onAssign={(employeeId) => {
                    setSelected({
                      ...selected,
                      assigned_employee_id: employeeId,
                      status: employeeId ? 'Assigned' : 'Confirmed'
                    });
                  }}
                />
              </div>
            </div>
            {saveError && <p className="text-sm text-red-600 mt-3">{saveError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              {selected.status === 'Completed' && (
                <button
                  onClick={() => createInvoiceFromBooking(selected)}
                  className="rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-green-600 border-green-300"
                >
                  Create Invoice
                </button>
              )}
              <button
                onClick={() => saveSelected(selected)}
                className="rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-gray-400">—</div>
    </div>
  );
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div>{String(value)}</div>
    </div>
  );
}

function exportCsv(rows: Booking[]) {
  const headers = [
    "reference_number",
    "customer_name",
    "customer_email",
    "service_type",
    "preferred_date",
    "status",
  ];
  const lines = [headers.join(",")].concat(
    rows.map((r) => [
      r.reference_number,
      r.customer_name,
      r.customer_email,
      r.service_type,
      r.preferred_date ?? "",
      r.status ?? "",
    ].map(csvEscape).join(","))
  );
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bookings-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string | number | null | undefined) {
  const v = value == null ? "" : String(value);
  if (v.includes(",") || v.includes("\n") || v.includes('"')) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}

// removed module-scoped quickUpdateStatus helper; handled within component to update state


