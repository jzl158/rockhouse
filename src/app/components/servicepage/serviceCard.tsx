// src/components/servicepage/ServiceCard.tsx
"use client";

import { Card, CardBody, CardHeader, Button, Link, Divider } from "@heroui/react";
import type { Database } from "@/types/database.types";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
export type Service = Database["public"]["Tables"]["service"]["Row"];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card
        shadow="none"
        className="group overflow-hidden rounded-lg border border-gray-200 hover:border-[#F7D566] hover:shadow-xl transition-all duration-300 bg-white h-full flex flex-col"
      >
        <CardBody className="p-6 flex flex-col flex-grow">
          <CardHeader className="p-0 mb-4">
            <motion.h3 
              className="text-xl font-bold tracking-tight text-[#255756]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {service.name}
            </motion.h3>
          </CardHeader>

          <Divider className="bg-gray-100" />

          {service.description && (
            <motion.p 
              className="mt-4 text-gray-600 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {service.description}
            </motion.p>
          )}

          {typeof service.base_price === "number" && (
            <motion.p 
              className="mt-4 text-lg"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-gray-500">Starting at:</span>{" "}
              <span className="font-bold text-[#255756]">{formatCurrency(service.base_price)}</span>
            </motion.p>
          )}

          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Button
              as={Link}
              href={`/contact?type=quote&serviceId=${service.id}`}
              className="bg-[#255756] text-white hover:bg-[#418F6D] transition-colors duration-200 rounded-lg px-6 py-2 inline-flex items-center gap-2"
            >
              Get a Quote <FaArrowRight className="text-sm" />
            </Button>
          </motion.div>
        </CardBody>
      </Card>
    </motion.div>
  );
}