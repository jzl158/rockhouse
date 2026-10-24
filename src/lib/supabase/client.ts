// lib/supabase/client.ts
"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yjhismyabucftxodwyxg.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGlzbXlhYnVjZnR4b2R3eXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTM2MDAsImV4cCI6MjA2NTgyOTYwMH0.AgIkZ2o1BrnZSnVFRTAOmO6mcVHjHmfO3Bc7dnTWxf4'
);
