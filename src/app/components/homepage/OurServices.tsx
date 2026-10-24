// src/components/homepage/ServicesSection.tsx
"use client";

import { Card, CardHeader, CardBody, Button, Link } from "@heroui/react";
import { ReactNode } from "react";
import { FaHammer, FaLeaf, FaCut } from "react-icons/fa";
import { motion } from "motion/react";

type Service = {
  title: string;
  description: string;
  icon: ReactNode;
  bg: string;
  tall?: boolean;
  slink: string;
  cta: string;
  badge?: ReactNode;
};

const services: Service[] = [
  {
    title: "Landscaping",
    description:
      "Design and install custom landscapes including flower beds, stone borders, trees, and outdoor lighting tailored to your property.",
    icon: <FaLeaf className="text-3xl text-white" />,
    bg: "bg-[#3B8D6D]",
    slink: "/services?tab=landscaping",
    cta: "See Design Ideas",
  },
  {
    title: "Construction",
    description:
      "Build durable outdoor features including driveways, retaining walls, fencing, decks, and custom structures.",
    icon: <FaHammer className="text-3xl text-white" />,
    bg: "bg-[#205A57]",
    tall: true,
    slink: "/services?tab=construction",
    cta: "View Past Projects",
    badge: (
      <div className="text-xs uppercase tracking-wider bg-white text-gray-800 px-2 py-1 rounded-full w-max mx-auto mb-2">
        Most Requested
      </div>
    ),
  },
  {
    title: "Lawn Care",
    description:
      "Keep your yard healthy and polished with regular mowing, edging, seasonal cleanup, and lawn treatments.",
    icon: <FaCut className="text-3xl text-white" />,
    bg: "bg-[#3B8D6D]",
    slink: "/services?tab=maintenance",
    cta: "Request a Lawn Plan",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto mb-12">
        <h2 className="text-4xl font-bold text-[#255756] uppercase inline-block border-b-4 border-[#F7D566] pb-2">What We Offer</h2>
        <p className="text-gray-600 mt-4 max-w-2xl">Custom landscaping, construction, and lawn care solutions tailored to your property.</p>
      </div>

      <motion.div
        className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 items-start max-w-6xl mx-auto"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.15 }}
      >
        {services.map((s, i) => {
          const variants =
            i === 0
              ? { hidden: { opacity: 0, x: -50 }, show: { opacity: 1, x: 0 } }
              : i === 1
              ? { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }
              : { hidden: { opacity: 0, x: 50 }, show: { opacity: 1, x: 0 } };

          return (
            <motion.div
              key={i}
              variants={variants}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={s.tall ? "" : "md:self-center"}
            >
              <Card
                shadow="none"
                className={[
                  s.bg,
                  "text-white rounded-sm",
                  "transition-all duration-300",
                  "hover:scale-105 hover:shadow-lg hover:brightness-110",
                  s.tall ? "md:h-116 h-80" : "md:h-90 h-72",
                ].join(" ")}
              >
                {/* Added pb-8 to push button away from card bottom */}
                <CardBody className="pt-18 pb-18 pl-4 pr-4">
                  <div className="flex h-full items-center">
                    <div className="w-full text-center">
                      <div className="mb-3 flex justify-center">{s.icon}</div>
                      
                      {s.badge && s.badge}

                      <CardHeader className="text-lg font-semibold uppercase mb-2 flex w-full justify-center text-center">
                        {s.title}
                      </CardHeader>

                      <p className="text-sm leading-relaxed mb-6">{s.description}</p>

                      {/* Added mt-6 to push button down from paragraph */}
                      <Button
                        as={Link}
                        href={s.slink}
                        className="mt-6 text-white border-2 border-white rounded-full mb-6"
                      >
                        {s.cta}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
