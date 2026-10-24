// app/supabase-test/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";       

export default function SupabaseTestPage() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      const { data, error } = await supabase.from("service").select("*").limit(5);
      if (error) setError(error.message);
      else setRows(data);
    }
    run();
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Supabase Test</h1>
      {error && <pre className="text-red-600">{error}</pre>}
      {rows && <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(rows, null, 2)}</pre>}
      {!rows && !error && <p>Loading…</p>}
    </main>
  );
}
