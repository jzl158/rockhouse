// src/app/services/ServicesPageClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import ServiceGrid from "@/app/components/servicepage/serviceGrid";
import type { Service } from "@/app/components/servicepage/serviceCard";
import { Tabs, Tab, Button, Link } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

const normalize = (s: string) => s.toLowerCase().trim();

const TAB_KEYS = {
  ALL: "all",
  CONSTRUCTION: "construction",
  LANDSCAPING: "landscaping",
  MAINTENANCE: "maintenance", // handles misspellings via normalize()
} as const;

export default function ServicesPageClient() {
    const searchParams = useSearchParams();
    const [services, setServices] = useState<Service[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<string>(() => {
      const k = normalize(searchParams.get("tab") ?? TAB_KEYS.ALL);
      return [TAB_KEYS.ALL, TAB_KEYS.CONSTRUCTION, TAB_KEYS.LANDSCAPING, TAB_KEYS.MAINTENANCE].includes(k as any)
        ? k
        : TAB_KEYS.ALL;
    });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("service")
        .select("*")
        .order("id", { ascending: false });
      if (!mounted) return;
      if (error) setError(error.message);
      else setServices(data ?? []);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (selected === TAB_KEYS.ALL) return services;
    return services.filter((s) =>
      (s.category ?? []).some((c) => normalize(c) === selected)
    );
  }, [services, selected]);

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
              Our Services
            </h1>
          </motion.div>
          <motion.p 
            className="mt-4 text-xl text-gray-600 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            From landscape design to construction and maintenance, we provide comprehensive solutions for your outdoor spaces.
          </motion.p>
        </div>
      </section>

      {/* Services Content */}
      <section className="pt-8 pb-16 px-6 bg-white">
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

          <motion.div 
            className="mb-12 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs
              selectedKey={selected}
              onSelectionChange={(key) => setSelected(String(key))}
              variant="underlined"
              aria-label="Service categories"
              classNames={{
                panel: "hidden",
                tabList: "justify-center gap-8",
                tab: "text-lg font-medium text-gray-600 hover:text-[#255756] data-[selected=true]:text-[#255756] data-[selected=true]:border-[#F7D566]",
              }}
            >
              <Tab key={TAB_KEYS.ALL} title="All Services" />
              <Tab key={TAB_KEYS.CONSTRUCTION} title="Construction" />
              <Tab key={TAB_KEYS.LANDSCAPING} title="Landscaping" />
              <Tab key={TAB_KEYS.MAINTENANCE} title="Maintenance" />
            </Tabs>
          </motion.div>

          <ServiceGrid services={filtered} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-[#255756]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl font-bold text-white mb-6 uppercase"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Transform Your Space?
          </motion.h2>
          <motion.p 
            className="text-white/80 mb-8 max-w-2xl mx-auto font-bold text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Get in touch with our team to discuss your project and receive a customized quote.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button
              as={Link}
              href="/contact"
              className="bg-[#F7D566] text-[#255756] hover:bg-white px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2"
            >
              Request a Quote <FaArrowRight />
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}