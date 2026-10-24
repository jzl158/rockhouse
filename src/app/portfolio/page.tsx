"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/types/database.types";
import { motion } from "framer-motion";

type GalleryRow = Tables<"gallery_item">;

type GalleryItem = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  location: string | null;
  project_type: string | null;
  completion_date: string | null;
  created_at: string | null;
  file_type: string;
  image: string;
  is_featured: boolean | null;
};

const BUCKET = "media";

// Remove leading bucket/folder prefixes so we can call getPublicUrl with a clean path
const normalizePath = (p: string) =>
  (p ?? "")
    .replace(/^https?:\/\/.*/i, "") // leave full URLs untouched (handled separately)
    .replace(/^\/?media\//i, "")
    .replace(/^\/?public\//i, "")
    .replace(/^\/+/, "");

export default function PortfolioPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  const hasItems = useMemo(() => items.length > 0, [items.length]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // First, try to get featured images
      const { data: featuredData, error: featuredError } = await supabase
        .from("gallery_item")
        .select(
          "id,title,category,description,file_path,file_type,project_type,location,completion_date,created_at,is_featured"
        )
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (!mounted) return;
      
      let data = featuredData;
      let error = featuredError;
      
      // If no featured images or error, fall back to all images
      if (featuredError || !featuredData || featuredData.length === 0) {
        const { data: allData, error: allError } = await supabase
          .from("gallery_item")
          .select(
            "id,title,category,description,file_path,file_type,project_type,location,completion_date,created_at,is_featured"
          )
          .order("created_at", { ascending: false });
        
        data = allData;
        error = allError;
      }

      if (!mounted) return;
      if (error) {
        setError(error.message);
        return;
      }

      const rows = (data ?? []) as GalleryRow[];
      const mapped: GalleryItem[] = rows.map((row) => {
        const raw = row.file_path ?? "";
        let imageUrl = raw;
        if (raw && !/^https?:\/\//i.test(raw)) {
          const clean = normalizePath(raw);
          const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(clean);
          imageUrl = pub.publicUrl;
        }
        return {
          id: row.id,
          title: row.title,
          category: row.category ?? null,
          description: row.description ?? null,
          location: row.location ?? null,
          project_type: row.project_type ?? null,
          completion_date: row.completion_date ?? null,
          created_at: row.created_at ?? null,
          file_type: row.file_type,
          image: imageUrl,
          is_featured: row.is_featured ?? null,
        };
      });

      setItems(mapped);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    if (selected) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <main className="min-h-screen">
      {/* Header Section */}
      <section className="pb-4 pt-8 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold uppercase text-[#255756] inline-block border-b-4 border-[#F7D566] pb-2">
              Portfolio
            </h1>
          </motion.div>
          <motion.p 
            className="mt-4 text-xl text-gray-600 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Explore our completed projects and see how we transform outdoor spaces into beautiful, functional environments.
          </motion.p>
        </div>
      </section>

      {/* Portfolio Content */}
      <section className="pt-8 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {error && (
            <motion.p 
              className="text-red-600 mb-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          {hasItems ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto pr-1">
            {items.map((item) => {
              const isVideo = /^video\//i.test(item.file_type);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className="group relative text-left focus:outline-none"
                >
                  <div className="relative w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                    {isVideo ? (
                      <video
                        src={item.image}
                        className="w-full h-52 object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="text-white text-sm font-semibold line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-white/80 text-xs mt-1 line-clamp-1">
                        {item.category || "Gallery"}
                        {item.location ? ` • ${item.location}` : ""}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          ) : (
            <p className="text-sm text-gray-500 text-center">No images yet.</p>
          )}
        </div>
      </section>

      {selected ? (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-md shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gray-100">
              {/^video\//i.test(selected.file_type) ? (
                <video
                  src={selected.image}
                  className="w-full max-h-[65vh] object-contain bg-black"
                  controls
                  playsInline
                />
              ) : (
                <img
                  src={selected.image}
                  alt={selected.title}
                  className="w-full max-h-[65vh] object-contain bg-black"
                />
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 inline-flex items-center justify-center rounded-md bg-white/90 hover:bg-white px-3 py-1 text-sm font-medium shadow"
              >
                Close
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selected.title}
                </h2>
                {selected.description ? (
                  <p className="mt-2 text-gray-700 leading-relaxed">
                    {selected.description}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1 text-sm text-gray-700">
                <Detail label="Category" value={selected.category || "Gallery"} />
                <Detail label="Project Type" value={selected.project_type} />
                <Detail label="Location" value={selected.location} />
                <Detail
                  label="Completed"
                  value={
                    selected.completion_date
                      ? new Date(selected.completion_date).toLocaleDateString()
                      : selected.created_at
                      ? new Date(selected.created_at).toLocaleDateString()
                      : undefined
                  }
                />
                <Detail label="File Type" value={selected.file_type} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <p>
      <span className="text-gray-500">{label}:</span> {value}
    </p>
  );
}