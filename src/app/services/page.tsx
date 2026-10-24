// src/app/services/page.tsx
import { Suspense } from "react";
import ServicesPageClient from "./ServicesPageClient";

export default function ServicesPage() {
  return (
    <Suspense fallback={<div>Loading services...</div>}>
      <ServicesPageClient />
    </Suspense>
  );
}