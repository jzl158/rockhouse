"use client";
import React from "react";
import { supabase } from "@/lib/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database.types";

type Service = Tables<"service">;
type ServiceInsert = TablesInsert<"service">;
type ServiceUpdate = TablesUpdate<"service">;

export default function AdminServices() {
  const [query, setQuery] = React.useState("");
  const [rows, setRows] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Service | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<{ name: string; description: string; base_price: string }>(
    { name: "", description: "", base_price: "" }
  );
  const [categoryOptions, setCategoryOptions] = React.useState<string[]>([]);
  const [categoryLoading, setCategoryLoading] = React.useState<boolean>(false);
  const [categoryError, setCategoryError] = React.useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [newCategory, setNewCategory] = React.useState("");
  const [addingCat, setAddingCat] = React.useState(false);
  const [addCatError, setAddCatError] = React.useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", base_price: "" });
    setSelectedCategories([]);
    setModalOpen(true);
  };

  const openEdit = (svc: Service) => {
    setEditing(svc);
    setForm({
      name: svc.name || "",
      description: svc.description || "",
      base_price: svc.base_price != null ? String(svc.base_price) : "",
    });
    setSelectedCategories([...(svc.category || [])]);
    setModalOpen(true);
  };

  // Fetch allowed categories from Supabase RPC (derived from DB CHECK constraint)
  const fetchCategories = React.useCallback(async () => {
    setCategoryLoading(true);
    setCategoryError(null);
    try {
      const { data, error } = await supabase.rpc("get_service_categories");
      if (error) throw error;
      const list = Array.isArray(data) ? (data as string[]) : [];
      setCategoryOptions(list);
    } catch (e: any) {
      setCategoryError(e?.message || "Failed to load categories");
      setCategoryOptions([]);
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const addNewCategory = async () => {
    const value = newCategory.trim();
    if (!value) {
      setAddCatError("Please enter a category");
      return;
    }
    setAddingCat(true);
    setAddCatError(null);
    try {
      const { error } = await supabase.rpc("add_service_category", { new_cat: value });
      if (error) throw error;
      await fetchCategories();
      setNewCategory("");
    } catch (e: any) {
      setAddCatError(e?.message || "Failed to add category");
    } finally {
      setAddingCat(false);
    }
  };

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let req = supabase.from("service").select("*").order("name", { ascending: true });
      if (query) {
        req = req.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }
      const { data, error } = await req.limit(500);
      if (error) throw error;
      const list = (data as Service[]) ?? [];
      setRows(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [query]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const onSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payloadBase: { name: string; description: string | null; base_price: number | null; category: string[] } = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        base_price: form.base_price === "" ? null : Number(form.base_price),
        category: selectedCategories,
      };
      if (!payloadBase.name) throw new Error("Name is required");

      if (editing) {
        const payload: ServiceUpdate = { ...payloadBase } as any;
        const { error } = await supabase.from("service").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const payload: ServiceInsert = { ...payloadBase } as any;
        const { error } = await supabase.from("service").insert(payload);
        if (error) throw error;
      }

      setModalOpen(false);
      await fetchData();
    } catch (e: any) {
      setSaveError(e?.message || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="rounded-md border bg-white dark:bg-gray-950 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Services</h1>
          <button onClick={openCreate} className="rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">New Service</button>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or description"
            className="rounded border px-3 py-2 text-sm w-80 bg-white dark:bg-gray-900"
          />
          <button onClick={fetchData} className="rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Apply</button>
        </div>

        <div className="mt-4 overflow-auto rounded border">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr className="text-left">
                {["Name", "Categories", "Base Price", "Description", "Actions"].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium border-b">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-3 py-4" colSpan={5}>Loading…</td></tr>
              ) : error ? (
                <tr><td className="px-3 py-4 text-red-600" colSpan={5}>{error}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="px-3 py-4 text-gray-500" colSpan={5}>No services found.</td></tr>
              ) : (
                rows.map((s) => (
                  <tr key={s.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-950 dark:even:bg-gray-900">
                    <td className="px-3 py-2 border-b">{s.name}</td>
                    <td className="px-3 py-2 border-b">{(s.category || []).join(", ")}</td>
                    <td className="px-3 py-2 border-b">{s.base_price != null ? `$${s.base_price.toFixed(2)}` : "—"}</td>
                    <td className="px-3 py-2 border-b">{s.description || "—"}</td>
                    <td className="px-3 py-2 border-b">
                      <button onClick={() => openEdit(s)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-xl bg-white dark:bg-gray-950 rounded-md shadow p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{editing ? "Edit Service" : "New Service"}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded border px-2 py-1 text-xs">Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Name</div>
                <input
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <div className="text-xs text-gray-500">Base Price</div>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  value={form.base_price}
                  onChange={(e) => setForm((f) => ({ ...f, base_price: e.target.value }))}
                />
              </div>
              <div>
                <div className="text-xs text-gray-500">Categories</div>
                <div className="mt-1 rounded border p-2 bg-white dark:bg-gray-900">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedCategories.length === 0 ? (
                      <span className="text-xs text-gray-500">None selected</span>
                    ) : (
                      selectedCategories.map((c) => (
                        <span key={c} className="inline-flex items-center gap-2 text-xs bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
                          {c}
                          <button type="button" onClick={() => setSelectedCategories((prev) => prev.filter((x) => x !== c))}>×</button>
                        </span>
                      ))
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <select
                      className="rounded border px-2 py-1 bg-white dark:bg-gray-900 w-44"
                      onChange={(e) => {
                        const v = e.target.value;
                        if (!v) return;
                        setSelectedCategories((prev) => (prev.includes(v) ? prev : [...prev, v]));
                        e.currentTarget.selectedIndex = 0;
                      }}
                    >
                      <option value="">{categoryLoading ? "Loading…" : "Add existing…"}</option>
                      {categoryError ? (
                        <option value="" disabled>{categoryError}</option>
                      ) : (
                        categoryOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))
                      )}
                    </select>
                    <input
                      className="rounded border px-2 py-1 bg-white dark:bg-gray-900 flex-1 min-w-0"
                      placeholder="New category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNewCategory(); } }}
                      disabled={addingCat}
                    />
                    <button
                      type="button"
                      onClick={addNewCategory}
                      disabled={addingCat || !newCategory.trim()}
                      className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
                    >
                      {addingCat ? "Adding…" : "Add"}
                    </button>
                  </div>
                  {addCatError && (<p className="text-xs text-red-600 mt-1">{addCatError}</p>)}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Description</div>
                <textarea
                  rows={4}
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>

            {saveError && <p className="text-sm text-red-600 mt-3">{saveError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onSave} disabled={saving} className="rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// removed old placeholder default export


