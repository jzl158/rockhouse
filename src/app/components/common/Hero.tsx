"use client";
import { Button, Link } from "@heroui/react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative flex h-[600px] flex-col items-center justify-center bg-gray-100 py-20 text-center">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="/landscape1.jpg"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Foreground content */}
      <div className="relative z-10 px-4">
        <motion.h1
          className="mb-4 text-5xl font-bold uppercase text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          FULL SERVICE LANDSCAPING <br /> AND CONSTRUCTION
        </motion.h1>

        <motion.p
          className="mb-8 text-xl text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          Transform your outdoor space with our landscaping and construction
          services. <br /> From design to installation, we bring your vision to
          life.
        </motion.p>

        <motion.div
          className="flex justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
        >
          <Button
            as={Link}
            href="/contact?type=quote"
            className="text-white border-2 border-white rounded-full"
          >
            Get a Free Quote
          </Button>
          <Button
            as={Link}
            href="/services"
            className="text-white border-2 border-white rounded-full"
          >
            Explore Our Services
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
