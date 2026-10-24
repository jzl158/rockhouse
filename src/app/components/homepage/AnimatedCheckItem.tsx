"use client";

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

interface AnimatedCheckItemProps {
  title: string;
  description: string;
  index: number;
}

export default function AnimatedCheckItem({ title, description, index }: AnimatedCheckItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5,
        delay: index * 0.2 
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 10,
        delay: index * 0.2 + 0.2
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="flex items-start gap-4"
    >
      <motion.div
        variants={iconVariants}
        className="rounded-full p-3 bg-[#F7D566] text-[#255756]"
      >
        <FaCheckCircle className="text-xl" />
      </motion.div>
      <div>
        <motion.h3
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3, delay: index * 0.2 + 0.3 }}
          className="text-xl font-semibold text-[#255756]"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3, delay: index * 0.2 + 0.4 }}
          className="text-gray-600"
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  );
}
