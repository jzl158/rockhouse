"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Hero from "./components/common/Hero";
import Services from "./components/homepage/OurServices";
import PortfolioCarousel from "./components/common/PortfolioCarousel";
import Faq from "./components/common/Faq";
import ScrollingText from "./components/common/ScollingText";
import { supabase } from "@/lib/supabase/client";
import SignUp from "./components/common/SignUp";
import { Button, Link } from "@heroui/react";
import { motion, useInView, useAnimation } from "framer-motion";
import { useRef } from "react";
import AnimatedStats from "./components/homepage/AnimatedStats";
import WhyChooseUsCard from "./components/homepage/WhyChooseUsCard";
import TestimonialCard from "./components/homepage/TestimonialCard";
import AnimatedCheckItem from "./components/homepage/AnimatedCheckItem";
import ProjectManagementFeature from "./components/homepage/ProjectManagementFeature";
import {
  FaCalendarAlt,
  FaClipboardList,
  FaHistory,
  FaComments,
  FaUpload,
  FaPencilRuler,
  FaProjectDiagram,
  FaMapMarkerAlt,
  FaHeadset,
  FaCheckCircle,
  FaArrowRight,
  FaArrowDown,
} from "react-icons/fa";

type CarouselItem = {
  image: string;
  title: string;
  category: string;
  categoryColor: string;
  is_featured?: boolean;
};

const BUCKET = "media";
const DEFAULT_BG_URL = "/landscape1.jpg";

const categoryColors: Record<string, string> = {
  landscaping: "#3B8D6D",
  construction: "#205A57",
  "lawn care": "#3B8D6D",
  default: "#205A57",
};

// Remove leading bucket/folder prefixes so we can call getPublicUrl with a clean path
const normalizePath = (p: string) =>
  (p ?? "")
    .replace(/^https?:\/\/.*/i, "") // leave full URLs untouched (handled separately)
    .replace(/^\/?media\//i, "")
    .replace(/^\/?public\//i, "")
    .replace(/^\/+/, "");

export default function HomePage() {
  // Initialize with fallback items to ensure carousel always has content
  const fallbackItemsDefault: CarouselItem[] = [
    {
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop",
      title: "Professional Landscaping",
      category: "Hardscape",
      categoryColor: categoryColors.hardscape ?? categoryColors.default,
    },
    {
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop",
      title: "Garden Design",
      category: "Planting",
      categoryColor: categoryColors.planting ?? categoryColors.default,
    },
    {
      image: "https://images.unsplash.com/photo-1585759071054-7de2db962a20?w=800&h=400&fit=crop",
      title: "Maintenance Services",
      category: "Maintenance",
      categoryColor: categoryColors.maintenance ?? categoryColors.default,
    }
  ];

  const [items, setItems] = useState<CarouselItem[]>(fallbackItemsDefault);
  const [error, setError] = useState<string | null>(null);
  const [bgUrl, setBgUrl] = useState<string>(DEFAULT_BG_URL);

  useEffect(() => {
    let mounted = true;

    // Use the same fallback items defined above

    (async () => {
      let data: any[] = [];
      
      try {
        // First, try to get featured images
        const featuredResult = await supabase
          .from("gallery_item")
          .select("title, category, file_path, created_at, is_featured")
          .eq("is_featured", true)
          .order("created_at", { ascending: false })
          .returns<{ title: string; category: string; file_path: string; created_at: string; is_featured: boolean }[]>();

        if (!mounted) return;
        
        if (featuredResult.error) {
          setError(featuredResult.error.message);
          setItems(fallbackItemsDefault);
          return;
        }
        
        data = featuredResult.data ?? [];
        
        // If no featured images, fall back to recent images from admin folder
        if (data.length === 0) {
          const fallbackResult = await supabase
            .from("gallery_item")
            .select("title, category, file_path, created_at, is_featured")
            .like("file_path", "admin/%")
            .order("created_at", { ascending: false, nullsFirst: true })
            .limit(10)
            .returns<{ title: string; category: string; file_path: string; created_at: string; is_featured: boolean }[]>();
          
          if (!mounted) return;
          
          if (fallbackResult.error) {
            setError(fallbackResult.error.message);
            setItems(fallbackItemsDefault);
            return;
          }
          
          data = fallbackResult.data ?? [];
        }
      } catch (err) {
        if (!mounted) return;
        setItems(fallbackItemsDefault);
        return;
      }

      const rows = data;
      const mapped: CarouselItem[] = rows.map((row) => {
        const raw = row.file_path ?? "";
        // If it's already an absolute URL, use it; otherwise build a public URL from storage
        let imageUrl = raw;
        if (raw && !/^https?:\/\//i.test(raw)) {
          const clean = normalizePath(raw);
          const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(clean);
          imageUrl = pub.publicUrl;
        }

        const cat = (row.category ?? "").toLowerCase();
        return {
          image: imageUrl,
          title: row.title,
          category: row.category ?? "Gallery",
          categoryColor: categoryColors[cat] ?? categoryColors.default,
          is_featured: row.is_featured,
        };
      });

      // If no gallery items found, use fallback images
      if (mapped.length === 0) {
        setItems(fallbackItemsDefault);
      } else {
        setItems(mapped);
      }

      // Try to locate IMG_7187 in file_path and build a public URL for background
      const match = rows.find((r) => (r.file_path || "").toLowerCase().includes("img_7187"));
      if (match) {
        const rawBg = match.file_path || "";
        let url = rawBg;
        if (rawBg && !/^https?:\/\//i.test(rawBg)) {
          const clean = normalizePath(rawBg);
          const { data: pub2 } = supabase.storage.from(BUCKET).getPublicUrl(clean);
          url = pub2.publicUrl;
        }
        setBgUrl(url);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Script
        src="https://beta.leadconnectorhq.com/loader.js"
        data-resources-url="https://beta.leadconnectorhq.com/chat-widget/loader.js"
        data-widget-id="6a29dc516974a3bec56bfefa"
        strategy="afterInteractive"
      />
      <Hero />
      <Services />

      <section className="py-20 px-6 bg-[#F7D566]">
        <div className="relative mx-auto max-w-6xl">
          <motion.div 
            className="flex justify-end mb-12"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2 
              className="text-4xl font-bold text-[#255756] uppercase inline-block border-b-4 border-white pb-2"
              initial={{ width: 0 }}
              whileInView={{ width: "auto" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              See Our Work
            </motion.h2>
          </motion.div>
          
          {/* First child: Carousel */}
          <motion.div 
            className="md:w-4/5 mt-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
            {items.length > 0 ? (
              <motion.div 
                className="transform scale-110"
                initial={{ scale: 1 }}
                whileInView={{ scale: 1.1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <PortfolioCarousel items={items} />
              </motion.div>
            ) : (
              <p className="text-sm text-gray-500 text-center">No images yet.</p>
            )}
          </motion.div>

          {/* Second child: Overlapping content card */}
          <motion.div 
            className="w-full md:max-w-lg md:absolute md:right-4 md:top-[60%] md:-translate-y-1/2 md:z-10 mt-6 md:mt-0"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <motion.div 
              className="bg-[#255756] text-white rounded-sm shadow-lg p-6 sm:p-8"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.h3 
                className="text-2xl font-semibold text-[#F7D566]"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Let us bring your vision to life
              </motion.h3>
              <motion.p 
                className="mt-3 leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                Request a quote or view our work. We handle site prep, hardscapes, plantings, and maintenance.
              </motion.p>
              <motion.div 
                className="mt-5 flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  <Link href="/portfolio" className="inline-flex items-center justify-center rounded-md border border-white px-4 py-2 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7DBD07]">
                    View Portfolio
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  <Link href="/about" className="inline-flex items-center justify-center rounded-md border border-white px-4 py-2 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7DBD07]">
                    About Us
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  <Link href="/contact" className="inline-flex items-center justify-center rounded-md border border-white px-4 py-2 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7DBD07]">
                    Get Quote <FaArrowRight className="ml-2" />
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>


      <section className="py-20 px-6 bg-[#418F6D]">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-10 uppercase text-white inline-block border-b-4 border-[#F7D566] pb-2"
          >
            Why Choose Us
          </motion.h2>
          <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
            <WhyChooseUsCard Icon={FaPencilRuler} title="Custom Design Solutions" index={0} />
            <WhyChooseUsCard Icon={FaProjectDiagram} title="Full-Service Project Management" index={1} />
            <WhyChooseUsCard Icon={FaMapMarkerAlt} title="Atlanta Metro Area" index={2} />
            <WhyChooseUsCard Icon={FaHeadset} title="Responsive Customer Support" index={3} />
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedStats />
        </div>
      </section>

      <section 
        className="py-20 px-6 relative"
        style={{
          backgroundImage: `url(${supabase.storage.from('media').getPublicUrl('admin/2025-08-17/2d9100f3-890c-4b8c-9810-bdc7177fc905.jpg').data.publicUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/60" aria-hidden="true"></div>
        <div className="relative max-w-6xl mx-auto text-right">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-white uppercase inline-block border-b-4 border-[#F7D566] pb-2 mb-16"
          >
            What Our Customers Say
          </motion.h2>
          
          <div className="grid gap-8 md:grid-cols-3 justify-end">
            <TestimonialCard
              initial="J"
              name="John D."
              location="Atlanta, GA"
              testimonial="The team transformed our backyard into an absolute oasis. Their attention to detail and professionalism exceeded our expectations."
              index={0}
            />
            <TestimonialCard
              initial="S"
              name="Sarah M."
              location="Marietta, GA"
              testimonial="From design to execution, they handled everything perfectly. Our new retaining wall and patio have completely changed how we use our outdoor space."
              index={1}
            />
            <TestimonialCard
              initial="R"
              name="Robert K."
              location="Roswell, GA"
              testimonial="Their lawn care service is exceptional. Consistent, reliable, and they always go the extra mile to ensure everything looks perfect."
              index={2}
            />
          </div>
        </div>
      </section>

      <div className="py-16 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold uppercase text-[#255756] inline-block border-b-4 border-[#F7D566] pb-2"
        >
          Ways to Get Started
        </motion.h2>
      </div>

      <div className="grid grid-cols-1">
        <div className="grid md:grid-cols-2">
            {/* Left Column - Content */}
            <div className="px-6 md:px-12 lg:px-24 py-12 flex items-center">
              <div className="space-y-8 max-w-xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-4xl font-bold text-[#255756] mb-4 uppercase">
                    Schedule a Consultation
                  </h2>
                  <p className="text-lg text-gray-600">
                    Talk with our experts about your project in detail. We&apos;ll review your ideas, visit your site if needed, and create a plan tailored to your needs.
                  </p>
                </motion.div>
                
                <div className="space-y-6">
                  <AnimatedCheckItem
                    title="Personal Attention"
                    description="One-on-one meeting with our design experts"
                    index={0}
                  />
                  <AnimatedCheckItem
                    title="On-Site Assessment"
                    description="Detailed evaluation of your space and requirements"
                    index={1}
                  />
                  <AnimatedCheckItem
                    title="Custom Planning"
                    description="Tailored recommendations and project timeline"
                    index={2}
                  />
                </div>

                <div className="pt-4">
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-[#255756] rounded-lg hover:bg-[#418F6D] transition-colors duration-200"
                  >
                    Book Consultation
                    <FaArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="relative h-[600px]">
              <div 
                className="absolute inset-0 bg-cover"
                style={{
                  backgroundImage: `url(${supabase.storage.from('media').getPublicUrl('consultation.png').data.publicUrl})`,
                  backgroundPosition: "left center",
                  backgroundSize: "cover",
                }}
              />
            </div>
        </div>

        <div className="grid md:grid-cols-2">
            {/* Left Column - Image */}
            <div className="relative h-[600px]">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${supabase.storage.from('media').getPublicUrl('admin/2025-08-17/d179a9e8-151e-4474-b3ad-812d2e44fc12.jpg').data.publicUrl})`,
                  backgroundPosition: "center",
                }}
              />
            </div>

            {/* Right Column - Content */}
            <div className="px-6 md:px-12 lg:px-24 py-12 flex items-center">
              <div className="space-y-8 max-w-xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-4xl font-bold text-[#255756] mb-4 uppercase">
                    Get a Quick Quote
                  </h2>
                  <p className="text-lg text-gray-600">
                    If you already know what you want, share your project details and photos online to receive a fast estimate.
                  </p>
                </motion.div>
                
                <div className="space-y-6">
                  <AnimatedCheckItem
                    title="Fast Response"
                    description="Receive your estimate within 24-48 hours"
                    index={0}
                  />
                  <AnimatedCheckItem
                    title="Easy Process"
                    description="Upload photos and describe your project online"
                    index={1}
                  />
                  <AnimatedCheckItem
                    title="Detailed Pricing"
                    description="Get a comprehensive breakdown of costs"
                    index={2}
                  />
                </div>

                <div className="pt-4">
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-[#255756] rounded-lg hover:bg-[#418F6D] transition-colors duration-200"
                  >
                    Request Quote
                    <FaArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>
        </div>
      </div>

      <section className="py-16 px-6 bg-[#255756] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 items-start">
            <div>
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-center mb-4 uppercase text-white inline-block border-b-4 border-[#F7D566] pb-2"
            >
              Make Your Project Management Effortless
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center text-white/80 mb-12"
            >
              Create an account to unlock easy tools.
            </motion.p>
            <div className="grid gap-6 grid-cols-2">
              <ProjectManagementFeature
                Icon={FaCalendarAlt}
                title="Easy Booking"
                description="Schedule services in a few clicks."
                index={0}
              />
              <ProjectManagementFeature
                Icon={FaClipboardList}
                title="Track Service"
                description="Stay updated on project progress."
                index={1}
              />
              <ProjectManagementFeature
                Icon={FaHistory}
                title="Service History"
                description="View past work and invoices."
                index={2}
              />
              <ProjectManagementFeature
                Icon={FaComments}
                title="Direct Communication"
                description="Message our team anytime."
                index={3}
              />
            </div>

              
            </div>

            <div className="rounded-xl p-6 flex items-center justify-center min-h-[500px]">
              <SignUp />
            </div>
          </div>
        </div>
      </section>
      
    </>
  );
}