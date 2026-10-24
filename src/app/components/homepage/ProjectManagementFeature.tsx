"use client";

import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface ProjectManagementFeatureProps {
  Icon: IconType;
  title: string;
  description: string;
  index: number;
}

export default function ProjectManagementFeature({ Icon, title, description, index }: ProjectManagementFeatureProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex items-start gap-3"
    >
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: index * 0.1 + 0.2 
        }}
        whileHover={{ 
          rotate: 360,
          transition: { duration: 0.6 }
        }}
        className="rounded-full p-3 bg-white text-[#255756]"
      >
        <Icon className="text-xl" />
      </motion.div>
      <div>
        <motion.h4
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
          className="font-semibold uppercase text-white"
        >
          {title}
        </motion.h4>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
          className="text-sm text-white/80"
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  );
}
