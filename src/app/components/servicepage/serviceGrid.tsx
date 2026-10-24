// src/components/servicepage/serviceGrid.tsx
"use client";

import ServiceCard, { Service } from "@/app/components/servicepage/serviceCard";

export default function ServiceGrid({ services }: { services: Service[] }) {
  if (!services || services.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        No services found.
      </div>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
      {services.map((s) => (
        <div key={s.id} className="h-full">
          <ServiceCard service={s} />
        </div>
      ))}
    </div>
  );
}
