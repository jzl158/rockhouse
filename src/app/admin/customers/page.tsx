"use client";
import React from "react";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/types/database.types";

type Customer = Tables<"user">;

export default function AdminCustomers() {
  const [query, setQuery] = React.useState("");
  const [rows, setRows] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<Customer | null>(null);
  const [showColumns, setShowColumns] = React.useState(false);

  type ColumnKey =
    | "firstName"
    | "lastName"
    | "email"
    | "phone"
    | "address"
    | "role"
    | "is_active"
    | "is_admin"
    | "points"
    | "referral_code"
    | "referral_credits"
    | "created_at";

  const allColumns: { key: ColumnKey; label: string; render: (c: Customer) => React.ReactNode }[] = [
    { key: "firstName", label: "First Name", render: (c) => c.firstName || "—" },
    { key: "lastName", label: "Last Name", render: (c) => c.lastName || "—" },
    { key: "email", label: "Email", render: (c) => c.email },
    { key: "phone", label: "Phone", render: (c) => c.phone || "—" },
    { key: "address", label: "Address", render: (c) => c.address || "—" },
    { key: "role", label: "Role", render: (c) => c.role || "—" },
    { key: "is_active", label: "Active", render: (c) => String(c.is_active ?? false) },
    { key: "is_admin", label: "Admin", render: (c) => String(c.is_admin ?? false) },
    { key: "points", label: "Points", render: (c) => c.points ?? 0 },
    { key: "referral_code", label: "Referral Code", render: (c) => c.referral_code || "—" },
    { key: "referral_credits", label: "Referral Credits", render: (c) => c.referral_credits ?? 0 },
    { key: "created_at", label: "Created", render: (c) => (c.created_at ? new Date(c.created_at).toLocaleDateString() : "—") },
  ];

  const defaultVisible: ColumnKey[] = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "role",
    "is_active",
    "created_at",
  ];

  const [visibleKeys, setVisibleKeys] = React.useState<Set<ColumnKey>>(new Set(defaultVisible));
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("customers.columns.v1");
      if (raw) setVisibleKeys(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const visibleColumns = allColumns.filter((c) => visibleKeys.has(c.key));
  const toggleColumn = (key: ColumnKey) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try { localStorage.setItem("customers.columns.v1", JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let req = supabase.from("user").select("*").order("created_at", { ascending: false });
      if (query) {
        req = req.or(
          `email.ilike.%${query}%,firstName.ilike.%${query}%,lastName.ilike.%${query}%,phone.ilike.%${query}%`
        );
      }
      const { data, error } = await req.limit(200);
      if (error) throw error;
      setRows((data as Customer[]) ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [query]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="grid gap-4">
      <div className="rounded-md border bg-white dark:bg-gray-950 p-4">
        <h1 className="text-xl font-semibold mb-4">Customers</h1>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, phone"
              className="rounded border px-3 py-2 text-sm w-72 bg-white dark:bg-gray-900"
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
                      <input type="checkbox" checked={visibleKeys.has(c.key)} onChange={() => toggleColumn(c.key)} />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 overflow-auto rounded border">
          <table className="min-w-[900px] w-full text-sm">
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
                <tr><td className="px-3 py-4 text-gray-500" colSpan={visibleColumns.length + 1}>No customers found.</td></tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-950 dark:even:bg-gray-900">
                    {visibleColumns.map((col) => (
                      <td key={col.key} className="px-3 py-2 border-b">{col.render(c)}</td>
                    ))}
                    <td className="px-3 py-2 border-b">
                      <button onClick={() => setSelected(c)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-xl bg-white dark:bg-gray-950 rounded-md shadow p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Customer</h2>
              <button onClick={() => setSelected(null)} className="rounded border px-2 py-1 text-xs">Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <Field label="First Name" value={selected.firstName} />
              <Field label="Last Name" value={selected.lastName} />
              <Field label="Email" value={selected.email} />
              <Field label="Phone" value={selected.phone} />
              <Field label="Role" value={selected.role} />
              <Field label="Active" value={String(selected.is_active ?? false)} />
              <Field label="Admin" value={String(selected.is_admin ?? false)} />
              <Field label="Address" value={selected.address} />
              <Field label="Referral Code" value={selected.referral_code} />
              <Field label="Referral Credits" value={selected.referral_credits} />
              <Field label="Created" value={selected.created_at ? new Date(selected.created_at).toLocaleString() : undefined} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return (
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

function exportCsv(rows: Customer[]) {
  const headers = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "role",
    "is_active",
    "is_admin",
    "created_at",
  ];
  const lines = [headers.join(",")].concat(
    rows.map((r) => [
      r.firstName ?? "",
      r.lastName ?? "",
      r.email,
      r.phone ?? "",
      r.role ?? "",
      String(r.is_active ?? false),
      String(r.is_admin ?? false),
      r.created_at ?? "",
    ].map(csvEscape).join(","))
  );
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `customers-${new Date().toISOString().slice(0,10)}.csv`;
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

