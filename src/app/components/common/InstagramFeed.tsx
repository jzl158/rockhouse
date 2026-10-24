"use client";
import React from "react";

type InstagramItem = {
  imageUrl: string;
  postUrl: string;
};

export default function InstagramFeed({ username = "sauvagelandscapingllc" }: { username?: string }) {
  const [items, setItems] = React.useState<InstagramItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/instagram?username=${encodeURIComponent(username)}&count=6`, { cache: "no-store" });
        const data = await res.json();
        if (!mounted) return;
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch {
        if (!mounted) return;
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [username]);

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2 uppercase">From Instagram</h2>
        <p className="text-center text-gray-600 mb-8">@{username}</p>

        {loading ? (
          <p className="text-center text-sm text-gray-500">Loading feed…</p>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No recent posts available.</p>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            {items.map((it, idx) => (
              <a key={idx} href={it.postUrl} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="aspect-square overflow-hidden rounded-md bg-gray-100">
                  <img
                    src={it.imageUrl}
                    alt="Instagram post"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


