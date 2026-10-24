"use client";
import React from "react";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/types/database.types";
import heic2any from "heic2any";

type Item = Tables<"gallery_item">;

const BUCKET = "media";

export default function AdminMedia() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");

  const [catOptions, setCatOptions] = React.useState<string[]>([]);
  const [catLoading, setCatLoading] = React.useState(false);
  const [catError, setCatError] = React.useState<string | null>(null);

  const [uOpen, setUOpen] = React.useState(false);
  const [uFiles, setUFiles] = React.useState<FileList | null>(null);
  const [uCategory, setUCategory] = React.useState<string>("");
  const [uTitlePrefix, setUTitlePrefix] = React.useState<string>("");
  const [uSaving, setUSaving] = React.useState(false);
  const [uError, setUError] = React.useState<string | null>(null);
  const [uBeforeId, setUBeforeId] = React.useState<string>("");
  const [uBeforeFilter, setUBeforeFilter] = React.useState<string>("");

  const [selected, setSelected] = React.useState<Item | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [featuringId, setFeaturingId] = React.useState<string | null>(null);

  const fetchCategories = React.useCallback(async () => {
    setCatLoading(true);
    setCatError(null);
    try {
      const { data, error } = await supabase.rpc("get_service_categories");
      if (error) throw error;
      setCatOptions(Array.isArray(data) ? (data as string[]) : []);
    } catch (e: unknown) {
      setCatError(e instanceof Error ? e.message : "Failed to load categories");
      setCatOptions([]);
    } finally {
      setCatLoading(false);
    }
  }, []);

  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let req = supabase
        .from("gallery_item")
        .select("id,title,category,description,file_path,file_type,location,project_type,completion_date,created_at,before_image_id,is_before_after,is_featured")
        .order("created_at", { ascending: false });
      if (q) {
        req = req.or(
          `title.ilike.%${q}%,category.ilike.%${q}%,description.ilike.%${q}%,project_type.ilike.%${q}%`
        );
      }
      const { data, error } = await req.limit(500);
      if (error) throw error;
      setItems((data as Item[]) ?? []);
    } catch (e: any) {
      setError(e?.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [q]);

  React.useEffect(() => { fetchCategories(); }, [fetchCategories]);
  React.useEffect(() => { fetchItems(); }, [fetchItems]);

  const maybeConvertHeic = React.useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isHeicExt = ext === "heic" || ext === "heif";
    const isHeicMime = /image\/hei[cf]/i.test(file.type || "");
    if (!isHeicExt && !isHeicMime) {
      return { converted: false, outFile: file, outExt: ext || "jpg", outMime: file.type || "image/jpeg" };
    }
    try {
      const blob = (await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 })) as Blob;
      const base = file.name.replace(/\.[^/.]+$/, "");
      const outFile = new File([blob], `${base}.jpg`, { type: "image/jpeg" });
      return { converted: true, outFile, outExt: "jpg", outMime: "image/jpeg" };
    } catch (e) {
      // If conversion fails, surface an error upstream
      throw new Error("Failed to convert HEIC to JPEG. Please try another image or convert locally.");
    }
  }, []);

  const onUpload = async () => {
    if (!uFiles || uFiles.length === 0) return;
    setUSaving(true);
    setUError(null);
    try {
      const datePrefix = new Date().toISOString().slice(0, 10);
      for (let i = 0; i < uFiles.length; i++) {
        const original = uFiles[i];
        const nameNoExt = original.name.replace(/\.[^/.]+$/, "");
        const { outFile, outExt, outMime } = await maybeConvertHeic(original);
        const key = `admin/${datePrefix}/${crypto.randomUUID()}.${outExt}`;

        const up = await supabase.storage.from(BUCKET).upload(key, outFile, { upsert: false, contentType: outMime });
        if (up.error) throw up.error;

        const title = (uTitlePrefix ? `${uTitlePrefix} ` : "") + nameNoExt;
        const insert = await supabase.from("gallery_item").insert({
          title,
          category: uCategory || catOptions[0] || "",
          file_path: key,
          file_type: outMime || "image/jpeg",
          before_image_id: uBeforeId || null,
        }).select("*").single();
        if (insert.error) throw insert.error;
      }
      setUFiles(null);
      setUCategory("");
      setUTitlePrefix("");
      setUOpen(false);
      setUBeforeId("");
      setUBeforeFilter("");
      await fetchItems();
    } catch (e: any) {
      setUError(e?.message || "Upload failed");
    } finally {
      setUSaving(false);
    }
  };

  const saveSelected = async (rec: Item) => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload: Partial<Item> = {
        title: rec.title,
        description: rec.description,
        category: rec.category,
        location: rec.location,
        project_type: rec.project_type,
        completion_date: rec.completion_date,
        is_featured: rec.is_featured,
        is_before_after: rec.is_before_after,
        before_image_id: rec.before_image_id,
      };
      const { error } = await supabase.from("gallery_item").update(payload).eq("id", rec.id);
      if (error) throw error;
      setSelected(null);
      await fetchItems();
    } catch (e: any) {
      setSaveError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (rec: Item) => {
    if (!confirm("Delete this media item?")) return;
    try {
      // delete storage file best-effort
      if (rec.file_path) {
        await supabase.storage.from(BUCKET).remove([rec.file_path]);
      }
      const { error } = await supabase.from("gallery_item").delete().eq("id", rec.id);
      if (error) throw error;
      await fetchItems();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    }
  };

  const toggleFeatured = async (rec: Item) => {
    try {
      setFeaturingId(rec.id);
      const next = !Boolean(rec.is_featured);
      const { error } = await supabase
        .from("gallery_item")
        .update({ is_featured: next })
        .eq("id", rec.id);
      if (error) throw error;
      setItems((prev) => prev.map((it) => (it.id === rec.id ? { ...it, is_featured: next } : it)));
    } catch (e: any) {
      alert(e?.message || "Failed to update featured state");
    } finally {
      setFeaturingId(null);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="rounded-md border bg-white dark:bg-gray-950 p-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-semibold">Media</h1>
          <button onClick={() => setUOpen(true)} className="rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Upload</button>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, category, description"
            className="rounded border px-3 py-2 text-sm w-96 bg-white dark:bg-gray-900"
          />
          <button onClick={fetchItems} className="rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Apply</button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500">No media yet.</p>
          ) : (
            items.map((it) => {
              const isVideo = /^video\//i.test(it.file_type);
              const url = getPublicUrl(it.file_path);
              return (
                <div key={it.id} className="rounded border overflow-hidden bg-gray-50 dark:bg-gray-900">
                  <div className="relative aspect-video bg-black">
                    {isVideo ? (
                      <video src={url} className="w-full h-full object-cover" muted playsInline />
                    ) : (
                      <img src={url} alt={it.title || ""} className="w-full h-full object-cover" />
                    )}
                    {Boolean(it.is_featured) && (
                      <span className="absolute top-2 left-2 text-[10px] uppercase bg-yellow-400 text-black px-2 py-0.5 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-3 text-sm">
                    <div className="font-medium line-clamp-1">{it.title}</div>
                    <div className="text-gray-500 line-clamp-1">{it.category}</div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => toggleFeatured(it)}
                        disabled={featuringId === it.id}
                        className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
                      >
                        {Boolean(it.is_featured) ? "Unfeature" : "Feature"}
                      </button>
                      <button onClick={() => setSelected(it)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800">Edit</button>
                      <button onClick={() => removeItem(it)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Upload modal */}
      {uOpen ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setUOpen(false)}>
          <div className="w-full max-w-2xl bg-white dark:bg-gray-950 rounded-md shadow p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Upload Media</h2>
              <button onClick={() => setUOpen(false)} className="rounded border px-2 py-1 text-xs">Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Files</div>
                <input type="file" multiple onChange={(e) => setUFiles(e.target.files)} className="mt-1" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Category</div>
                <select
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  value={uCategory}
                  onChange={(e) => setUCategory(e.target.value)}
                >
                  <option value="">{catLoading ? "Loading…" : "Select…"}</option>
                  {catError ? (
                    <option value="" disabled>{catError}</option>
                  ) : (
                    catOptions.map((c) => <option key={c} value={c}>{c}</option>)
                  )}
                </select>
              </div>
              <div>
                <div className="text-xs text-gray-500">Title prefix (optional)</div>
                <input
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  value={uTitlePrefix}
                  onChange={(e) => setUTitlePrefix(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Link to Before Image (optional)</div>
                <div className="mt-1 flex gap-2">
                  <input
                    className="rounded border px-2 py-1 w-1/2 bg-white dark:bg-gray-900"
                    placeholder="Search existing media by title"
                    value={uBeforeFilter}
                    onChange={(e) => setUBeforeFilter(e.target.value)}
                  />
                  <select
                    className="rounded border px-2 py-1 flex-1 bg-white dark:bg-gray-900"
                    value={uBeforeId}
                    onChange={(e) => setUBeforeId(e.target.value)}
                  >
                    <option value="">None</option>
                    {items
                      .filter((it) =>
                        uBeforeFilter ? (it.title || "").toLowerCase().includes(uBeforeFilter.toLowerCase()) : true
                      )
                      .map((it) => (
                        <option key={it.id} value={it.id}>
                          {(it.title || "Untitled").slice(0, 60)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
            {uError && <p className="text-sm text-red-600 mt-3">{uError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onUpload} disabled={uSaving || !uFiles || uFiles.length === 0} className="rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60">{uSaving ? "Uploading…" : "Upload"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit modal */}
      {selected ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl bg-white dark:bg-gray-950 rounded-md shadow p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Edit Media</h2>
              <button onClick={() => setSelected(null)} className="rounded border px-2 py-1 text-xs">Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Title</div>
                <input className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900" value={selected.title || ""} onChange={(e) => setSelected({ ...selected, title: e.target.value })} />
              </div>
              <div>
                <div className="text-xs text-gray-500">Category</div>
                <select
                  className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900"
                  value={selected.category || ""}
                  onChange={(e) => setSelected({ ...selected, category: e.target.value })}
                >
                  <option value="">{catLoading ? "Loading…" : "Select…"}</option>
                  {catError ? (
                    <option value="" disabled>{catError}</option>
                  ) : (
                    catOptions.map((c) => <option key={c} value={c}>{c}</option>)
                  )}
                </select>
              </div>
              <div>
                <div className="text-xs text-gray-500">Project Type</div>
                <input className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900" value={selected.project_type || ""} onChange={(e) => setSelected({ ...selected, project_type: e.target.value })} />
              </div>
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <input className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900" value={selected.location || ""} onChange={(e) => setSelected({ ...selected, location: e.target.value })} />
              </div>
              <div>
                <div className="text-xs text-gray-500">Completed</div>
                <input type="date" className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900" value={selected.completion_date ? selected.completion_date.slice(0,10) : ""} onChange={(e) => setSelected({ ...selected, completion_date: e.target.value || null })} />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Description</div>
                <textarea rows={3} className="mt-1 rounded border px-2 py-1 w-full bg-white dark:bg-gray-900" value={selected.description || ""} onChange={(e) => setSelected({ ...selected, description: e.target.value })} />
              </div>
              <div>
                <label className="inline-flex items-center gap-2 text-xs"><input type="checkbox" checked={Boolean(selected.is_featured)} onChange={(e) => setSelected({ ...selected, is_featured: e.target.checked })} /> Featured</label>
              </div>
              <div>
                <label className="inline-flex items-center gap-2 text-xs"><input type="checkbox" checked={Boolean(selected.is_before_after)} onChange={(e) => setSelected({ ...selected, is_before_after: e.target.checked })} /> Before/After set</label>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Link to Before Image (optional)</div>
                <div className="mt-1 flex gap-2">
                  <input
                    className="rounded border px-2 py-1 w-1/2 bg-white dark:bg-gray-900"
                    placeholder="Search existing media by title"
                    value={(selected && selected.title && "") as string}
                    onChange={() => { /* no-op, search not stored per-row here */ }}
                    style={{ display: "none" }}
                  />
                  <select
                    className="rounded border px-2 py-1 flex-1 bg-white dark:bg-gray-900"
                    value={selected.before_image_id || ""}
                    onChange={(e) => setSelected({ ...selected, before_image_id: e.target.value || null })}
                  >
                    <option value="">None</option>
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {(it.title || "Untitled").slice(0, 60)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {saveError && <p className="text-sm text-red-600 mt-3">{saveError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => saveSelected(selected)} disabled={saving} className="rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60">{saving ? "Saving…" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getPublicUrl(path: string | null): string {
  if (!path) return "";
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}


