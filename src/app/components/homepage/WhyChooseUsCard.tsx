"use client";

import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface WhyChooseUsCardProps {
  Icon: IconType;
  title: string;
  index: number;
}

export default function WhyChooseUsCard({ Icon, title, index }: WhyChooseUsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      className="rounded-lg p-6 bg-white shadow text-center border-t-4 border-[#F7D566] cursor-pointer"
    >
      <motion.div 
        className="mb-3 flex justify-center"
        whileHover={{ 
          rotate: [0, -10, 10, -10, 0],
          transition: { duration: 0.5 }
        }}
      >
        <Icon className="text-3xl" style={{ color: "#205A57" }} />
      </motion.div>
      <motion.h4 
        className="font-semibold uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
      >
        {title}
      </motion.h4>
    </motion.div>
  );
}
