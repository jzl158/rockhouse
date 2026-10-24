"use client";

import { motion } from 'framer-motion';

interface TestimonialCardProps {
  initial: string;
  name: string;
  location: string;
  testimonial: string;
  index: number;
}

export default function TestimonialCard({ initial, name, location, testimonial, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-sm p-8 shadow-lg text-center"
    >
      <motion.div 
        className="flex items-center mb-4 justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.2 + 0.3 }}
      >
        <div className="h-12 w-12 rounded-full bg-[#255756] flex items-center justify-center">
          <span className="text-2xl text-white">{initial}</span>
        </div>
        <div className="ml-4 text-left">
          <motion.h4 
            className="font-semibold text-[#255756]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.2 + 0.4 }}
          >
            {name}
          </motion.h4>
          <motion.p 
            className="text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.2 + 0.5 }}
          >
            {location}
          </motion.p>
        </div>
      </motion.div>
      <motion.p 
        className="text-gray-700 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.2 + 0.6 }}
      >
        {testimonial}
      </motion.p>
      <motion.div 
        className="mt-4 flex justify-center text-[#F7D566]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.2 + 0.7 }}
      >
        ★★★★★
      </motion.div>
    </motion.div>
  );
}
